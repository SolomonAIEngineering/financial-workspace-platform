import { logger, schedules } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { BankConnectionStatus } from '@prisma/client';
import { client } from '@/jobs/client';
import { prisma } from '@/server/db';
import { subDays } from 'date-fns';

/**
 * Scheduled task that identifies and processes bank connections that are in a
 * disconnected or error state. It runs on a daily schedule to maintain data
 * quality and user experience.
 *
 * @remarks
 *   This scheduler performs three primary functions:
 *
 *   1. Find bank connections that are in an error state and need attention
 *   2. Send notifications to users about these disconnected connections
 *   3. Automatically disable connections that have been in an error state for an
 *        extended period despite multiple notifications
 *
 *   This task implements error handling, retry mechanisms, and comprehensive
 *   tracing to ensure reliable execution in production environments.
 * @example
 *   The job runs automatically every day at noon, but can be triggered manually:
 *   ```ts
 *   await client.sendEvent({
 *   name: 'run-job',
 *   payload: {
 *   jobId: 'disconnected-scheduler-job',
 *   },
 *   });
 *   ```
 *
 * @returns A summary object containing information about connections processed,
 *   notifications sent, and connections disabled
 */
export const disconnectedSchedulerJob = schedules.task({
  id: BANK_JOBS.DISCONNECTED_NOTIFICATIONS,
  description: 'Disconnected Connections Scheduler',
  cron: '0 12 * * *', // Run daily at noon
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
   * Main execution function for the disconnected connections scheduler
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
        'disconnected-connections-scheduler',
        async (span) => {
          span.setAttribute('scheduledAt', new Date().toISOString());
          logger.info('Starting disconnected connections scheduler');

          if (process.env.TRIGGER_ENVIRONMENT !== 'production') {
            logger.info(
              'Disconnected connections scheduler skipped in non-production environment'
            );
            return {
              connectionsProcessed: 0,
              disabledCount: 0,
              notificationsSent: 0,
              skipped: true,
              environment: process.env.TRIGGER_ENVIRONMENT,
            };
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

          span.setAttribute(
            'disconnectedConnectionsCount',
            disconnectedConnections.length
          );
          logger.info(
            `Found ${disconnectedConnections.length} disconnected connections`
          );

          // Process each disconnected connection
          let notificationsSent = 0;

          // Use a sub-trace for the notification process
          await logger.trace(
            'process-disconnected-connections',
            async (subSpan) => {
              subSpan.setAttribute(
                'connectionsToProcess',
                disconnectedConnections.length
              );

              for (const connection of disconnectedConnections) {
                // Skip if no email or no active accounts
                if (
                  !connection.user.email ||
                  connection.accounts.length === 0
                ) {
                  continue;
                }

                try {
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
                } catch (notificationError) {
                  const errorMessage =
                    notificationError instanceof Error
                      ? notificationError.message
                      : 'Unknown error';

                  logger.error(
                    `Failed to notify user for connection ${connection.id}`,
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

          span.setAttribute(
            'abandonedConnectionsCount',
            abandonedConnections.length
          );
          let disabledCount = 0;

          // Use a sub-trace for the disable process
          await logger.trace(
            'disable-abandoned-connections',
            async (disableSpan) => {
              disableSpan.setAttribute(
                'connectionsToDisable',
                abandonedConnections.length
              );

              for (const connection of abandonedConnections) {
                try {
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
                } catch (disableError) {
                  const errorMessage =
                    disableError instanceof Error
                      ? disableError.message
                      : 'Unknown error';

                  logger.error(
                    `Failed to disable abandoned connection ${connection.id}`,
                    {
                      connectionId: connection.id,
                      error: errorMessage,
                    }
                  );

                  // Continue with other connections even if one fails
                }
              }
            }
          );

          logger.info(
            `Completed scheduler run. Sent ${notificationsSent} notifications and disabled ${disabledCount} abandoned connections`
          );

          return {
            connectionsProcessed: disconnectedConnections.length,
            disabledCount,
            notificationsSent,
            skipped: false,
          };
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      logger.error('Failed to process disconnected connections', {
        error: errorMessage,
      });

      // Propagate error with context
      throw new Error(
        `Failed to process disconnected connections: ${errorMessage}`
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
    return undefined;
  },
});
