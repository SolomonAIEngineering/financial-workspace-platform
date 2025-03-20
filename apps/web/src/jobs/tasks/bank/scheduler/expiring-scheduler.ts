import { differenceInDays, subDays } from 'date-fns';
import { logger, schedules } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { BankConnectionStatus } from '@solomonai/prisma/client';
import { client } from '@/jobs';
import { prisma } from '@/server/db';

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
 * @example
 *   The job runs automatically every day at 10 AM, but can be triggered manually:
 *   ```ts
 *   await client.sendEvent({
 *   name: 'run-job',
 *   payload: {
 *   jobId: 'expiring-scheduler-job',
 *   },
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
   * @returns A summary object with counts of connections processed and actions
   *   taken
   * @throws Error if the process fails
   */
  run: async (payload, ctx) => {
    try {
      // Create a trace for the entire operation
      return await logger.trace(
        'expiring-connections-scheduler',
        async (span) => {
          span.setAttribute('scheduledAt', new Date().toISOString());
          logger.info('Starting expiring connections scheduler');

          if (process.env.TRIGGER_ENVIRONMENT !== 'production') {
            logger.info(
              'Expiring connections scheduler skipped in non-production environment'
            );
            return {
              connectionsProcessed: 0,
              markedForAttention: 0,
              notificationsSent: 0,
              skipped: true,
              environment: process.env.TRIGGER_ENVIRONMENT,
            };
          }

          // Plaid tokens typically expire after 30 days of inactivity
          const expiringThreshold = subDays(new Date(), 20);
          span.setAttribute(
            'expiringThreshold',
            expiringThreshold.toISOString()
          );

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

          span.setAttribute(
            'expiringConnectionsCount',
            expiringConnections.length
          );
          logger.info(
            `Found ${expiringConnections.length} potentially expiring connections`
          );

          // Process each expiring connection
          let notificationsSent = 0;

          // Use a sub-trace for the notification process
          await logger.trace(
            'process-expiring-connections',
            async (subSpan) => {
              subSpan.setAttribute(
                'connectionsToProcess',
                expiringConnections.length
              );

              for (const connection of expiringConnections) {
                // Skip if no email or no active accounts
                if (
                  !connection.user.email ||
                  connection.accounts.length === 0
                ) {
                  continue;
                }

                try {
                  const daysInactive = differenceInDays(
                    new Date(),
                    new Date(connection.lastAccessedAt || new Date())
                  );
                  const daysUntilExpiry = 30 - daysInactive;

                  subSpan.setAttribute(
                    `connection_${connection.id}_daysInactive`,
                    daysInactive
                  );
                  subSpan.setAttribute(
                    `connection_${connection.id}_daysUntilExpiry`,
                    daysUntilExpiry
                  );

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

                  logger.info(
                    `Sent expiration notification for connection ${connection.id}`,
                    {
                      connectionId: connection.id,
                      daysInactive,
                      daysUntilExpiry,
                      institutionName: connection.institutionName,
                    }
                  );
                } catch (notificationError) {
                  const errorMessage =
                    notificationError instanceof Error
                      ? notificationError.message
                      : 'Unknown error';

                  logger.error(
                    `Failed to notify user for expiring connection ${connection.id}`,
                    {
                      connectionId: connection.id,
                      userId: connection.user.id,
                      error: errorMessage,
                    }
                  );

                  // Continue with other connections even if one fails
                }
              }
            }
          );

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

          span.setAttribute(
            'expiredConnectionsCount',
            expiredConnections.length
          );
          let markedForAttention = 0;

          // Use a sub-trace for the mark-for-attention process
          await logger.trace('mark-expired-connections', async (markSpan) => {
            markSpan.setAttribute(
              'connectionsToMark',
              expiredConnections.length
            );

            for (const connection of expiredConnections) {
              try {
                // Mark as requiring attention
                await prisma.bankConnection.update({
                  data: {
                    errorMessage:
                      'Connection may have expired due to inactivity',
                    status: BankConnectionStatus.REQUIRES_ATTENTION,
                  },
                  where: { id: connection.id },
                });

                markedForAttention++;

                logger.info(
                  `Marked connection ${connection.id} as requiring attention`,
                  {
                    connectionId: connection.id,
                    institutionName: connection.institutionName,
                  }
                );
              } catch (markError) {
                const errorMessage =
                  markError instanceof Error
                    ? markError.message
                    : 'Unknown error';

                logger.error(
                  `Failed to mark expired connection ${connection.id}`,
                  {
                    connectionId: connection.id,
                    error: errorMessage,
                  }
                );

                // Continue with other connections even if one fails
              }
            }
          });

          logger.info(
            `Completed scheduler run. Sent ${notificationsSent} notifications and marked ${markedForAttention} connections as requiring attention`
          );

          return {
            connectionsProcessed: expiringConnections.length,
            markedForAttention,
            notificationsSent,
            skipped: false,
          };
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
  /**
   * Custom error handler to control retry behavior based on error type
   *
   * @param payload - The task payload
   * @param error - The error that occurred
   * @param options - Options object containing context and retry control
   * @returns Retry instructions or undefined to use default retry behavior
   */
  handleError: async (payload, error, { ctx, retryAt }) => {
    // If it's a database connection error, wait longer before retry
    if (
      error instanceof Error &&
      error.message.includes('database connection')
    ) {
      return {
        retryAt: new Date(Date.now() + 60000), // Wait at least 1 minute
      };
    }

    // If it's a notification service error, try again sooner
    if (
      error instanceof Error &&
      error.message.includes('notification service')
    ) {
      return {
        retryAt: new Date(Date.now() + 30000), // Try again after 30 seconds
      };
    }

    // For other errors, use the default retry strategy
    return;
  },
});
