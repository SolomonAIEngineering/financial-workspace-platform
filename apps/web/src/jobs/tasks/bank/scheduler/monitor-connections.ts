import { logger, schedules } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { BankConnectionStatus } from '@prisma/client';
import { getItemDetails } from '@/server/services/plaid';
import { prisma } from '@/server/db';

/**
 * This job monitors bank connections for issues and automatically updates their
 * status if there are any problems detected.
 */
export const monitorBankConnectionsJob = schedules.task({
  id: BANK_JOBS.MONITOR_CONNECTIONS,
  description: 'Monitor Bank Connections',
  cron: '0 */8 * * *', // Every 8 hours
  run: async () => {
    await logger.info('Starting bank connection health monitoring');

    // Find active connections to check
    const connections = await prisma.bankConnection.findMany({
      orderBy: {
        lastCheckedAt: 'asc',
      },
      select: {
        id: true,
        accessToken: true,
        institutionId: true,
        institutionName: true,
        lastCheckedAt: true,
        userId: true,
      },
      take: 100, // Process in batches
      where: {
        status: BankConnectionStatus.ACTIVE,
      },
    });

    await logger.info(`Found ${connections.length} connections to check`);

    let healthy = 0;
    let requiresReauth = 0;
    let errored = 0;

    // Process each connection
    for (const connection of connections) {
      try {
        // Check item status through Plaid
        const itemDetails = await getItemDetails(connection.accessToken);

        // Update last checked timestamp
        await prisma.bankConnection.update({
          data: { lastCheckedAt: new Date() },
          where: { id: connection.id },
        });

        // Check for item status issues that require attention
        if (
          itemDetails.status &&
          typeof itemDetails.status === 'object' &&
          'error_code' in itemDetails.status
        ) {
          const errorMessage = String(
            itemDetails.status.error_code || 'Unknown error'
          );

          logger.warn(
            `Error with connection ${connection.id}: ${errorMessage}`
          );

          if (errorMessage.includes('ITEM_LOGIN_REQUIRED')) {
            // Requires re-authentication
            await prisma.bankConnection.update({
              data: {
                errorMessage: errorMessage,
                status: BankConnectionStatus.REQUIRES_REAUTH,
              },
              where: { id: connection.id },
            });
            requiresReauth++;
          } else {
            // General error
            await prisma.bankConnection.update({
              data: {
                errorMessage: errorMessage,
                status: BankConnectionStatus.ERROR,
              },
              where: { id: connection.id },
            });
            errored++;
          }
        } else {
          // Connection is healthy
          healthy++;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        await logger.error(
          `Error checking connection ${connection.id}: ${errorMessage}`
        );

        // Update connection status to error
        await prisma.bankConnection.update({
          data: {
            errorMessage: errorMessage,
            status: BankConnectionStatus.ERROR,
          },
          where: { id: connection.id },
        });
        errored++;
      }
    }

    return {
      connectionsChecked: connections.length,
      errored,
      healthy,
      requiresReauth,
    };
  },
});
