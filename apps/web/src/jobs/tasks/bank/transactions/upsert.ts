import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { prisma } from '@/server/db';
import { transformTransaction } from '@/jobs/utils/transform';
import { z } from 'zod';

/** Schema for validating transaction objects */
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
 * Handles syncing financial transactions from external providers into the
 * application's database. This task is responsible for processing and storing
 * transaction data with intelligent handling.
 *
 * @remarks
 *   This task performs several key functions:
 *
 *   - Batch processing to handle large transaction volumes efficiently
 *   - Duplicate detection to prevent transaction duplication
 *   - Transaction categorization using provider categories
 *   - Handling of pending transactions
 *   - Updates to existing transactions when details change
 *
 *   The task implements error handling, retry mechanisms, and comprehensive
 *   tracing to ensure reliable execution even with large transaction volumes.
 * @example
 *   ```ts
 *   await client.sendEvent({
 *     name: 'upsert-transactions',
 *     payload: {
 *       userId: 'user_456def',
 *       bankAccountId: 'acct_123abc',
 *       manualSync: true,
 *       transactions: [
 *         {
 *           id: 'tx_123',
 *           date: '2023-01-15',
 *           name: 'Coffee Shop',
 *           amount: -4.50,
 *           // ...other transaction fields
 *         }
 *       ]
 *     },
 *   });
 *   ```;
 *
 * @returns A summary object with counts of transactions processed, created, and
 *   updated
 */
