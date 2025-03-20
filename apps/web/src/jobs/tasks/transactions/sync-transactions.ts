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
  // TODO: Add staggered execution to prevent provider rate limits
  // TODO: Add configurable sync frequency based on account activity levels
  run: async () => {
    await logger.info('Starting transaction sync for all connections');

    // Get all connections that need syncing
    const connections = await getConnectionsForSync();

    // TODO: Add prioritization for recently active connections
    // TODO: Add smart batching based on provider to prevent rate limits

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

        // TODO: Add retry mechanism for transient errors
        // TODO: Add notification for persistent failures
      }
    }

    // TODO: Add metrics collection for sync performance and success rates
    // TODO: Add verification of data completeness across connections

    return { connectionsProcessed: connections.length, success: true };
  },
});

// Define the job for syncing a single user's transactions
export const syncUserTransactionsJob = schemaTask({
  id: 'sync-user-transactions-job',
  description: 'Sync User Transactions',
  schema: z.object({
    userId: z.string(),
    // TODO: Add optional date range parameters for targeted syncs
    // TODO: Add force sync option to override default sync logic
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

    // TODO: Add filtering for connections that don't need syncing (recently synced)
    // TODO: Add sorting to prioritize connections that haven't been synced in longest time

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

        // TODO: Add user notification for failed syncs of important accounts
        // TODO: Add intelligent retry strategy based on error type
      }
    }

    // TODO: Add progress reporting for long-running syncs
    // TODO: Add metrics for sync timing and performance

    return { connectionsProcessed: connections.length, success: true, userId };
  },
});

/** Helper function to sync transactions for a specific connection */
async function syncConnectionTransactions(connection: BankConnection) {
  const { endDate, startDate } = getTransactionDateRange(30);

  // TODO: Add configurable date range based on account type and history
  // TODO: Add incremental sync optimization for frequent updates

  // Check item status
  const itemDetails = await getItemDetails(connection.accessToken);

  // TODO: Add validation of item status before proceeding
  // TODO: Add handling for different provider item status formats

  // Get accounts for this connection
  const bankAccounts = await prisma.bankAccount.findMany({
    where: { bankConnectionId: connection.id },
  });

  // TODO: Add filtering for accounts that don't need updating
  // TODO: Add support for user-specified account sync preferences

  // Update account balances
  const accountsPrimedForUpdate = await getAccounts(connection.accessToken);

  // TODO: Add error handling for specific provider error codes
  // TODO: Add validation of returned account data

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

    // TODO: Add handling for new accounts that might have been added
    // TODO: Add detection for closed or removed accounts
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

  // TODO: Add pagination for large transaction volumes
  // TODO: Add optimized updates for unchanged transactions
  // TODO: Add handling for pending transaction changes

  // Process each transaction
  let created = 0;
  let updated = 0;
  const skipped = 0;

  // TODO: Track different types of updates for better metrics
  // TODO: Add transaction deduplication for transfers between accounts

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

      // TODO: Add selective updates only for fields that changed
      // TODO: Add tracking for pending transactions that have cleared
    } else {
      // Create new transaction
      await prisma.transaction.create({
        data: transaction,
      });
      created++;

      // TODO: Add categorization for new transactions
      // TODO: Add matching for recurring transaction patterns
    }
  }

  // TODO: Add detection for deleted or removed transactions
  // TODO: Add handling for transaction splits and merges

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

    // TODO: Add more sophisticated average balance calculation
    // TODO: Add trend detection for spending patterns
    // TODO: Add anomaly detection for unusual income/spending

    // Update account with statistics
    await prisma.bankAccount.update({
      data: {
        averageBalance: averageBalance,
        monthlyIncome: Math.abs(monthlyIncome._sum.amount || 0),
        monthlySpending: monthlySpending._sum.amount || 0,
      },
      where: { id: account.id },
    });

    // TODO: Add historical tracking of key metrics over time
    // TODO: Add forecasting for future balance trends
  }

  return {
    transactions: {
      created,
      skipped,
      updated,
      // TODO: Add detailed metrics about transaction types and categories
      // TODO: Add performance metrics for sync timing and efficiency
    },
  };
}
