import {
  SendInvoiceNotificationsInput,
  SendInvoiceNotificationsOutput,
  sendInvoiceNotificationsInputSchema,
  sendInvoiceNotificationsOutputSchema
} from '../schema';
import { handleOverdueInvoiceNotifications, handlePaidInvoiceNotifications } from '../../../utils/invoice-notifications';
import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { Task } from '@trigger.dev/sdk/v3';
import { TeamRole } from '@solomonai/prisma';
import { prisma } from '@solomonai/prisma/server';

/**
 * Task that sends notifications for invoice status changes
 * 
 * This task handles sending notifications (both in-app and email) when
 * an invoice is paid or becomes overdue.
 */
export const sendInvoiceNotifications: Task<
  'invoice-notifications',
  SendInvoiceNotificationsInput,
  SendInvoiceNotificationsOutput
> = schemaTask({
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
        role: TeamRole.OWNER,
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

      // Return the result using the output schema
      return sendInvoiceNotificationsOutputSchema.parse({
        success,
        notificationType: status,
        recipientCount: recipientList.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to send invoice ${status} notifications: ${errorMessage}`);

      // Return error result using the output schema
      return sendInvoiceNotificationsOutputSchema.parse({
        success: false,
        notificationType: status,
        recipientCount: 0,
      });
    }
  },
});
