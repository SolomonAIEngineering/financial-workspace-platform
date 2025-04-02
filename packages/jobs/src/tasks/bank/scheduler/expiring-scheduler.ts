import {
  ExpiringConnection,
  ExpiringSchedulerResult,
  expiringSchedulerResultSchema
} from './schema';
import { differenceInDays, subDays } from 'date-fns';
import { logger, schedules, tasks } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { BankConnectionStatus } from '@solomonai/prisma/client';
import { expiringNotifications } from '../notifications/expiring';
import { prisma } from '@solomonai/prisma/server';

// Constants
const EXPIRING_THRESHOLD_DAYS = 20;
const EXPIRED_THRESHOLD_DAYS = 30;
const NOTIFICATION_COOLDOWN_DAYS = 7;

/**
 * Finds bank connections approaching expiration due to inactivity
 * 
 * @param expiringThreshold - Date threshold for connections that haven't been accessed since
 * @returns Array of bank connections that are potentially expiring
 */
async function findExpiringConnections(expiringThreshold: Date) {
  return prisma.bankConnection.findMany({
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
      team: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    where: {
      lastAccessedAt: {
        lt: expiringThreshold,
      },
      // Only get connections that haven't been notified recently
      lastExpiryNotifiedAt: {
        lt: subDays(new Date(), NOTIFICATION_COOLDOWN_DAYS),
      },
      status: BankConnectionStatus.ACTIVE,
    },
  });
}

/**
 * Finds bank connections that have likely already expired due to prolonged inactivity
 * 
 * @param expiredThreshold - Date threshold for connections that haven't been accessed since
 * @returns Array of bank connections that are likely expired
 */
async function findExpiredConnections(expiredThreshold: Date) {
  return prisma.bankConnection.findMany({
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
      team: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    where: {
      lastAccessedAt: {
        lt: expiredThreshold,
      },
      status: BankConnectionStatus.ACTIVE,
    },
  });
}

/**
 * Calculates inactivity metrics for a connection
 * 
 * @param connection - The bank connection to analyze
 * @returns Object containing days inactive and days until expiry
 */
function calculateInactivityMetrics(connection: ExpiringConnection) {
  const daysInactive = differenceInDays(
    new Date(),
    new Date(connection.lastAccessedAt || new Date())
  );
  const daysUntilExpiry = EXPIRED_THRESHOLD_DAYS - daysInactive;

  return {
    daysInactive,
    daysUntilExpiry: Math.max(0, daysUntilExpiry),
  };
}

/**
 * Sends an expiration notification to a user
 * 
 * @param connection - The connection that is expiring
 * @param metrics - Inactivity metrics for the connection
 * @returns Boolean indicating if the notification was sent successfully
 */
async function sendExpirationNotification(
  connection: ExpiringConnection,
  metrics: { daysInactive: number; daysUntilExpiry: number }
): Promise<boolean> {
  try {
    // Skip if no email or no active accounts
    if (!connection.user.email || connection.accounts.length === 0) {
      logger.info(`Skipping notification for connection ${connection.id} - no email or active accounts`);
      return false;
    }

    // Send notification to user
    await tasks.trigger<typeof expiringNotifications>('expiring-notifications', {
      users: [
        {
          expiresAt: connection.expiresAt
            ? connection.expiresAt.toISOString()
            : new Date().toISOString(),
          user: {
            id: connection.user.id,
            email: connection.user.email || "",
            full_name: connection.user.name || "User",
            locale: "en-US",
          },
          teamName: connection.team?.[0]?.name || "Personal Finance",
          bankName: connection.institutionName,
          teamSlug: connection.team?.[0]?.slug || "personal",
        },
      ],
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
          daysInactive: metrics.daysInactive,
          daysUntilExpiry: metrics.daysUntilExpiry,
        },
        type: 'NOTIFICATION_SENT',
        userId: connection.user.id,
      },
    });

    logger.info(`Sent expiration notification for connection ${connection.id}`, {
      connectionId: connection.id,
      daysInactive: metrics.daysInactive,
      daysUntilExpiry: metrics.daysUntilExpiry,
      institutionName: connection.institutionName,
    });

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error(`Failed to notify user for expiring connection ${connection.id}`, {
      connectionId: connection.id,
      userId: connection.user.id,
      error: errorMessage,
    });

    return false;
  }
}

/**
 * Marks a connection as requiring attention due to expiration
 * 
 * @param connection - The connection to mark as requiring attention
 * @returns Boolean indicating if the operation was successful
 */
async function markConnectionAsRequiringAttention(
  connection: ExpiringConnection
): Promise<boolean> {
  try {
    // Mark as requiring attention
    await prisma.bankConnection.update({
      data: {
        errorMessage: 'Connection may have expired due to inactivity',
        status: BankConnectionStatus.REQUIRES_ATTENTION,
      },
      where: { id: connection.id },
    });

    logger.info(`Marked connection ${connection.id} as requiring attention`, {
      connectionId: connection.id,
      institutionName: connection.institutionName,
    });

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error(`Failed to mark expired connection ${connection.id}`, {
      connectionId: connection.id,
      error: errorMessage,
    });

    return false;
  }
}

/**
 * Process all connections that are approaching expiration
 * 
 * @param connections - The connections to process
 * @param span - The trace span for logging
 * @returns Number of notifications sent
 */
