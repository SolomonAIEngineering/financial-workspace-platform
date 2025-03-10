import { BANK_JOBS } from '../../constants';
import { BankConnectionStatus } from '@prisma/client';
import { client } from '../../../client';
import { cronTrigger } from '@trigger.dev/sdk';
import { prisma } from '@/server/db';
import { subDays } from 'date-fns';

/**
 * This job identifies and processes bank connections that are in a disconnected
 * or error state. It runs on a daily schedule to:
 *
 * 1. Find bank connections that are in an error state and need attention
 * 2. Send notifications to users about these disconnected connections
 * 3. Automatically disable connections that have been in an error state for an
 *    extended period despite multiple notifications
 *
 * This job is critical for maintaining data quality by ensuring users reconnect
 * their accounts when needed, or by disabling abandoned connections that are no
 * longer being maintained.
 *
 * @file Disconnected Bank Connections Scheduler
 * @example
 *   // The job runs automatically every day at noon, but can be triggered manually:
 *   await client.sendEvent({
 *     name: 'run-job',
 *     payload: {
 *       jobId: 'disconnected-scheduler-job',
 *     },
 *   });
 *
 * @example
 *   // The job returns a summary of its actions:
 *   {
 *   connectionsProcessed: 12,  // Number of disconnected connections found
 *   notificationsSent: 8,      // Number of notifications sent to users
 *   disabledCount: 3           // Number of abandoned connections disabled
 *   }
 */
export const disconnectedSchedulerJob = client.defineJob({
  id: BANK_JOBS.DISCONNECTED_NOTIFICATIONS,
  name: 'Disconnected Connections Scheduler',
  trigger: cronTrigger({
    cron: '0 12 * * *', // Run daily at noon
  }),
  version: '1.0.0',
  /**
   * Main job execution function that processes disconnected connections
   *
   * @param payload - The job payload (empty for cron jobs)
   * @param io - The I/O context provided by Trigger.dev for logging, running
   *   tasks, etc.
   * @returns A result object containing counts of connections processed,
   *   notifications sent, and connections disabled
   */
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
