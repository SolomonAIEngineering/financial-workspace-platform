import { BatchItem, BatchTriggerTask } from '../../../utils/trigger-batch';
import {
  CheckInvoiceStatusInput,
  CheckInvoiceStatusOutput,
  checkInvoiceStatusInputSchema,
  checkInvoiceStatusOutputSchema
} from '../schema';
import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { TZDate } from '@date-fns/tz';
import { Task } from '@trigger.dev/sdk/v3';
import { prisma } from '@solomonai/prisma';
import { updateInvoiceStatus } from '../../../utils/update-invoice';

/**
 * Checks the status of an invoice and updates it if necessary
 *
 * @param invoiceId - The ID of the invoice to check
 * @returns Result object with status information
 */
export const checkInvoiceStatus: Task<
  'check-invoice-status',
  CheckInvoiceStatusInput,
  CheckInvoiceStatusOutput
> = schemaTask({
  id: 'check-invoice-status',
  schema: checkInvoiceStatusInputSchema,
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
      throw new Error('Invoice not found');
    }

    if (!invoice.amount || !invoice.currency || !invoice.dueDate) {
      logger.error('Invoice data is missing');
      throw new Error('Invoice data is missing');
    }

    // Store the previous status for reporting
    const previousStatus = invoice.status;

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

    let wasUpdated = false;

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

      wasUpdated = true;
    } else {
      // Check if the invoice is overdue using TZDate
      const isOverdue =
        new TZDate(invoice.dueDate, timezone) <
        new TZDate(new Date(), timezone);

      // Update invoice status to overdue if it's past due date and currently unpaid
      if (isOverdue && invoice.status === 'UNPAID') {
        await updateInvoiceStatus({
          invoiceId,
          status: 'overdue',
        });
        wasUpdated = true;
      }
    }

    // Get the latest invoice status
    const updatedInvoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },
    });

    if (!updatedInvoice) {
      throw new Error('Failed to retrieve updated invoice');
    }

    // Return success result
    return checkInvoiceStatusOutputSchema.parse({
      success: true,
      invoiceId,
      status: updatedInvoice.status,
      wasUpdated,
      previousStatus: wasUpdated ? previousStatus : null,
    });
  },
});

/**
 * A wrapper for the checkInvoiceStatus task that is compatible with triggerBatch
 */
export const checkInvoiceStatusForBatch: BatchTriggerTask<CheckInvoiceStatusInput> = {
  batchTrigger: (items: BatchItem<CheckInvoiceStatusInput>[]) => {
    // Cast to any to bypass type issues since we know this will work at runtime
    return checkInvoiceStatus.batchTrigger(items) as any;
  }
};
