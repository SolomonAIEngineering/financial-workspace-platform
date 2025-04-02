import { type BankConnection, BankAccount, SyncStatus } from '@solomonai/prisma/client';

import { prisma } from '@solomonai/prisma/server';
import { engine } from '@solomonai/lib/clients';

import { TRANSACTION_JOBS } from '../constants';
import { updateConnectionSyncStatus } from '../../utils/update-connection-sync';
import { getConnectionsForSync } from '../../utils/get-connections-sync';
import { Task, logger, schedules, schemaTask } from '@trigger.dev/sdk/v3';
import {
  ConnectionSyncResult,
  SyncAllTransactionsOutput,
  SyncUserTransactionsInput,
  SyncUserTransactionsOutput,
  connectionSyncResultSchema,
  syncAllTransactionsOutputSchema,
  syncUserTransactionsInputSchema,
  syncUserTransactionsOutputSchema
} from './schema';
import { APIFinancialAccountListResponse, APITransactionListResponse } from '@solomon-ai/workspace-financial-backend-sdk/resources/index.js';


/**
 * Process a single connection to sync transactions and update account information
 * 
 * @param connection - The bank connection to sync
 * @param syncCursor - Optional cursor for pagination
 * @param latest - Whether to sync only the latest transactions
 * @returns Result object with counts of transaction operations
 */
async function syncConnectionTransactions(
  connection: BankConnection,
  syncCursor?: string,
  latest = false
): Promise<ConnectionSyncResult> {
  // Fetch accounts for this connection
  const bankAccounts = await fetchBankAccounts(connection.id);

  // Update account balances
  await updateAccountBalances(connection, bankAccounts);

  // Fetch and process transactions
  const { created, updated, skipped } = await processTransactions(connection, syncCursor, latest);

  // Calculate and update account statistics
  await updateAccountStatistics(bankAccounts);

  return connectionSyncResultSchema.parse({
    transactions: {
      created,
      skipped,
      updated,
    }
  });
}

/**
 * Fetch bank accounts for a connection
 * 
 * @param connectionId - The bank connection ID
 * @returns Array of bank accounts
 */
async function fetchBankAccounts(connectionId: string): Promise<BankAccount[]> {
  return await prisma.bankAccount.findMany({
    where: { bankConnectionId: connectionId },
  });
}

/**
 * Update account balances for all accounts in a connection
 * 
 * @param connection - The bank connection
 * @param bankAccounts - The existing bank accounts
 */
async function updateAccountBalances(
  connection: BankConnection,
  bankAccounts: BankAccount[]
) {
  try {
    const response: APIFinancialAccountListResponse = await engine.apiFinancialAccounts.list({
      provider: connection.provider as 'plaid' | 'teller' | 'gocardless' | 'stripe',
      accessToken: connection.accessToken,
      institutionId: connection.institutionId,
    });

    // Convert response to array of accounts
    const accountsPrimedForUpdate = response.data;

    // Update each account with new balance information
    for (const plaidAccount of accountsPrimedForUpdate) {
      const bankAccount = bankAccounts.find(
        (account) => account.plaidAccountId === plaidAccount.id
      );

      if (bankAccount) {
        await prisma.bankAccount.update({
          data: {
            availableBalance: plaidAccount.balance.amount,
            balanceLastUpdated: new Date(),
            currentBalance: plaidAccount.balance.amount,
          },
          where: { id: bankAccount.id },
        });
      } else {
        logger.warn('Account not found in database', { plaidAccountId: plaidAccount.id });
      }
    }
  } catch (error) {
    logger.error('Failed to update account balances', { error, connectionId: connection.id });
    throw error;
  }
}

/**
 * Fetch and process transactions for a connection
 * 
 * @param connection - The bank connection
 * @param syncCursor - Optional cursor for pagination
 * @param latest - Whether to sync only the latest transactions
 * @returns Counts of created, updated, and skipped transactions
 */
async function processTransactions(
  connection: BankConnection,
  syncCursor?: string,
  latest = false
) {
  try {
    const response: APITransactionListResponse = await engine.apiTransactions.list({
      accountId: connection.id,
      provider: connection.provider as 'plaid' | 'teller' | 'gocardless' | 'stripe',
      accessToken: connection.accessToken,
      syncCursor: syncCursor,
      latest: latest ? 'true' : 'false',
    });

    // Convert response to array of transactions
    const transactions = response.data;

    // Process each transaction
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const transaction of transactions) {
      if (await processTransaction(transaction, connection.id)) {
        // If the function returns true, the transaction was created
        created++;
      } else {
        // Otherwise it was updated
        updated++;
      }
    }

    return { created, updated, skipped };
  } catch (error) {
    logger.error('Failed to process transactions', { error, connectionId: connection.id });
    throw error;
  }
}

/**
 * Process a single transaction - create or update
 * 
 * @param transaction - The transaction data
 * @param connectionId - The bank connection ID
 * @returns true if created, false if updated
 */
