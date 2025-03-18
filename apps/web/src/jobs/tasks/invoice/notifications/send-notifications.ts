import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { handleOverdueInvoiceNotifications } from '@/jobs/utils/invoice-notifications';
import { handlePaidInvoiceNotifications } from '@/jobs/utils/invoice-notifications';
import { prisma } from '@/server/db';
import { z } from 'zod';

export const sendInvoiceNotifications = schemaTask({
  id: 'invoice-notifications',
  schema: z.object({
    invoiceId: z.string().uuid(),
    invoiceNumber: z.string(),
    status: z.enum(['paid', 'overdue']),
    teamId: z.string(),
    customerName: z.string(),
  }),
  run: async ({ invoiceId, invoiceNumber, status, teamId, customerName }) => {
    const user = await prisma.usersOnTeam.findFirst({
      where: {
        teamId,
        role: 'OWNER',
      },
    });

    if (!user) {
      logger.error('User not found');
      return;
    }

    switch (status) {
      case 'paid':
        await handlePaidInvoiceNotifications({
          user: [user],
          invoiceId,
          invoiceNumber,
        });
        break;
      case 'overdue':
        await handleOverdueInvoiceNotifications({
          user: [user],
          invoiceId,
          invoiceNumber,
          customerName,
        });
        break;
    }
  },
});
