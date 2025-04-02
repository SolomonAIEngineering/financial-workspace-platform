import { logger } from '@trigger.dev/sdk/v3';
import { prisma } from '@solomonai/prisma/server';
import { sendInvoiceNotifications } from '../tasks/invoice/notifications/send-notifications';

/**
 * Updates the status of an invoice and sends notifications
 *
 * @param invoiceId - The ID of the invoice to update
 * @param status - The status to update the invoice to
 * @returns Void
 */
export async function updateInvoiceStatus({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: 'overdue' | 'paid';
}): Promise<void> {
  const updatedInvoice = await prisma.invoice.update({
    where: {
      id: invoiceId,
    },
    data: {
      status: status === 'paid' ? 'PAID' : 'OVERDUE',
      ...(status === 'paid' ? { paidAt: new Date() } : {}),
    },
  });

  if (
    !updatedInvoice?.invoiceNumber ||
    !updatedInvoice?.teamId ||
    !updatedInvoice?.customerName
  ) {
    logger.error('Invoice data is missing');
    return;
  }

  logger.info(`Invoice status changed to ${status}`);

  await sendInvoiceNotifications.trigger({
    invoiceId,
    invoiceNumber: updatedInvoice.invoiceNumber,
    status: updatedInvoice.status as 'paid' | 'overdue',
    teamId: updatedInvoice.teamId,
    customerName: updatedInvoice.customerName,
  });
}
