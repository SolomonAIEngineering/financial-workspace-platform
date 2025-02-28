import { BankConnectionStatus } from '@prisma/client';
import { cronTrigger } from '@trigger.dev/sdk';
import { subDays } from 'date-fns';

import { prisma } from '@/server/db';

import { client } from '../../../client';

/**
 * This job runs on a schedule to find disconnected bank connections and
 * notifies users about them. It helps maintain data quality by ensuring users
 * reconnect their accounts when needed.
 */
export const disconnectedSchedulerJob = client.defineJob({
  id: 'disconnected-scheduler-job',
  name: 'Disconnected Connections Scheduler',
  trigger: cronTrigger({
    cron: '0 12 * * *', // Run daily at noon
  }),
  version: '1.0.0',
  run: async (payload, io) => {
    await io.logger.info('Starting disconnected connections scheduler');

    // Find disconnected connections that need attention
    const disconnectedConnections = await io.runTask(
      'find-disconnected-connections',
      async () => {
        return await prisma.bankConnection.findMany({
          include: {
            accounts: {
              select: {
                id: true,
                name: true,
              },
              where: {
                enabled: true,
              },
            },
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
          where: {
            // Only get connections that haven't been notified in the last 3 days
            lastNotifiedAt: {
              lt: subDays(new Date(), 3),
            },
            status: {
              in: [
                BankConnectionStatus.ERROR,
                BankConnectionStatus.LOGIN_REQUIRED,
                BankConnectionStatus.REQUIRES_ATTENTION,
              ],
            },
          },
        });
      }
    );

    await io.logger.info(
      `Found ${disconnectedConnections.length} disconnected connections`
    );

    // Process each disconnected connection
    let notificationsSent = 0;

    for (const connection of disconnectedConnections) {
      await io.runTask(`process-disconnected-${connection.id}`, async () => {
        // Skip if no email or no active accounts
        if (!connection.user.email || connection.accounts.length === 0) {
          return;
        }

        // Send notification to user
        await client.sendEvent({
          name: 'disconnected-notification-trigger',
          payload: {
            accountCount: connection.accounts.length,
            connectionId: connection.id,
            email: connection.user.email,
            institutionName: connection.institutionName,
            name: connection.user.name,
            status: connection.status,
            userId: connection.user.id,
          },
        });

        // Update last notified timestamp
        await prisma.bankConnection.update({
          data: {
            lastNotifiedAt: new Date(),
            notificationCount: { increment: 1 },
          },
          where: { id: connection.id },
        });

        // Record this activity
        await prisma.userActivity.create({
          data: {
            detail: `Disconnected connection notification for ${connection.institutionName}`,
            metadata: {
              connectionId: connection.id,
              status: connection.status,
            },
            type: 'NOTIFICATION_SENT',
            userId: connection.user.id,
          },
        });

        notificationsSent++;
      });
    }

    // Auto-disable connections that have been in error state for too long
    const abandonedConnections = await io.runTask(
      'find-abandoned-connections',
      async () => {
        return await prisma.bankConnection.findMany({
          where: {
            // Connections that have been in error state for more than 30 days
            AND: [
              {
                lastStatusChangedAt: {
                  lt: subDays(new Date(), 30),
                },
              },
              {
                notificationCount: {
                  gte: 5, // At least 5 notifications have been sent
                },
              },
            ],
            status: {
              in: [
                BankConnectionStatus.ERROR,
                BankConnectionStatus.LOGIN_REQUIRED,
                BankConnectionStatus.REQUIRES_ATTENTION,
              ],
            },
          },
        });
      }
    );

    let disabledCount = 0;

    for (const connection of abandonedConnections) {
      await io.runTask(`disable-abandoned-${connection.id}`, async () => {
        // Disable the connection
        await prisma.bankConnection.update({
          data: {
            disabled: true,
            status: BankConnectionStatus.DISCONNECTED,
          },
          where: { id: connection.id },
        });

        // Disable all accounts for this connection
        await prisma.bankAccount.updateMany({
          data: {
            enabled: false,
            status: 'DISCONNECTED',
          },
          where: { bankConnectionId: connection.id },
        });

        disabledCount++;
      });
    }

    await io.logger.info(
      `Completed scheduler run. Sent ${notificationsSent} notifications and disabled ${disabledCount} abandoned connections`
    );

    return {
      connectionsProcessed: disconnectedConnections.length,
      disabledCount,
      notificationsSent,
    };
  },
});
