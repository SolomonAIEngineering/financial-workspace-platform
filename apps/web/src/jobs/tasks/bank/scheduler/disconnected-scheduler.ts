import { logger, schedules } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { BankConnectionStatus } from '@prisma/client';
import { client } from '@/jobs/client';
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
export const disconnectedSchedulerJob = schedules.task({
  id: BANK_JOBS.DISCONNECTED_NOTIFICATIONS,
  description: 'Disconnected Connections Scheduler',
  cron: '0 12 * * *', // Run daily at noon
  run: async () => {
    await logger.info('Starting disconnected connections scheduler');

    if (process.env.TRIGGER_ENVIRONMENT !== 'production') {
      await logger.info(
        'Disconnected connections scheduler skipped in non-production environment'
      );
      return;
    }

    // Find disconnected connections that need attention
    const disconnectedConnections = await prisma.bankConnection.findMany({
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

    await logger.info(
      `Found ${disconnectedConnections.length} disconnected connections`
    );

    // Process each disconnected connection
    let notificationsSent = 0;

    for (const connection of disconnectedConnections) {
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
    }

    // Auto-disable connections that have been in error state for too long
    const abandonedConnections = await prisma.bankConnection.findMany({
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

    let disabledCount = 0;

    for (const connection of abandonedConnections) {
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
    }

    await logger.info(
      `Completed scheduler run. Sent ${notificationsSent} notifications and disabled ${disabledCount} abandoned connections`
    );

    return {
      connectionsProcessed: disconnectedConnections.length,
      disabledCount,
      notificationsSent,
    };
  },
});
