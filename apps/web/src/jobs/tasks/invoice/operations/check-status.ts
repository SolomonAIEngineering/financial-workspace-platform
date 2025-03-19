import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { TZDate } from '@date-fns/tz';
import { prisma } from '@/server/db';
import { updateInvoiceStatus } from '@/jobs/utils/update-invoice';
import { z } from 'zod';

/**
 * Checks the status of an invoice and updates it if necessary
 *
 * @param invoiceId - The ID of the invoice to check
 * @returns Void
 */
export const checkInvoiceStatus = schemaTask({
  id: 'check-invoice-status',
  schema: z.object({
    invoiceId: z.string().uuid(),
  }),
  queue: {
    concurrencyLimit: 10,
  },
  run: async ({ invoiceId }) => {
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },
    });

    if (!invoice) {
      logger.error('Invoice not found');
      return;
    }

    if (!invoice.amount || !invoice.currency || !invoice.dueDate) {
      logger.error('Invoice data is missing');
      return;
    }

    // Type assertion for the template JSON field
    const template = invoice.template as { timezone?: string } | null;
    const timezone = template?.timezone || 'UTC';

    // Find recent transactions matching invoice amount and currency
    const transactions = await prisma.transaction.findMany({
      where: {
        amount: invoice.amount,
        isoCurrencyCode: invoice.currency?.toUpperCase(),
        description: {
          contains: invoice.invoiceNumber ?? '',
        },
        merchantName: {
          contains: invoice.customerName ?? '',
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 1,
    });

    // We have a match
    if (transactions && transactions.length === 1) {
      const transactionId = transactions.at(0)?.id;
      const filename = `${invoice.invoiceNumber}.pdf`;

      // Attach the invoice file to the transaction and mark as paid
      await prisma.transactionAttachment.create({
        data: {
          type: 'application/pdf',
          path: invoice.filePath,
          transactionId,
          teamId: invoice.teamId,
          name: filename,
          size: invoice.fileSize,
        },
      });

      await updateInvoiceStatus({
        invoiceId,
        status: 'paid',
      });
    } else {
      // Check if the invoice is overdue
      const isOverdue =
        new TZDate(invoice.dueDate, timezone) <
        new TZDate(new Date(), timezone);

      // Update invoice status to overdue if it's past due date and currently unpaid
      if (isOverdue && invoice.status === 'UNPAID') {
        await updateInvoiceStatus({
          invoiceId,
          status: 'overdue',
        });
      }
    }
  },
});
