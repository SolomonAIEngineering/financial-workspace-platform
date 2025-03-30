import {
  SendInvoiceNotificationsInput,
  SendInvoiceNotificationsOutput,
  sendInvoiceNotificationsInputSchema
} from '../schema';
import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { handleOverdueInvoiceNotifications } from '@/jobs/utils/invoice-notifications';
import { handlePaidInvoiceNotifications } from '@/jobs/utils/invoice-notifications';
import { prisma } from '@solomonai/prisma';

/**
 * Task that sends notifications for invoice status changes
 * 
 * This task handles sending notifications (both in-app and email) when
 * an invoice is paid or becomes overdue.
 */
export const sendInvoiceNotifications = schemaTask({
  id: 'invoice-notifications',
  schema: sendInvoiceNotificationsInputSchema,
  run: async ({
    invoiceId,
    invoiceNumber,
    status,
    teamId,
    customerName
  }: SendInvoiceNotificationsInput): Promise<SendInvoiceNotificationsOutput> => {
    // Find the team owner who should receive the notification
    const user = await prisma.usersOnTeam.findFirst({
      where: {
        teamId,
        role: 'OWNER',
      },
    });

    if (!user) {
      logger.error('User not found');
      throw new Error('Team owner not found');
    }

    // Format user for notifications
    const recipientList = [user];
    let success = false;

    try {
      // Send different notifications based on invoice status
      switch (status) {
        case 'paid':
          await handlePaidInvoiceNotifications({
            user: recipientList,
            invoiceId,
            invoiceNumber,
            customerName
          });
          success = true;
          break;
        case 'overdue':
          await handleOverdueInvoiceNotifications({
            user: recipientList,
            invoiceId,
            invoiceNumber,
            customerName,
          });
          success = true;
          break;
      }

      // Return the result
      return {
        success,
        notificationType: status,
        recipientCount: recipientList.length,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to send invoice ${status} notifications: ${errorMessage}`);

      // Return error result
      return {
        success: false,
        notificationType: status,
        recipientCount: 0,
      };
    }
  },
});
