import { type BankConnection, SyncStatus } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '@/server/db';
import {
  getAccounts,
  getItemDetails,
  getTransactions,
} from '@/server/services/plaid';

import { TRANSACTION_JOBS } from '../constants';
import { getTransactionDateRange } from '../../utils/helpers';
import { updateConnectionSyncStatus } from '../../utils/update-connection-sync';
import { getConnectionsForSync } from '../../utils/get-connections-sync';
import { logger, schedules, schemaTask } from '@trigger.dev/sdk/v3';

// Define the job for syncing all user transactions
export const syncAllTransactionsJob = schedules.task({
  id: TRANSACTION_JOBS.SYNC_ALL_TRANSACTIONS,
  description: 'Sync All Transactions',
  cron: '0 */4 * * *', // Every 4 hours
  run: async () => {
    await logger.info('Starting transaction sync for all connections');

    // Get all connections that need syncing
    const connections = await getConnectionsForSync();

    await logger.info(`Found ${connections.length} connections to sync`);

    // Process each connection
    for (const connection of connections) {
      try {
        await updateConnectionSyncStatus(connection.id, SyncStatus.SYNCING);
        await syncConnectionTransactions(connection);
        await updateConnectionSyncStatus(connection.id, SyncStatus.IDLE);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        await logger.error(
          `Error syncing connection ${connection.id}: ${errorMessage}`
        );
        await updateConnectionSyncStatus(
          connection.id,
          SyncStatus.FAILED,
          errorMessage
        );
      }
    }

    return { connectionsProcessed: connections.length, success: true };
  },
});

// Define the job for syncing a single user's transactions
export const syncUserTransactionsJob = schemaTask({
  id: 'sync-user-transactions-job',
  description: 'Sync User Transactions',
  schema: z.object({
    userId: z.string(),
  }),
  run: async (payload, io) => {
    const { userId } = payload;
    await logger.info(`Starting transaction sync for user ${userId}`);

    // Get user's connections
    const connections = await prisma.bankConnection.findMany({
      where: {
        status: {
          not: 'ERROR',
        },
        userId,
      },
    });

    await logger.info(
      `Found ${connections.length} connections for user ${userId}`
    );

    // Process each connection
    for (const connection of connections) {
      try {
        await updateConnectionSyncStatus(connection.id, SyncStatus.SYNCING);
        await syncConnectionTransactions(connection);
        await updateConnectionSyncStatus(connection.id, SyncStatus.IDLE);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        await logger.error(
          `Error syncing connection ${connection.id}: ${errorMessage}`
        );
        await updateConnectionSyncStatus(
          connection.id,
          SyncStatus.FAILED,
          errorMessage
        );
      }
    }

    return { connectionsProcessed: connections.length, success: true, userId };
  },
});

/** Helper function to sync transactions for a specific connection */
async function syncConnectionTransactions(connection: BankConnection) {
  const { endDate, startDate } = getTransactionDateRange(30);

  // Check item status
  const itemDetails = await getItemDetails(connection.accessToken);

  // Get accounts for this connection
  const bankAccounts = await prisma.bankAccount.findMany({
    where: { bankConnectionId: connection.id },
  });

  // Update account balances
  const accountsPrimedForUpdate = await getAccounts(connection.accessToken);

  // Update each account with new balance information
  for (const plaidAccount of accountsPrimedForUpdate) {
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

  // Sync transactions
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

  // Calculate account statistics
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

  return {
    transactions: {
      created,
      skipped,
      updated,
    },
  };
}
