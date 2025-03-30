import { logger, schedules } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { BankConnectionStatus } from '@solomonai/prisma/client';
import { getAccounts } from '@/server/services/plaid';
import { prisma } from '@solomonai/prisma';

/**
 * This job updates bank account balances on a frequent basis without pulling
 * full transaction history, providing more real-time balance data.
 */
export const updateBalancesJob = schedules.task({
  id: BANK_JOBS.UPDATE_BALANCES,
  description: 'Update Bank Balances',
  cron: '0 */2 * * *', // Every 2 hours
  // TODO: Add configurable update frequency based on account type (checking vs savings)
  // TODO: Add staggered execution to prevent updating all balances at once
  run: async () => {
    await logger.info('Starting balance update job');

    // Find active connections to update
    let connections: {
      id: string;
      accounts: any[];
      accessToken: string;
      [key: string]: any;
    }[] = [];

    // TODO: Add stricter typing for connections to avoid any[] types

    const result = await prisma.bankConnection.findMany({
      include: {
        accounts: {
          where: {
            status: 'ACTIVE',
          },
        },
      },
      orderBy: {
        balanceLastUpdated: 'asc', // Update oldest first
      },
      take: 100, // Process in batches
      where: {
        status: BankConnectionStatus.ACTIVE,
      },
    });

    // TODO: Add prioritization for high-velocity accounts (frequent transactions)
    // TODO: Add prioritization for accounts with large balances or critical importance

    connections = result;

    await logger.info(
      `Found ${connections.length} connections to update balances`
    );

    let successCount = 0;
    let errorCount = 0;
    let accountsUpdated = 0;

    // TODO: Add tracking for balance change magnitudes to detect unusual activity
    // TODO: Add tracking for balance update latency by provider

    // Process each connection
    for (const connection of connections) {
      try {
        // Get fresh account data from Plaid
        const plaidAccounts = await getAccounts(connection.accessToken);

        // TODO: Add support for other providers (Teller, GoCardless, etc.)
        // TODO: Add validation of the returned account data
        // TODO: Add proper error handling for provider-specific error codes

        // Update each account's balance
        for (const plaidAccount of plaidAccounts) {
          const bankAccount = connection.accounts.find(
            (acc) => acc.plaidAccountId === plaidAccount.plaidAccountId
          );

          // TODO: Add change detection to only update when balances actually change
          // TODO: Add validation for suspicious balance changes (large unexpected changes)

          if (bankAccount) {
            await prisma.bankAccount.update({
              data: {
                availableBalance: plaidAccount.availableBalance,
                balanceLastUpdated: new Date(),
                currentBalance: plaidAccount.currentBalance,
                limit: plaidAccount.limit,
              },
              where: { id: bankAccount.id },
            });
            accountsUpdated++;

            // TODO: Add historical balance tracking for trend analysis
            // TODO: Add balance alerts for accounts reaching low balance thresholds
          }
        }

        // Update connection's timestamp
        await prisma.bankConnection.update({
          data: {
            balanceLastUpdated: new Date(),
          },
          where: { id: connection.id },
        });

        // TODO: Track the time taken to update each connection for performance monitoring

        successCount++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        await logger.error(
          `Error updating balances for connection ${connection.id}: ${errorMessage}`
        );

        errorCount++;

        // TODO: Add retry mechanism for transient errors before marking as failed
        // TODO: Add detailed error categorization by provider and error type

        // If the error seems to be authentication-related, mark for reconnection
        if (
          errorMessage.includes('ITEM_LOGIN_REQUIRED') ||
          errorMessage.includes('INVALID_ACCESS_TOKEN') ||
          errorMessage.includes('INVALID_CREDENTIALS')
        ) {
          await prisma.bankConnection.update({
            data: {
              errorMessage: errorMessage,
              status: BankConnectionStatus.REQUIRES_REAUTH,
            },
            where: { id: connection.id },
          });

          // TODO: Add user notification for required reauth to reduce service interruption
          // TODO: Add automatic reauth attempt for supported providers/integration methods
        }

        // TODO: Add escalation for critical accounts that fail balance updates repeatedly
      }
    }

    // TODO: Add alerting when error rates exceed normal thresholds
    // TODO: Add trend analysis to detect declining provider reliability
    // TODO: Add metrics for balance update accuracy compared to transaction activity

    return {
      accountsUpdated,
      connectionsProcessed: connections.length,
      errorCount,
      successCount,
      // TODO: Add detailed breakdown of update timing and performance metrics
      // TODO: Add error categorization by provider and error type
    };
  },
});
