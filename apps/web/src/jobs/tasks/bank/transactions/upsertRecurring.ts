import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { prisma } from '@/server/db';
import { z } from 'zod';

/** Schema for validating recurring transaction objects */
const recurringTransactionSchema = z.object({
  id: z.string().optional(), // Optional for new transactions
  title: z.string(),
  description: z.string().optional(),
  amount: z.number(),
  currency: z.string(),
  frequency: z.enum([
    'WEEKLY',
    'BIWEEKLY',
    'MONTHLY',
    'SEMI_MONTHLY',
    'ANNUALLY',
    'IRREGULAR',
    'UNKNOWN',
  ]),
  startDate: z.string(), // ISO date string
  endDate: z.string().optional(), // Optional ISO date string
  merchantName: z.string().optional(),
  status: z
    .enum(['active', 'paused', 'completed', 'cancelled'])
    .default('active'),
  isAutomated: z.boolean().default(false),
  transactionType: z.string().optional(),
});

// Type definitions for the transaction objects
type FrequencyType =
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'SEMI_MONTHLY'
  | 'ANNUALLY'
  | 'IRREGULAR'
  | 'UNKNOWN';

type RecurringTransactionInput = z.infer<typeof recurringTransactionSchema>;
type TransactionToUpdate = {
  id: string;
  data: {
    title: string;
    description?: string;
    amount: number;
    currency: string;
    frequency: FrequencyType;
    startDate: Date;
    endDate?: Date;
    nextScheduledDate: Date | null;
    merchantName?: string;
    status: string;
    isAutomated: boolean;
    transactionType?: string;
    updatedAt: Date;
  };
};

type TransactionToCreate = {
  bankAccountId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  frequency: FrequencyType;
  startDate: Date;
  endDate?: Date;
  nextScheduledDate: Date | null;
  merchantName?: string;
  status: string;
  isAutomated: boolean;
  transactionType?: string;
  source: string;
  interval: number;
  allowExecution: boolean;
  affectAvailableBalance: boolean;
};

/**
 * Handles upserting (creating or updating) recurring transactions in the
 * database. This task is responsible for managing scheduled financial
 * transactions such as subscriptions, bills, and regular payments.
 *
 * @remarks
 *   This task performs several key functions:
 *
 *   - Creates new recurring transactions or updates existing ones
 *   - Sets next scheduled dates based on frequency
 *   - Updates transaction metadata
 *   - Handles recurring transaction status changes
 *
 *   The task implements error handling, retry mechanisms, and comprehensive
 *   tracing to ensure reliable execution.
 * @example
 *   ```ts
 *   await client.sendEvent({
 *     name: 'upsert-recurring-transactions',
 *     payload: {
 *       userId: 'user_456def',
 *       bankAccountId: 'acct_123abc',
 *       recurringTransactions: [
 *         {
 *           title: 'Netflix Subscription',
 *           description: 'Monthly streaming service',
 *           amount: 15.99,
 *           currency: 'USD',
 *           frequency: 'MONTHLY',
 *           startDate: '2023-01-15',
 *           merchantName: 'Netflix',
 *           isAutomated: true,
 *           transactionType: 'subscription'
 *         }
 *       ]
 *     },
 *   });
 *   ```;
 *
 * @returns A summary object with counts of recurring transactions processed,
 *   created, and updated
 */
