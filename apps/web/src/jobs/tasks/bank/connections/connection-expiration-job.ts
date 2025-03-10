import { BANK_JOBS } from '../../constants';
import { client } from '../../../client';
import { cronTrigger } from '@trigger.dev/sdk';
import { differenceInDays } from 'date-fns';
import { prisma } from '@/server/db';

/**
 * Constants defining the thresholds for connection expiration notifications.
 * WARNING_DAYS is when users get their first notification. CRITICAL_DAYS is
 * when users get a more urgent notification.
 */
const WARNING_DAYS = 14;
const CRITICAL_DAYS = 3;

/**
 * This job monitors bank connections that are approaching expiration and
 * proactively notifies users to reconnect their accounts, helping prevent
 * disruption of financial data syncing.
 *
 * The job sends two types of notifications based on expiration timeframes:
 *
 * - Warning notifications: Sent when a connection will expire within
 *   {@link WARNING_DAYS} days
 * - Critical notifications: Sent when a connection will expire within
 *   {@link CRITICAL_DAYS} days
 *
 * @file Connection Expiration Monitoring Job
 * @example
 *   // Manually trigger the connection expiration job
 *   await client.sendEvent({
 *     name: 'run-job',
 *     payload: {
 *       jobId: BANK_JOBS.CONNECTION_EXPIRATION,
 *     },
 *   });
 *
 * @example
 *   // The job result structure will be:
 *   {
 *   success: true,
 *   warningCount: 5,  // Number of warning notifications sent
 *   criticalCount: 2  // Number of critical notifications sent
 *   }
 *
 *   // Or if there was an error:
 *   {
 *   success: false,
 *   error: "Database connection failed"
 *   }
 */
export const connectionExpirationJob = client.defineJob({
  id: BANK_JOBS.CONNECTION_EXPIRATION,
  name: 'Connection Expiration Job',
  trigger: cronTrigger({
    cron: '0 9 * * *', // Run daily at 9 AM
  }),
  version: '1.0.0',
  /**
   * Main job execution function that checks for expiring connections and sends
   * notifications
   *
   * @param payload - The job payload (empty for cron jobs)
   * @param io - The I/O context provided by Trigger.dev for logging, running
   *   tasks, etc.
   * @returns A result object containing success status and notification counts
   */
  run: async (payload, io) => {
    await io.logger.info('Starting connection expiration check');

    try {
      // Get all active connections with expiration dates
      const connections = await io.runTask(
        'get-active-connections',
        async () => {
          return await prisma.bankConnection.findMany({
            select: {
              id: true,
              expiresAt: true,
              institutionName: true,
              userId: true,
            },
            where: {
              expiresAt: { not: null },
              status: 'ACTIVE',
            },
          });
        }
      );

      await io.logger.info(
        `Found ${connections.length} connections to check for expiration`
      );

      let warningCount = 0;
      let criticalCount = 0;

      for (const connection of connections) {
        if (!connection.expiresAt) continue;

        const daysUntilExpiration = differenceInDays(
          new Date(connection.expiresAt),
          new Date()
        );

        // Handle critical expiration (3 days or less)
        if (daysUntilExpiration <= CRITICAL_DAYS && daysUntilExpiration > 0) {
          await client.sendEvent({
            name: 'connection-notification',
            payload: {
              userId: connection.userId,
              type: 'connection_critical',
              title: 'Bank Connection Expiring Soon',
              message: `Your connection to ${connection.institutionName} will expire in ${daysUntilExpiration} days. Please reconnect to avoid interruption.`,
              data: {
                connectionId: connection.id,
                bankName: connection.institutionName,
                daysRemaining: daysUntilExpiration,
              },
            },
          });
          criticalCount++;

          await io.logger.info(
            `Sent critical expiration notification for connection ${connection.id}`
          );
        }
        // Handle warning expiration (14 days or less)
        else if (
          daysUntilExpiration <= WARNING_DAYS &&
          daysUntilExpiration > CRITICAL_DAYS
        ) {
          await client.sendEvent({
            name: 'connection-notification',
            payload: {
              userId: connection.userId,
              type: 'connection_warning',
              title: 'Bank Connection Update Needed',
              message: `Your connection to ${connection.institutionName} will expire in ${daysUntilExpiration} days.`,
              data: {
                connectionId: connection.id,
                bankName: connection.institutionName,
                daysRemaining: daysUntilExpiration,
              },
            },
          });
          warningCount++;

          await io.logger.info(
            `Sent warning expiration notification for connection ${connection.id}`
          );
        }
      }

      await io.logger.info(
        `Connection expiration check completed: ${warningCount} warnings, ${criticalCount} critical notifications sent`
      );

      return {
        success: true,
        warningCount,
        criticalCount,
      };
    } catch (error) {
      await io.logger.error(
        `Connection expiration check failed: ${error.message}`
      );

      return {
        success: false,
        error: error.message,
      };
    }
  },
});
