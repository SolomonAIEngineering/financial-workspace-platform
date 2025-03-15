import { differenceInDays, subDays } from 'date-fns';

import { BANK_JOBS } from '../../constants';
import { BankConnectionStatus } from '@prisma/client';
import { client } from '@/jobs';
import { logger } from '@trigger.dev/sdk/v3';
import { prisma } from '@/server/db';
import { schedules } from '@trigger.dev/sdk/v3';

/**
 * This job proactively identifies bank connections that may be approaching
 * expiration due to inactivity. Many banking integrations (like Plaid) will
 * expire user access tokens after a period of inactivity (typically 30 days).
 *
 * The job performs these key functions:
 *
 * 1. Finds connections that haven't been accessed in 20+ days (approaching
 *    expiration)
 * 2. Sends proactive notifications to users to remind them to use their
 *    connections
 * 3. Automatically marks connections as requiring attention if they've been
 *    inactive for 30+ days (likely already expired)
 *
 * This job helps maintain uninterrupted access to financial data by proactively
 * alerting users before their connections expire, reducing service
 * disruptions.
 *
 * @file Expiring Bank Connections Scheduler
 * @example
 *   // The job runs automatically every day at 10 AM, but can be triggered manually:
 *   await client.sendEvent({
 *     name: 'run-job',
 *     payload: {
 *       jobId: 'expiring-schedsuler-job',
 *     },
 *   });
 *
 * @example
 *   // The job returns a summary of its actions:
 *   {
 *   connectionsProcessed: 15,   // Number of expiring connections found
 *   notificationsSent: 12,      // Number of notifications sent to users
 *   markedForAttention: 7       // Number of connections marked as requiring attention
 *   }
 */
export const expiringSchedulerJob = schedules.task({
  id: BANK_JOBS.EXPIRING_SCHEDULER,
  description: 'Expiring Connections Scheduler',
  cron: '0 10 * * *', // Run daily at 10 AM
  run: async () => {
    await logger.info('Starting expiring connections scheduler');
    if (process.env.TRIGGER_ENVIRONMENT !== 'production') {
      await logger.info(
        'Expiring connections scheduler skipped in non-production environment'
      );
      return;
    }

    // Plaid tokens typically expire after 30 days of inactivity
    const expiringThreshold = subDays(new Date(), 20);

    // Find potentially expiring connections
    const expiringConnections = await prisma.bankConnection.findMany({
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
        lastAccessedAt: {
          lt: expiringThreshold,
        },
        // Only get connections that haven't been notified about expiring in the last 7 days
        lastExpiryNotifiedAt: {
          lt: subDays(new Date(), 7),
        },
        status: BankConnectionStatus.ACTIVE,
      },
    });

    await logger.info(
      `Found ${expiringConnections.length} potentially expiring connections`
    );

    // Process each expiring connection
    let notificationsSent = 0;

    for (const connection of expiringConnections) {
      // Skip if no email or no active accounts
      if (!connection.user.email || connection.accounts.length === 0) {
        return;
      }

      const daysInactive = differenceInDays(
        new Date(),
        new Date(connection.lastAccessedAt || new Date())
      );
      const daysUntilExpiry = 30 - daysInactive;

      // Send notification to user
      await client.sendEvent({
        name: 'expiring-notification-trigger',
        payload: {
          accountCount: connection.accounts.length,
          connectionId: connection.id,
          daysInactive,
          daysUntilExpiry,
          email: connection.user.email,
          institutionName: connection.institutionName,
          name: connection.user.name,
          userId: connection.user.id,
        },
      });

      // Update last notified timestamp
      await prisma.bankConnection.update({
        data: {
          expiryNotificationCount: { increment: 1 },
          lastExpiryNotifiedAt: new Date(),
        },
        where: { id: connection.id },
      });

      // Record this activity
      await prisma.userActivity.create({
        data: {
          detail: `Expiring connection notification for ${connection.institutionName}`,
          metadata: {
            connectionId: connection.id,
            daysInactive,
            daysUntilExpiry,
          },
          type: 'NOTIFICATION_SENT',
          userId: connection.user.id,
        },
      });

      notificationsSent++;
    }

    // For connections that have likely already expired (no activity in 30+ days),
    // mark them as requiring attention
    const expiredConnections = await prisma.bankConnection.findMany({
      where: {
        lastAccessedAt: {
          lt: subDays(new Date(), 30),
        },
        status: BankConnectionStatus.ACTIVE,
      },
    });

    let markedForAttention = 0;

    for (const connection of expiredConnections) {
      // Mark as requiring attention
      await prisma.bankConnection.update({
        data: {
          errorMessage: 'Connection may have expired due to inactivity',
          status: BankConnectionStatus.REQUIRES_ATTENTION,
        },
        where: { id: connection.id },
      });

      markedForAttention++;
    }

    await logger.info(
      `Completed scheduler run. Sent ${notificationsSent} notifications and marked ${markedForAttention} connections as requiring attention`
    );

    return {
      connectionsProcessed: expiringConnections.length,
      markedForAttention,
      notificationsSent,
    };
  },
});
