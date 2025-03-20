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

// TODO: Add constants for recently expired connections and notification cooldown periods
// const RECENTLY_EXPIRED_DAYS = 2; // Check connections expired within last 2 days
// const NOTIFICATION_COOLDOWN_HOURS = 24; // Don't send duplicate notifications within 24 hours

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
 * TODO: Add handling for recently expired connections
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
 *
 *   // TODO: Add error type information for better error handling
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
      // TODO: Use UTC timestamps for consistent timezone handling
      const now = new Date();
      const criticalDate = addDays(now, CRITICAL_DAYS);
      const warningDate = addDays(now, WARNING_DAYS);

      // TODO: Add handling for recently expired connections
      // const recentlyExpiredDate = addDays(now, -RECENTLY_EXPIRED_DAYS);

      // TODO: Add tracking for recent notifications to prevent duplicates
      // const notificationCutoff = new Date(now.getTime() - (NOTIFICATION_COOLDOWN_HOURS * 60 * 60 * 1000));

      // Run both queries concurrently for better performance
      // TODO: Implement pagination for database queries to handle large datasets
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

        // TODO: Add query for recently expired connections
      ]);

      logger.info(
        `Found ${criticalConnections.length} critical and ${warningConnections.length} warning connections`
      );

      // TODO: Fetch and create lookup for recent notifications to prevent duplicates

      let criticalCount = 0;
      let warningCount = 0;
      // TODO: Add count for expired connection notifications

      // TODO: Create a helper function to handle notification sending with validation, error handling, and deduplication

      // Process critical connections
      for (const connection of criticalConnections) {
        if (!connection.expiresAt) continue;

        // This is correct - we ensure at least 1 day
        const daysUntilExpiration = Math.max(
          1,
          Math.ceil(
            (connection.expiresAt.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );

        // TODO: Check if notification was already sent recently to prevent duplicates

        // TODO: Verify connection is still in expected state right before sending

        // TODO: Add null handling for institution name
        // const bankName = connection.institutionName || 'your bank';

        // TODO: Add validation for successful event sending
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

        // TODO: Use consistent day calculation logic with Math.max like in the critical connections
        const daysUntilExpiration = Math.ceil(
          (connection.expiresAt.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        // TODO: Check if notification was already sent recently to prevent duplicates

        // TODO: Verify connection is still in expected state right before sending

        // TODO: Add null handling for institution name

        // TODO: Add validation for successful event sending
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

      // TODO: Add processing for expired connections

      logger.info(
        `Connection expiration check completed: ${warningCount} warnings, ${criticalCount} critical notifications sent`
      );

      return {
        success: true,
        warningCount,
        criticalCount,
        // TODO: Add expiredCount to the return value
      };
    } catch (error) {
      // TODO: Add more specific error handling based on error type
      logger.error(`Connection expiration check failed: ${error.message}`);

      return {
        success: false,
        error: error.message,
        // TODO: Add error type information
      };
    }
  },
});
