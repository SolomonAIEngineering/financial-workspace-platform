import { logger, schedules } from '@trigger.dev/sdk/v3';

import { checkInvoiceStatus } from '../operations/check-status';
import { prisma } from '@/server/db';
import { triggerBatch } from '@/jobs/utils/trigger-batch';

/**
 * Schedules invoices to be checked for status
 *
 * @returns Void
 */
export const invoiceScheduler = schedules.task({
  id: 'invoice-scheduler',
  cron: '0 0,12 * * *',
  run: async () => {
    // Only run in production (Set in Trigger.dev)
    if (process.env.TRIGGER_ENVIRONMENT !== 'production') return;

    const invoices = await prisma.invoice.findMany({
      where: {
        status: {
          in: ['UNPAID', 'OVERDUE'],
        },
      },
    });

    if (!invoices) return;

    const formattedInvoices = invoices.map((invoice) => ({
      invoiceId: invoice.id,
    }));

    await triggerBatch(formattedInvoices, checkInvoiceStatus);

    logger.info('Invoice status check jobs started', {
      count: invoices.length,
    });
  },
});