async function processTransaction(
  transaction: unknown,
  connectionId: string
): Promise<boolean> {
  try {
    const txData = transaction as {
      plaidTransactionId: string;
      amount: number;
      category: string | null;
      date: Date;
      merchantName: string | null;
      name: string;
      pending: boolean;
      subCategory: string | null;
    };

    // Check if transaction already exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { plaidTransactionId: txData.plaidTransactionId },
    });

    if (existingTransaction) {
      // Update existing transaction
      await prisma.transaction.update({
        data: {
          amount: txData.amount,
          // Handle category as string data from API that Prisma will convert to its enum
          category: txData.category as any,
          date: txData.date,
          merchantName: txData.merchantName,
          name: txData.name,
          pending: txData.pending,
          subCategory: txData.subCategory,
        },
        where: { id: existingTransaction.id },
      });
      return false; // Updated
    } else {
      // Create the transaction - using type assertion to add the bank connection ID
      await prisma.transaction.create({
        data: {
          amount: txData.amount,
          category: txData.category as any,
          date: txData.date,
          merchantName: txData.merchantName,
          name: txData.name,
          pending: txData.pending,
          plaidTransactionId: txData.plaidTransactionId,
          subCategory: txData.subCategory,
          // Prisma will recognize this as the foreign key for the connection
          bankConnectionId: connectionId
        } as any
      });
      return true; // Created
    }
  } catch (error) {
    logger.error('Error processing transaction', {
      error,
      transaction,
      connectionId
    });
    throw error;
  }
}

/**
 * Calculate and update account statistics
 * 
 * @param bankAccounts - The bank accounts to update
 */
async function updateAccountStatistics(bankAccounts: BankAccount[]) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  for (const account of bankAccounts) {
    try {
      // Calculate monthly income
      const monthlyIncome = await calculateMonthlyIncome(account.id, thirtyDaysAgo);

      // Calculate monthly spending
      const monthlySpending = await calculateMonthlySpending(account.id, thirtyDaysAgo);

      // Calculate average balance
      const averageBalance = account.currentBalance;

      // Update account with statistics
      await prisma.bankAccount.update({
        data: {
          averageBalance: averageBalance,
          monthlyIncome: Math.abs(monthlyIncome),
          monthlySpending: monthlySpending,
        },
        where: { id: account.id },
      });
    } catch (error) {
      logger.error('Failed to update account statistics', {
        error,
        accountId: account.id
      });
      // Continue with other accounts even if one fails
    }
  }
}

/**
 * Calculate monthly income for an account
 * 
 * @param accountId - The bank account ID
 * @param startDate - The start date for calculation
 * @returns The total income amount
 */
async function calculateMonthlyIncome(accountId: string, startDate: Date): Promise<number> {
  const result = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      amount: { lt: 0 }, // Income is negative in Plaid (money coming in)
      bankAccountId: accountId,
      date: { gte: startDate },
    },
  });

  return result._sum.amount || 0;
}

/**
 * Calculate monthly spending for an account
 * 
 * @param accountId - The bank account ID
 * @param startDate - The start date for calculation
 * @returns The total spending amount
 */
async function calculateMonthlySpending(accountId: string, startDate: Date): Promise<number> {
  const result = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      amount: { gt: 0 }, // Spending is positive in Plaid (money going out)
      bankAccountId: accountId,
      date: { gte: startDate },
    },
  });

  return result._sum.amount || 0;
}

/**
 * Process a bank connection for syncing
 * 
 * @param connection - The bank connection to process
 */
async function processConnection(connection: BankConnection): Promise<void> {
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

// Define the job for syncing all user transactions
export const syncAllTransactionsJob = schedules.task({
  id: TRANSACTION_JOBS.SYNC_ALL_TRANSACTIONS,
  description: 'Sync All Transactions',
  cron: '0 */4 * * *', // Every 4 hours
  // TODO: Add staggered execution to prevent provider rate limits
  // TODO: Add configurable sync frequency based on account activity levels
  run: async (): Promise<SyncAllTransactionsOutput> => {
    await logger.info('Starting transaction sync for all connections');

    // Get all connections that need syncing
    const connections = await getConnectionsForSync();

    // TODO: Add prioritization for recently active connections
    // TODO: Add smart batching based on provider to prevent rate limits

    await logger.info(`Found ${connections.length} connections to sync`);

    // Process each connection
    for (const connection of connections) {
      await processConnection(connection);
    }

    // TODO: Add metrics collection for sync performance and success rates
    // TODO: Add verification of data completeness across connections

    return syncAllTransactionsOutputSchema.parse({
      connectionsProcessed: connections.length,
      success: true
    });
  },
});

// Define the job for syncing a single user's transactions
export const syncUserTransactionsJob: Task<
  'sync-user-transactions-job',
  SyncUserTransactionsInput,
  SyncUserTransactionsOutput
> = schemaTask({
  id: 'sync-user-transactions-job',
  description: 'Sync User Transactions',
  schema: syncUserTransactionsInputSchema,
  run: async (payload): Promise<SyncUserTransactionsOutput> => {
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
      await processConnection(connection);
    }

    // TODO: Add progress reporting for long-running syncs
    // TODO: Add metrics for sync timing and performance

    return syncUserTransactionsOutputSchema.parse({
      connectionsProcessed: connections.length,
      success: true,
      userId
    });
  },
});
