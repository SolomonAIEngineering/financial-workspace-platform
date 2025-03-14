import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { BankConnectionStatus } from '@/server/types/index';
import { addDays } from 'date-fns';
import { client } from '@/jobs/client';
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
export const connectionExpirationJob = schemaTask({
  id: BANK_JOBS.CONNECTION_EXPIRATION,
  description: 'Connection Expiration Job',
  maxDuration: 300,
  queue: {
    concurrencyLimit: 1,
  },
  /**
   * Main job execution function that checks for expiring connections and sends
   * notifications
   *
   * @param payload - The job payload (empty for cron jobs)
   * @param io - The I/O context provided by Trigger.dev for logging, running
   *   tasks, etc.
   * @returns A result object containing success status and notification counts
   */
  run: async (payload) => {
    logger.info('Starting connection expiration check');

    try {
      const now = new Date();
      const criticalDate = addDays(now, CRITICAL_DAYS);
      const warningDate = addDays(now, WARNING_DAYS);

      // Run both queries concurrently for better performance
      const [criticalConnections, warningConnections] = await Promise.all([
        // Get connections that are in the critical period (0-3 days until expiration)
        prisma.bankConnection.findMany({
          select: {
            id: true,
            expiresAt: true,
            institutionName: true,
            userId: true,
          },
          where: {
            expiresAt: {
              not: null,
              gt: now,
              lte: criticalDate,
            },
            status: BankConnectionStatus.ACTIVE,
          },
        }),

        // Get connections that are in the warning period (4-14 days until expiration)
        prisma.bankConnection.findMany({
          select: {
            id: true,
            expiresAt: true,
            institutionName: true,
            userId: true,
          },
          where: {
            expiresAt: {
              not: null,
              gt: criticalDate,
              lte: warningDate,
            },
            status: BankConnectionStatus.ACTIVE,
          },
        }),
      ]);

      logger.info(
        `Found ${criticalConnections.length} critical and ${warningConnections.length} warning connections`
      );

      let criticalCount = 0;
      let warningCount = 0;

      // Process critical connections
      for (const connection of criticalConnections) {
        if (!connection.expiresAt) continue;

        const daysUntilExpiration = Math.max(
          1,
          Math.ceil(
            (connection.expiresAt.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
          )
        );

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

        logger.info(
          `Sent critical expiration notification for connection ${connection.id}`
        );
      }

      // Process warning connections
      for (const connection of warningConnections) {
        if (!connection.expiresAt) continue;

        const daysUntilExpiration = Math.ceil(
          (connection.expiresAt.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
        );

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

        logger.info(
          `Sent warning expiration notification for connection ${connection.id}`
        );
      }

      logger.info(
        `Connection expiration check completed: ${warningCount} warnings, ${criticalCount} critical notifications sent`
      );

      return {
        success: true,
        warningCount,
        criticalCount,
      };
    } catch (error) {
      logger.error(`Connection expiration check failed: ${error.message}`);

      return {
        success: false,
        error: error.message,
      };
    }
  },
});
