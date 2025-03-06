import { type BankConnection, SyncStatus } from '@prisma/client';
import { cronTrigger, eventTrigger } from '@trigger.dev/sdk';
import { z } from 'zod';

import { prisma } from '@/server/db';
import {
  getAccounts,
  getItemDetails,
  getTransactions,
} from '@/server/services/plaid';

import { client } from '../client';
import {
  getConnectionsForSync,
  getTransactionDateRange,
  updateConnectionSyncStatus,
} from '../utils/helpers';

// Define the job for syncing all user transactions
export const syncAllTransactionsJob = client.defineJob({
  id: 'sync-all-transactions-job',
  name: 'Sync All Transactions',
  trigger: cronTrigger({
    cron: '0 */4 * * *', // Every 4 hours
  }),
  version: '1.0.0',
  run: async (payload, io) => {
    await io.logger.info('Starting transaction sync for all connections');

    // Get all connections that need syncing
    const connections = await io.runTask('get-connections', async () => {
      return await getConnectionsForSync();
    });

    await io.logger.info(`Found ${connections.length} connections to sync`);

    // Process each connection
    for (const connection of connections) {
      await io.runTask(`sync-connection-${connection.id}`, async () => {
        try {
          await updateConnectionSyncStatus(connection.id, SyncStatus.SYNCING);
          await syncConnectionTransactions(connection, io);
          await updateConnectionSyncStatus(connection.id, SyncStatus.IDLE);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          await io.logger.error(
            `Error syncing connection ${connection.id}: ${errorMessage}`
          );
          await updateConnectionSyncStatus(
            connection.id,
            SyncStatus.FAILED,
            errorMessage
          );
        }
      });
    }

    return { connectionsProcessed: connections.length, success: true };
  },
});

// Define the job for syncing a single user's transactions
export const syncUserTransactionsJob = client.defineJob({
  id: 'sync-user-transactions-job',
  name: 'Sync User Transactions',
  // This job is triggered manually or via API
  trigger: eventTrigger({
    name: 'manual-sync-transactions',
    schema: z.object({
      userId: z.string(),
    }),
  }),
  version: '1.0.0',
  run: async (payload, io) => {
    const { userId } = payload;
    await io.logger.info(`Starting transaction sync for user ${userId}`);

    // Get user's connections
    const connections = await io.runTask('get-user-connections', async () => {
      return await prisma.bankConnection.findMany({
        where: {
          status: {
            not: 'ERROR',
          },
          userId,
        },
      });
    });

    await io.logger.info(
      `Found ${connections.length} connections for user ${userId}`
    );

    // Process each connection
    for (const connection of connections) {
      await io.runTask(`sync-connection-${connection.id}`, async () => {
        try {
          await updateConnectionSyncStatus(connection.id, SyncStatus.SYNCING);
          await syncConnectionTransactions(connection, io);
          await updateConnectionSyncStatus(connection.id, SyncStatus.IDLE);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          await io.logger.error(
            `Error syncing connection ${connection.id}: ${errorMessage}`
          );
          await updateConnectionSyncStatus(
            connection.id,
            SyncStatus.FAILED,
            errorMessage
          );
        }
      });
    }

    return { connectionsProcessed: connections.length, success: true, userId };
  },
});

/** Helper function to sync transactions for a specific connection */
async function syncConnectionTransactions(connection: BankConnection, io: any) {
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
