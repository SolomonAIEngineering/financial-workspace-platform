import { BANK_JOBS } from '../../constants';
import { BankConnectionStatus } from '@prisma/client';
import { getAccounts } from '@/server/services/plaid';
import { logger } from '@trigger.dev/sdk/v3';
import { prisma } from '@/server/db';
import { schedules } from '@trigger.dev/sdk/v3';

/**
 * This job updates bank account balances on a frequent basis without pulling
 * full transaction history, providing more real-time balance data.
 */
export const updateBalancesJob = schedules.task({
  id: BANK_JOBS.UPDATE_BALANCES,
  description: 'Update Bank Balances',
  cron: '0 */2 * * *', // Every 2 hours
  run: async () => {
    await logger.info('Starting balance update job');

    // Find active connections to update
    let connections: {
      id: string;
      accounts: any[];
      accessToken: string;
      [key: string]: any;
    }[] = [];

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

    connections = result;

    await logger.info(
      `Found ${connections.length} connections to update balances`
    );

    let successCount = 0;
    let errorCount = 0;
    let accountsUpdated = 0;

    // Process each connection
    for (const connection of connections) {
      try {
        // Get fresh account data from Plaid
        const plaidAccounts = await getAccounts(connection.accessToken);

        // Update each account's balance
        for (const plaidAccount of plaidAccounts) {
          const bankAccount = connection.accounts.find(
            (acc) => acc.plaidAccountId === plaidAccount.plaidAccountId
          );

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
          }
        }

        // Update connection's timestamp
        await prisma.bankConnection.update({
          data: {
            balanceLastUpdated: new Date(),
          },
          where: { id: connection.id },
        });

        successCount++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        await logger.error(
          `Error updating balances for connection ${connection.id}: ${errorMessage}`
        );

        errorCount++;

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
        }
      }
    }

    return {
      accountsUpdated,
      connectionsProcessed: connections.length,
      errorCount,
      successCount,
    };
  },
});
