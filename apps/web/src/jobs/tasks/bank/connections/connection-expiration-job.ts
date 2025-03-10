import { client } from '../../../client';
import { cronTrigger } from '@trigger.dev/sdk';
import { differenceInDays } from 'date-fns';
import { prisma } from '@/server/db';

// Constants for expiration thresholds
const WARNING_DAYS = 14;
const CRITICAL_DAYS = 3;

/**
 * This job checks for bank connections that are about to expire and sends
 * notifications to users to reconnect their accounts.
 */
export const connectionExpirationJob = client.defineJob({
  id: 'connection-expiration-job',
  name: 'Check Connection Expiration',
  trigger: cronTrigger({
    cron: '0 9 * * *', // Run daily at 9 AM
  }),
  version: '1.0.0',
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