async function processExpiringConnections(
  connections: ExpiringConnection[],
  span: any
): Promise<number> {
  let notificationsSent = 0;

  span.setAttribute('connectionsToProcess', connections.length);

  for (const connection of connections) {
    // Skip if connection doesn't have the necessary data
    if (!connection.user.email || connection.accounts.length === 0) {
      continue;
    }

    const metrics = calculateInactivityMetrics(connection);

    span.setAttribute(`connection_${connection.id}_daysInactive`, metrics.daysInactive);
    span.setAttribute(`connection_${connection.id}_daysUntilExpiry`, metrics.daysUntilExpiry);

    const success = await sendExpirationNotification(connection, metrics);

    if (success) {
      notificationsSent++;
    }
  }

  return notificationsSent;
}

/**
 * Process all connections that have likely already expired
 * 
 * @param connections - The connections to process
 * @param span - The trace span for logging
 * @returns Number of connections marked as requiring attention
 */
async function processExpiredConnections(
  connections: ExpiringConnection[],
  span: any
): Promise<number> {
  let markedForAttention = 0;

  span.setAttribute('connectionsToMark', connections.length);

  for (const connection of connections) {
    const success = await markConnectionAsRequiringAttention(connection);

    if (success) {
      markedForAttention++;
    }
  }

  return markedForAttention;
}

/**
 * Scheduled task that proactively identifies bank connections approaching
 * expiration due to inactivity and notifies users to maintain uninterrupted
 * access.
 *
 * @remarks
 *   This scheduler performs three primary functions:
 *
 *   1. Finds connections that haven't been accessed in 20+ days (approaching
 *        expiration)
 *   2. Sends proactive notifications to users to remind them to use their
 *        connections
 *   3. Automatically marks connections as requiring attention if they've been
 *        inactive for 30+ days (likely already expired)
 *
 *   This task helps maintain uninterrupted access to financial data by
 *   proactively alerting users before their connections expire, reducing
 *   service disruptions. It implements error handling, retry mechanisms, and
 *   comprehensive tracing.
 *
 * @example
 *   The job runs automatically every day at 10 AM, but can be triggered manually:
 *   ```ts
 *   await client.sendEvent({
 *     name: 'run-job',
 *     payload: {
 *       jobId: 'expiring-scheduler-job',
 *     },
 *   });
 *   ```
 *
 * @returns A summary object containing information about connections processed,
 *   notifications sent, and connections marked for attention
 */
export const expiringSchedulerJob = schedules.task({
  id: BANK_JOBS.EXPIRING_SCHEDULER,
  description: 'Expiring Connections Scheduler',
  cron: '0 10 * * *', // Run daily at 10 AM
  /**
   * Configure retry behavior for the scheduled task
   *
   * @see https://trigger.dev/docs/errors-retrying
   */
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 120000,
    randomize: true,
  },
  /**
   * Main execution function for the expiring connections scheduler
   *
   * @param payload - The scheduler payload (empty for scheduled jobs)
   * @param ctx - The execution context provided by Trigger.dev
   * @returns A summary object with counts of connections processed and actions taken
   * @throws Error if the process fails
   */
  run: async (payload, ctx): Promise<ExpiringSchedulerResult> => {
    try {
      // Create a trace for the entire operation
      return await logger.trace(
        'expiring-connections-scheduler',
        async (span) => {
          span.setAttribute('scheduledAt', new Date().toISOString());
          logger.info('Starting expiring connections scheduler');

          // Skip in non-production environments
          if (process.env.TRIGGER_ENVIRONMENT !== 'production') {
            logger.info(
              'Expiring connections scheduler skipped in non-production environment'
            );
            return expiringSchedulerResultSchema.parse({
              connectionsProcessed: 0,
              markedForAttention: 0,
              notificationsSent: 0,
              skipped: true,
              environment: process.env.TRIGGER_ENVIRONMENT,
            });
          }

          // Define the thresholds for expiring and expired connections
          const expiringThreshold = subDays(new Date(), EXPIRING_THRESHOLD_DAYS);
          const expiredThreshold = subDays(new Date(), EXPIRED_THRESHOLD_DAYS);

          span.setAttribute('expiringThreshold', expiringThreshold.toISOString());
          span.setAttribute('expiredThreshold', expiredThreshold.toISOString());

          // Find potentially expiring and expired connections
          const expiringConnections = await findExpiringConnections(expiringThreshold);
          const expiredConnections = await findExpiredConnections(expiredThreshold);

          span.setAttribute('expiringConnectionsCount', expiringConnections.length);
          span.setAttribute('expiredConnectionsCount', expiredConnections.length);

          logger.info(
            `Found ${expiringConnections.length} potentially expiring connections and ${expiredConnections.length} expired connections`
          );

          // Process expiring connections
          const notificationsSent = await logger.trace(
            'process-expiring-connections',
            (subSpan) => processExpiringConnections(expiringConnections as ExpiringConnection[], subSpan)
          );

          // Process expired connections
          const markedForAttention = await logger.trace(
            'mark-expired-connections',
            (markSpan) => processExpiredConnections(expiredConnections as ExpiringConnection[], markSpan)
          );

          logger.info(
            `Completed scheduler run. Sent ${notificationsSent} notifications and marked ${markedForAttention} connections as requiring attention`
          );

          return expiringSchedulerResultSchema.parse({
            connectionsProcessed: expiringConnections.length,
            markedForAttention,
            notificationsSent,
            skipped: false,
          });
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      logger.error('Failed to process expiring connections', {
        error: errorMessage,
      });

      // Propagate error with context
      throw new Error(
        `Failed to process expiring connections: ${errorMessage}`
      );
    }
  },
});