export const upsertRecurringTransactionsJob = schemaTask({
  id: BANK_JOBS.UPSERT_RECURRING_TRANSACTIONS,
  description: 'Upsert Recurring Transactions',
  /**
   * Configure retry behavior for the task
   *
   * @see https://trigger.dev/docs/errors-retrying
   */
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
    randomize: true,
  },
  schema: z.object({
    /** The user ID who owns these recurring transactions */
    userId: z.string().uuid(),

    /** The bank account ID these recurring transactions belong to */
    bankAccountId: z.string().uuid(),

    /** The array of recurring transactions to upsert */
    recurringTransactions: z.array(recurringTransactionSchema),
  }),
  /**
   * Main execution function for the recurring transaction upsert task
   *
   * @param payload - The validated input parameters
   * @param payload.userId - The ID of the user who owns the account
   * @param payload.bankAccountId - The ID of the bank account for these
   *   recurring transactions
   * @param payload.recurringTransactions - The array of recurring transactions
   *   to process
   * @param ctx - The execution context provided by Trigger.dev
   * @returns A summary object with counts of recurring transactions processed,
   *   created, and updated
   */
  run: async (payload, { ctx }) => {
    // Create a trace for the entire upsert operation
    return await logger.trace('upsert-recurring-transactions', async (span) => {
      const { recurringTransactions, userId, bankAccountId } = payload;

      span.setAttribute('userId', userId);
      span.setAttribute('bankAccountId', bankAccountId);
      span.setAttribute('transactionCount', recurringTransactions.length);

      logger.info('Starting recurring transaction upsert process', {
        bankAccountId,
        count: recurringTransactions.length,
      });

      try {
        // Prepare containers for created and updated transactions
        const transactionsToCreate: TransactionToCreate[] = [];
        const transactionsToUpdate: TransactionToUpdate[] = [];

        // Process and categorize transactions for batch operations
        for (const recurringTx of recurringTransactions) {
          try {
            // Convert string dates to Date objects
            const startDate = new Date(recurringTx.startDate);
            const endDate = recurringTx.endDate
              ? new Date(recurringTx.endDate)
              : undefined;

            // Calculate the next scheduled date based on frequency and start date
            const nextScheduledDate = calculateNextOccurrence(
              startDate,
              recurringTx.frequency,
              endDate
            );

            if (recurringTx.id) {
              // Add to update batch
              transactionsToUpdate.push({
                id: recurringTx.id,
                data: {
                  title: recurringTx.title,
                  description: recurringTx.description,
                  amount: recurringTx.amount,
                  currency: recurringTx.currency,
                  frequency: recurringTx.frequency,
                  startDate,
                  endDate,
                  nextScheduledDate,
                  merchantName: recurringTx.merchantName,
                  status: recurringTx.status,
                  isAutomated: recurringTx.isAutomated,
                  transactionType: recurringTx.transactionType,
                  updatedAt: new Date(),
                },
              });
            } else {
              // Add to create batch
              transactionsToCreate.push({
                bankAccountId,
                title: recurringTx.title,
                description: recurringTx.description,
                amount: recurringTx.amount,
                currency: recurringTx.currency,
                frequency: recurringTx.frequency,
                startDate,
                endDate,
                nextScheduledDate,
                merchantName: recurringTx.merchantName,
                status: recurringTx.status,
                isAutomated: recurringTx.isAutomated,
                transactionType: recurringTx.transactionType,
                source: 'manual', // This is a manually created recurring transaction
                interval: 1, // Default interval
                allowExecution: true,
                affectAvailableBalance: true,
              });
            }
          } catch (txError) {
            const errorMessage =
              txError instanceof Error ? txError.message : 'Unknown error';
            logger.error('Error processing recurring transaction', {
              error: errorMessage,
              title: recurringTx.title,
              bankAccountId,
            });
            // Continue processing other transactions
          }
        }

        // Execute batch operations using a transaction for atomicity
        const result = await prisma.$transaction(async (tx) => {
          const createdIds: string[] = [];
          const updatedIds: string[] = [];

          // Batch create new transactions if any
          if (transactionsToCreate.length > 0) {
            logger.info(
              `Batch creating ${transactionsToCreate.length} recurring transactions`
            );
            const createdTransactions =
              await tx.recurringTransaction.createMany({
                data: transactionsToCreate,
                skipDuplicates: true,
              });

            // To get the IDs of created transactions for reporting
            if (createdTransactions.count > 0) {
              // Find the newly created transactions to get their IDs
              const newlyCreated = await tx.recurringTransaction.findMany({
                where: {
                  bankAccountId,
                  title: { in: transactionsToCreate.map((t) => t.title) },
                  createdAt: { gte: new Date(Date.now() - 60000) }, // Created within the last minute
                },
                select: { id: true },
              });
              createdIds.push(...newlyCreated.map((t) => t.id));
            }
          }

          // Update existing transactions individually (Prisma doesn't support complex updateMany)
          if (transactionsToUpdate.length > 0) {
            logger.info(
              `Batch updating ${transactionsToUpdate.length} recurring transactions`
            );

            // We need to use individual updates since updateMany doesn't support
            // different data for each record
            const updatePromises = transactionsToUpdate.map(({ id, data }) =>
              tx.recurringTransaction
                .update({
                  where: { id },
                  data,
                })
                .then((updated) => updatedIds.push(updated.id))
            );

            await Promise.all(updatePromises);
          }

          return { createdIds, updatedIds };
        });

        // Update the bank account to reflect these changes
        await prisma.bankAccount.update({
          where: { id: bankAccountId },
          data: {
            updatedAt: new Date(),
            // Update recurring transaction statistics
            recurringMonthlyInflow: await calculateRecurringMonthlyFlow(
              bankAccountId,
              true
            ),
            recurringMonthlyOutflow: await calculateRecurringMonthlyFlow(
              bankAccountId,
              false
            ),
            nextScheduledTransaction:
              await getNextScheduledTransaction(bankAccountId),
          },
        });

        logger.info('Recurring transaction upsert completed successfully', {
          bankAccountId,
          created: result.createdIds.length,
          updated: result.updatedIds.length,
        });

        return {
          status: 'success',
          totalTransactions: recurringTransactions.length,
          created: result.createdIds.length,
          updated: result.updatedIds.length,
          message: `Successfully processed ${recurringTransactions.length} recurring transactions (${result.createdIds.length} created, ${result.updatedIds.length} updated)`,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        span.setAttribute('error', errorMessage);

        logger.error('Failed to upsert recurring transactions', {
          error: errorMessage,
          bankAccountId,
        });

        throw new Error(
          `Failed to upsert recurring transactions: ${errorMessage}`
        );
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

    // For other errors, use the default retry strategy
    return;
  },
});

/**
 * Helper function to calculate the next occurrence date based on frequency
 *
 * @param startDate - The date to calculate from (start date or last occurrence)
 * @param frequency - The identified frequency pattern (WEEKLY, MONTHLY, etc)
 * @param endDate - Optional end date for the recurring transaction
 * @returns The predicted date of the next occurrence, or null if past end date
 */
function calculateNextOccurrence(
  startDate: Date,
  frequency: string,
  endDate?: Date
): Date | null {
  const today = new Date();
  let nextDate = new Date(startDate);

  // If the start date is in the future, that's the next occurrence
  if (nextDate > today) {
    return nextDate;
  }

  // Otherwise, calculate the next occurrence based on frequency
  while (nextDate <= today) {
    switch (frequency) {
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'BIWEEKLY':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'SEMI_MONTHLY':
        // Twice a month (1st and 15th)
        const day = nextDate.getDate();
        if (day < 15) {
          nextDate.setDate(15);
        } else {
          nextDate.setDate(1);
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
        break;
      case 'ANNUALLY':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      case 'IRREGULAR':
        // For irregular, just add 30 days as a rough estimate
        nextDate.setDate(nextDate.getDate() + 30);
        break;
      default:
        // For unknown, default to monthly
        nextDate.setMonth(nextDate.getMonth() + 1);
    }

    // Check if we've passed the end date
    if (endDate && nextDate > endDate) {
      return null; // No more occurrences
    }
  }

  return nextDate;
}

/**
 * Helper function to calculate the total monthly inflow or outflow from
 * recurring transactions
 *
 * @param bankAccountId - The bank account ID to calculate for
 * @param isInflow - Whether to calculate inflows (true) or outflows (false)
 * @returns The total monthly amount
 */
async function calculateRecurringMonthlyFlow(
  bankAccountId: string,
  isInflow: boolean
): Promise<number> {
  // Get all active recurring transactions for this account
  const transactions = await prisma.recurringTransaction.findMany({
    where: {
      bankAccountId,
      status: 'active',
      amount: isInflow ? { gt: 0 } : { lt: 0 },
    },
  });

  // Calculate monthly equivalent for each frequency
  let monthlyTotal = 0;

  for (const tx of transactions) {
    const amount = Math.abs(tx.amount);

    switch (tx.frequency) {
      case 'WEEKLY':
        monthlyTotal += amount * 4.33; // Average weeks per month
        break;
      case 'BIWEEKLY':
        monthlyTotal += amount * 2.17; // Average bi-weeks per month
        break;
      case 'MONTHLY':
        monthlyTotal += amount;
        break;
      case 'SEMI_MONTHLY':
        monthlyTotal += amount * 2; // Twice a month
        break;
      case 'ANNUALLY':
        monthlyTotal += amount / 12; // Divided over 12 months
        break;
      case 'IRREGULAR':
        // For irregular, assume quarterly as a conservative estimate
        monthlyTotal += amount / 3;
        break;
      default:
        monthlyTotal += amount; // Default to counting it once
    }
  }

  return monthlyTotal;
}

/**
 * Helper function to find the next scheduled transaction date
 *
 * @param bankAccountId - The bank account ID to find the next transaction for
 * @returns The date of the next scheduled transaction, or null if none
 */
async function getNextScheduledTransaction(
  bankAccountId: string
): Promise<Date | null> {
  const nextTransaction = await prisma.recurringTransaction.findFirst({
    where: {
      bankAccountId,
      status: 'active',
      nextScheduledDate: { not: null },
    },
    orderBy: {
      nextScheduledDate: 'asc',
    },
    select: {
      nextScheduledDate: true,
    },
  });

  return nextTransaction?.nextScheduledDate || null;
}
