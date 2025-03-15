import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { transformTransaction } from '@/jobs/utils/transform';
import { z } from 'zod';

const transactionSchema = z.object({
  id: z.string(),
  description: z.string().nullable(),
  method: z.string().nullable(),
  date: z.string(),
  name: z.string(),
  status: z.enum(['pending', 'posted']),
  balance: z.number().nullable(),
  currency: z.string(),
  amount: z.number(),
  category: z.string().nullable(),
});

/**
 * This job handles syncing financial transactions from external providers
 * (primarily Plaid) into the application's database. It performs intelligent
 * transaction synchronization with the following features:
 *
 * - Batch processing to handle large transaction volumes efficiently
 * - Smart date range determination based on last sync time
 * - Duplicate detection to prevent transaction duplication
 * - Transaction categorization using Plaid's categories
 * - Handling of pending transactions
 * - Updates to existing transactions when details change
 *
 * The job is a critical component in keeping financial data up-to-date,
 * maintaining transaction history, and ensuring users have accurate financial
 * information for budgeting and analysis.
 *
 * @file Transaction Upsert Job
 * @example
 *   // Trigger a transaction upsert with default date range
 *   await client.sendEvent({
 *     name: 'upsert-transactions',
 *     payload: {
 *       bankAccountId: 'acct_123abc',
 *       accessToken: 'access-token-from-plaid',
 *       userId: 'user_456def',
 *       // startDate and endDate are optional
 *     },
 *   });
 *
 * @example
 *   // Trigger a transaction upsert with specific date range
 *   await client.sendEvent({
 *     name: 'upsert-transactions',
 *     payload: {
 *       bankAccountId: 'acct_123abc',
 *       accessToken: 'access-token-from-plaid',
 *       userId: 'user_456def',
 *       startDate: '2025-01-01',
 *       endDate: '2025-01-31',
 *     },
 *   });
 *
 * @example
 *   // The job returns a summary of its actions:
 *   {
 *   status: "success",
 *   totalTransactions: 125,     // Total transactions processed
 *   newTransactions: 15,        // New transactions created
 *   updatedTransactions: 5      // Existing transactions updated
 *   }
 */
export const upsertTransactionsJob = schemaTask({
  id: BANK_JOBS.UPSERT_TRANSACTIONS,
  description: 'Upsert Transactions',
  schema: z.object({
    userId: z.string().uuid(),
    bankAccountId: z.string().uuid(),
    manualSync: z.boolean().optional(),
    transactions: z.array(transactionSchema),
  }),
  /**
   * Main job execution function that syncs transactions for a bank account
   *
   * @param payload - The job payload containing transaction sync details
   * @param payload.accessToken - The access token for the financial data
   *   provider
   * @param payload.bankAccountId - The ID of the bank account to sync
   *   transactions for
   * @param payload.endDate - Optional end date for the transaction range
   *   (defaults to tomorrow)
   * @param payload.startDate - Optional start date for the transaction range
   *   (defaults to 5 days before last update or 90 days ago for initial sync)
   * @param payload.userId - The ID of the user who owns the account
   * @param io - The I/O context provided by Trigger.dev for logging, running
   *   tasks, etc.
   * @returns A result object containing counts of transactions processed and
   *   status
   * @throws Error if the transaction sync fails or if the account cannot be
   *   found
   */
  run: async (payload, io) => {
    try {
      const { transactions, userId, bankAccountId, manualSync } = payload;

      // Transform transactions to match our DB schema
      const formattedTransactions = transactions.map((transaction) => {
        return transformTransaction({
          transaction: transaction as any,
          teamId: userId,
          bankAccountId,
          notified: manualSync,
        });
      });

      // Upsert transactions into the transactions table, skipping duplicates based on internal_id
      // const upsertedTransactions = await prisma.transaction.upsert({
      //   data: formattedTransactions as any,
      //   onConflict: "internal_id",
      //   ignoreDuplicates: true,
      // });

      // Filter out transactions that are not uncategorized expenses
      // const uncategorizedExpenses = upsertedTransactions?.filter(
      //   (transaction) => !transaction.category && transaction.amount < 0,
      // );

      // if (uncategorizedExpenses?.length) {
      //   // We only want to wait for enrichment if this is a manual sync
      //   if (manualSync) {
      //     await enrichTransactions.triggerAndWait({
      //       transactions: uncategorizedExpenses.map((transaction) => ({
      //         id: transaction.id,
      //         name: transaction.name,
      //       })),
      //     });
      //   } else {
      //     await enrichTransactions.trigger({
      //       transactions: uncategorizedExpenses.map((transaction) => ({
      //         id: transaction.id,
      //         name: transaction.name,
      //       })),
      //     });
      //   }
      // }
    } catch (error) {
      logger.error('Failed to upsert transactions', { error });

      throw error;
    }
  },
});
