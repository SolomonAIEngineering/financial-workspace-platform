import { logger, schedules } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { BankConnectionStatus } from '@solomonai/prisma/client';
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
  // TODO: Add staggered execution to prevent monitoring all connections at once
  // TODO: Add configurable monitoring frequency for different connection types
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

    // TODO: Add prioritization for connections with previous errors or warnings
    // TODO: Add filters for connections from specific institutions known to have issues

    await logger.info(`Found ${connections.length} connections to check`);

    let healthy = 0;
    let requiresReauth = 0;
    let errored = 0;

    // TODO: Add additional counters for different error types
    // TODO: Add tracking for connections that oscillate between states

    // Process each connection
    for (const connection of connections) {
      try {
        // Check item status through Plaid
        const itemDetails = await getItemDetails(connection.accessToken);

        // TODO: Add support for other providers (Teller, GoCardless, etc.)
        // TODO: Add validation of the returned item details

        // Update last checked timestamp
        await prisma.bankConnection.update({
          data: { lastCheckedAt: new Date() },
          where: { id: connection.id },
        });

        // TODO: Add provider-specific error code mapping for better categorization

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

          // TODO: Add error severity classification (warning vs. critical)
          // TODO: Add history tracking to detect recurring issues

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

            // TODO: Trigger notification to user about required reauth
            // TODO: Add user-friendly error messages based on provider error codes
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

            // TODO: Add recovery attempt for transient errors
            // TODO: Add automatic notifications for persistent errors
          }
        } else {
          // Connection is healthy
          healthy++;

          // TODO: Add checks for additional health metrics (transaction fetch times, balance consistency)
          // TODO: Add performance tracking for connection responsiveness
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        await logger.error(
          `Error checking connection ${connection.id}: ${errorMessage}`
        );

        // TODO: Add distinction between provider API errors and internal system errors
        // TODO: Add retries for transient errors before marking as failed

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

    // TODO: Add alerting when error rates exceed normal thresholds
    // TODO: Add trend analysis to detect emerging issues with specific providers
    // TODO: Add automated remediation for common error patterns

    return {
      connectionsChecked: connections.length,
      errored,
      healthy,
      requiresReauth,
      // TODO: Add detailed breakdown of error types and frequencies
      // TODO: Add historical comparison to detect trend changes
    };
  },
});