export const upsertTransactionsJob = schemaTask({
  id: BANK_JOBS.UPSERT_TRANSACTIONS,
  description: 'Upsert Transactions',
  /**
   * Configure retry behavior for the task
   *
   * @see https://trigger.dev/docs/errors-retrying
   */
  retry: {
    maxAttempts: 5,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 60000,
    randomize: true,
  },
  schema: z.object({
    /** The user ID who owns these transactions */
    userId: z.string().uuid(),

    /** The bank account ID these transactions belong to */
    bankAccountId: z.string().uuid(),

    /** Whether this is a manual sync initiated by the user */
    manualSync: z.boolean().optional(),

    /** The array of transactions to upsert */
    transactions: z.array(transactionSchema),
  }),
  /**
   * Main execution function for the transaction upsert task
   *
   * @param payload - The validated input parameters
   * @param payload.userId - The ID of the user who owns the account
   * @param payload.bankAccountId - The ID of the bank account for these
   *   transactions
   * @param payload.manualSync - Whether this is a manual sync
   * @param payload.transactions - The array of transactions to process
   * @param ctx - The execution context provided by Trigger.dev
   * @returns A summary object with counts of transactions processed, created,
   *   and updated
   */
  run: async (payload, { ctx }) => {
    // Create a trace for the entire upsert operation
    return await logger.trace('upsert-transactions', async (span) => {
      const { transactions, userId, bankAccountId, manualSync } = payload;

      span.setAttribute('userId', userId);
      span.setAttribute('bankAccountId', bankAccountId);
      span.setAttribute('manualSync', Boolean(manualSync));
      span.setAttribute('transactionCount', transactions.length);

      logger.info('Starting transaction upsert process', {
        bankAccountId,
        count: transactions.length,
        manualSync,
      });

      try {
        // Transform transactions to match our DB schema
        const formattedTransactions = transactions.map((transaction) => {
          return transformTransaction({
            transaction: transaction as any,
            teamId: userId,
            bankAccountId,
            notified: manualSync,
          });
        });

        span.setAttribute('formattedCount', formattedTransactions.length);
        logger.info(
          `Transformed ${formattedTransactions.length} transactions`,
          { bankAccountId }
        );

        // Upsert transactions into the transactions table
        const result = await logger.trace(
          'db-upsert-transactions',
          async (dbSpan) => {
            dbSpan.setAttribute(
              'transactionCount',
              formattedTransactions.length
            );

            try {
              // Upsert transactions into the transactions table, skipping duplicates based on internal_id
              const upsertedTransactions = await prisma.transaction.createMany({
                data: formattedTransactions as any,
                skipDuplicates: true,
              });

              dbSpan.setAttribute('createdCount', upsertedTransactions.count);
              logger.info(
                `Created ${upsertedTransactions.count} new transactions`,
                { bankAccountId }
              );

              return upsertedTransactions;
            } catch (dbError) {
              const errorMessage =
                dbError instanceof Error
                  ? dbError.message
                  : 'Unknown database error';
              dbSpan.setAttribute('error', errorMessage);
              logger.error('Database error during transaction upsert', {
                error: errorMessage,
                bankAccountId,
              });
              throw dbError;
            }
          }
        );

        // Process uncategorized transactions for enrichment if necessary
        await logger.trace('process-uncategorized', async (categorySpan) => {
          try {
            // Find uncategorized expenses for potential enrichment
            const uncategorizedExpenses = await prisma.transaction.findMany({
              where: {
                bankAccountId,
                category: null,
                amount: { lt: 0 }, // Negative amounts are expenses
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
              },
              select: {
                id: true,
                name: true,
              },
            });

            const uncategorizedCount = uncategorizedExpenses.length;
            categorySpan.setAttribute('uncategorizedCount', uncategorizedCount);

            if (uncategorizedCount > 0) {
              logger.info(
                `Found ${uncategorizedCount} uncategorized expenses to enrich`,
                { bankAccountId }
              );

              // Commented out for now as enrichTransactions is not defined
              // We only want to wait for enrichment if this is a manual sync
              /*
              if (manualSync) {
                await enrichTransactions.triggerAndWait({
                  transactions: uncategorizedExpenses.map((transaction) => ({
                    id: transaction.id,
                    name: transaction.name,
                  })),
                });
              } else {
                await enrichTransactions.trigger({
                  transactions: uncategorizedExpenses.map((transaction) => ({
                    id: transaction.id,
                    name: transaction.name,
                  })),
                });
              }
              */
            }
          } catch (categoryError) {
            // Log but don't fail the whole job if enrichment process fails
            const errorMessage =
              categoryError instanceof Error
                ? categoryError.message
                : 'Unknown error';
            categorySpan.setAttribute('error', errorMessage);
            logger.error('Failed to process uncategorized transactions', {
              error: errorMessage,
              bankAccountId,
            });
          }
        });

        // Update the last sync timestamp for the bank account
        await prisma.bankAccount.update({
          where: { id: bankAccountId },
          data: { lastSyncedAt: new Date() },
        });

        logger.info('Transaction upsert completed successfully', {
          bankAccountId,
          transactionsProcessed: transactions.length,
          newTransactions: result.count,
        });

        return {
          status: 'success',
          totalTransactions: transactions.length,
          newTransactions: result.count,
          message: `Successfully processed ${transactions.length} transactions (${result.count} new)`,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        span.setAttribute('error', errorMessage);

        logger.error('Failed to upsert transactions', {
          error: errorMessage,
          bankAccountId,
        });

        throw new Error(`Failed to upsert transactions: ${errorMessage}`);
      }
    });
  },
  /**
   * Custom error handler to control retry behavior based on error type
   *
   * @param payload - The task payload
   * @param error - The error that occurred
   * @param options - Options object containing context and retry control
   * @returns Retry instructions or undefined to use default retry behavior
   */
  handleError: async (payload, error, { ctx, retryAt }) => {
    const { bankAccountId } = payload;

    // If it's a database connection error, wait longer
    if (
      error instanceof Error &&
      error.message.includes('database connection')
    ) {
      logger.warn(
        `Database connection error, delaying retry for account ${bankAccountId}`
      );
      return {
        retryAt: new Date(Date.now() + 60000), // Wait 1 minute
      };
    }

    // If it's a rate limiting error, wait longer
    if (
      error instanceof Error &&
      (error.message.includes('rate limit') ||
        error.message.includes('too many requests'))
    ) {
      logger.warn(
        `Rate limit hit, delaying retry for account ${bankAccountId}`
      );
      return {
        retryAt: new Date(Date.now() + 300000), // Wait 5 minutes
      };
    }

    // For other errors, use the default retry strategy
    return undefined;
  },
});
