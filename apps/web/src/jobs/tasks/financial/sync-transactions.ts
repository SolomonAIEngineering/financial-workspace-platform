import {
  getAccounts,
  getItemDetails,
  getTransactions,
} from '@/server/services/plaid';

import { SyncStatus } from '@prisma/client';
import { TRANSACTION_JOBS } from '../constants';
import { client } from '@/jobs/client';
import { cronTrigger } from '@trigger.dev/sdk';
import { getConnectionsForSync } from '@/jobs/utils/get-connections-sync';
import { getTransactionDateRange } from '@/jobs/utils/helpers';
import { prisma } from '@/server/db';
import { updateConnectionSyncStatus } from '@/jobs/utils/update-connection-sync';

// Define the type for sync results
interface SyncResult {
  connectionId: string;
  status: 'success' | 'error';
  accountsUpdated?: number;
  transactions?: any;
  error?: string;
}

/** This job syncs bank transactions daily at midnight */
client.defineJob({
  id: TRANSACTION_JOBS.SYNC_BANK_TRANSACTIONS,
  name: 'Sync Bank Transactions',
  version: '0.0.1',
  trigger: cronTrigger({
    cron: '0 0 * * *', // Run at midnight every day
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info('Starting bank transaction sync', {
      timestamp: new Date().toISOString(),
    });

    // 1. Fetch all active bank connections that need syncing
    const connections = await io.runTask(
      'get-connections-for-sync',
      async () => {
        return await getConnectionsForSync();
      }
    );

    await io.logger.info(`Found ${connections.length} connections to sync`);

    // 2 & 3 & 4. Process each connection - get transactions, store them, and update timestamps
    const results: SyncResult[] = [];
    for (const connection of connections) {
      const result = await io.runTask(
        `sync-connection-${connection.id}`,
        async () => {
          try {
            // Update connection status to SYNCING
            await updateConnectionSyncStatus(connection.id, SyncStatus.SYNCING);

            // Sync transactions for this connection
            const syncResult = await syncBankConnectionTransactions(
              connection,
              io
            );

            // Update connection status back to IDLE
            await updateConnectionSyncStatus(connection.id, SyncStatus.IDLE);

            // Update the lastSyncedAt timestamp
            await prisma.bankConnection.update({
              where: { id: connection.id },
              data: { lastSyncedAt: new Date() },
            });

            return {
              connectionId: connection.id,
              status: 'success' as const,
              ...syncResult,
            };
          } catch (error) {
            // Handle errors and mark connection as failed
            await updateConnectionSyncStatus(connection.id, SyncStatus.FAILED);

            await io.logger.error(`Error syncing connection ${connection.id}`, {
              error: error instanceof Error ? error.message : String(error),
              connectionId: connection.id,
            });

            return {
              connectionId: connection.id,
              status: 'error' as const,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        }
      );

      results.push(result);
    }

    await io.logger.info('Bank transaction sync completed', {
      timestamp: new Date().toISOString(),
      successCount: results.filter((r) => r.status === 'success').length,
      errorCount: results.filter((r) => r.status === 'error').length,
    });

    return {
      message: 'Bank transaction sync completed successfully',
      timestamp: new Date().toISOString(),
      results,
    };
  },
});

/** Helper function to sync transactions for a specific connection */
async function syncBankConnectionTransactions(connection: any, io: any) {
  const { endDate, startDate } = getTransactionDateRange(30);

  // Check item status
  const itemDetails = await io.runTask(
    `check-item-status-${connection.id}`,
    async () => await getItemDetails(connection.accessToken)
  );

  // Get accounts for this connection
  const bankAccounts = await io.runTask(
    `get-bank-accounts-${connection.id}`,
    async () => {
      return await prisma.bankAccount.findMany({
        where: { bankConnectionId: connection.id },
      });
    }
  );

  // Update account balances
  const updatedAccounts = await io.runTask(
    `update-account-balances-${connection.id}`,
    async () => {
      const plaidAccounts = await getAccounts(connection.accessToken);

      // Update each account with new balance information
      for (const plaidAccount of plaidAccounts) {
        const bankAccount = bankAccounts.find(
          (account) => account.plaidAccountId === plaidAccount.plaidAccountId
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
        }
      }

      return plaidAccounts;
    }
  );

  // Sync transactions
  const transactionResults = await io.runTask(
    `sync-transactions-${connection.id}`,
    async () => {
      // Get transactions from Plaid
      const transactions = await getTransactions(
        connection.accessToken,
        connection,
        bankAccounts,
        startDate,
        endDate
      );

      // Process each transaction
      let created = 0;
      let updated = 0;
      const skipped = 0;

      for (const transaction of transactions) {
        // Check if transaction already exists
        const existingTransaction = await prisma.transaction.findUnique({
          where: { plaidTransactionId: transaction.plaidTransactionId },
        });

        if (existingTransaction) {
          // Update existing transaction
          await prisma.transaction.update({
            data: {
              amount: transaction.amount,
              category: transaction.category,
              date: transaction.date,
              merchantName: transaction.merchantName,
              name: transaction.name,
              pending: transaction.pending,
              subCategory: transaction.subCategory,
            },
            where: { id: existingTransaction.id },
          });
          updated++;
        } else {
          // Create new transaction
          await prisma.transaction.create({
            data: transaction,
          });
          created++;
        }
      }

      return { created, skipped, updated };
    }
  );

  // Calculate account statistics
  await io.runTask(
    `calculate-account-statistics-${connection.id}`,
    async () => {
      for (const account of bankAccounts) {
        // Calculate monthly income
        const monthlyIncome = await prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            amount: { lt: 0 }, // Income is negative in Plaid (money coming in)
            bankAccountId: account.id,
            date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
          },
        });

        // Calculate monthly spending
        const monthlySpending = await prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            amount: { gt: 0 }, // Spending is positive in Plaid (money going out)
            bankAccountId: account.id,
            date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
          },
        });

        // Calculate average balance
        const averageBalance = account.currentBalance;

        // Update account with statistics
        await prisma.bankAccount.update({
          data: {
            averageBalance: averageBalance,
            monthlyIncome: Math.abs(monthlyIncome._sum.amount || 0),
            monthlySpending: monthlySpending._sum.amount || 0,
          },
          where: { id: account.id },
        });
      }
    }
  );

  return {
    accountsUpdated: updatedAccounts.length,
    transactions: transactionResults,
  };
}
