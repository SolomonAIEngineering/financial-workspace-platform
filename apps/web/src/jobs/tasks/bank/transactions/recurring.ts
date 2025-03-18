import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { prisma } from '@/server/db';
import { z } from 'zod';

/**
 * Analyzes and identifies recurring transactions from the user's transaction
 * history. This task helps users understand their regular spending patterns.
 *
 * @remarks
 *   This task performs several key functions:
 *
 *   - Analyzes transaction history to identify recurring patterns
 *   - Identifies subscription payments and regular expenses
 *   - Predicts future recurrences based on past behavior
 *   - Provides insights about payment frequency and amount variations
 *
 *   The task implements error handling, retry mechanisms, and comprehensive
 *   tracing to ensure reliable analysis of transaction patterns.
 * @example
 *   ```ts
 *   await client.sendEvent({
 *     name: 'analyze-recurring-transactions',
 *     payload: {
 *       userId: 'user_456def',
 *       bankAccountId: 'acct_123abc',
 *       lookbackDays: 90
 *     },
 *   });
 *   ```;
 *
 * @returns A summary object with counts of recurring transactions identified
 */
export const recurringTransactionsJob = schemaTask({
  id: BANK_JOBS.RECURRING_TRANSACTIONS,
  description: 'Identify Recurring Transactions',
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
    /** The user ID who owns the transactions */
    userId: z.string().uuid(),

    /** The bank account ID to analyze transactions for */
    bankAccountId: z.string().uuid(),

    /** Number of days to look back for pattern analysis */
    lookbackDays: z.number().min(30).max(365).default(90),
  }),
  /**
   * Main execution function for the recurring transactions analysis task
   *
   * @param payload - The validated input parameters
   * @param payload.userId - The ID of the user who owns the account
   * @param payload.bankAccountId - The ID of the bank account to analyze
   * @param payload.lookbackDays - Number of days to analyze for patterns
   * @param ctx - The execution context provided by Trigger.dev
   * @returns A summary object with counts of recurring transactions identified
   */
  run: async (payload, { ctx }) => {
    // Create a trace for the entire analysis operation
    return await logger.trace(
      'analyze-recurring-transactions',
      async (span) => {
        const { userId, bankAccountId, lookbackDays } = payload;

        span.setAttribute('userId', userId);
        span.setAttribute('bankAccountId', bankAccountId);
        span.setAttribute('lookbackDays', lookbackDays);

        logger.info('Starting recurring transaction analysis', {
          bankAccountId,
          lookbackDays,
        });

        try {
          // Calculate the lookback date
          const lookbackDate = new Date();
          lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);

          // Fetch transactions for the analysis period
          const transactions = await logger.trace(
            'fetch-transaction-history',
            async (fetchSpan) => {
              fetchSpan.setAttribute(
                'lookbackDate',
                lookbackDate.toISOString()
              );

              try {
                const result = await prisma.transaction.findMany({
                  where: {
                    bankAccountId,
                    date: { gte: lookbackDate },
                    status: 'posted', // Only analyze posted transactions, not pending
                  },
                  orderBy: { date: 'asc' },
                });

                fetchSpan.setAttribute('transactionCount', result.length);
                logger.info(
                  `Found ${result.length} transactions for analysis`,
                  { bankAccountId }
                );

                return result;
              } catch (fetchError) {
                const errorMessage =
                  fetchError instanceof Error
                    ? fetchError.message
                    : 'Unknown database error';
                fetchSpan.setAttribute('error', errorMessage);
                logger.error('Database error during transaction fetch', {
                  error: errorMessage,
                  bankAccountId,
                });
                throw fetchError;
              }
            }
          );

          // Identify recurring patterns - this would be a simplified version
          // A real implementation would have more sophisticated pattern recognition
          const recurringPatterns = await logger.trace(
            'identify-patterns',
            async (patternSpan) => {
              try {
                // Define the transaction pattern interface
                interface TransactionPattern {
                  merchant: string;
                  frequency: string;
                  averageAmount: number;
                  lastDate: string | Date;
                  transactionCount: number;
                }

                // Group by merchant name
                const groupedByMerchant = transactions.reduce<
                  Record<string, typeof transactions>
                >((acc, transaction) => {
                  const name = transaction.name;
                  if (!acc[name]) acc[name] = [];
                  acc[name].push(transaction);
                  return acc;
                }, {});

                // Find merchants with 3+ transactions
                const recurringMerchants = Object.keys(
                  groupedByMerchant
                ).filter((merchant) => groupedByMerchant[merchant].length >= 3);

                patternSpan.setAttribute(
                  'recurringMerchantCount',
                  recurringMerchants.length
                );

                // Analyze each recurring merchant for patterns
                const patterns: TransactionPattern[] = [];
                for (const merchant of recurringMerchants) {
                  const txs = groupedByMerchant[merchant];

                  // Sort transactions by date
                  txs.sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  );

                  // Check for consistent amounts
                  const amounts = txs.map((tx) => tx.amount);
                  const isConsistentAmount = new Set(amounts).size <= 2; // Allow small variations

                  // Check for consistent intervals (very simplified)
                  const dates = txs.map((tx) => new Date(tx.date).getTime());
                  let intervals: number[] = [];
                  for (let i = 1; i < dates.length; i++) {
                    intervals.push(
                      Math.round(
                        (dates[i] - dates[i - 1]) / (24 * 60 * 60 * 1000)
                      )
                    );
                  }

                  // Determine approximate frequency
                  let frequency = 'unknown';
                  const avgInterval =
                    intervals.reduce((sum, interval) => sum + interval, 0) /
                    intervals.length;

                  if (avgInterval <= 7) frequency = 'weekly';
                  else if (avgInterval <= 14) frequency = 'biweekly';
                  else if (avgInterval <= 31) frequency = 'monthly';
                  else if (avgInterval <= 92) frequency = 'quarterly';
                  else frequency = 'yearly';

                  if (isConsistentAmount) {
                    patterns.push({
                      merchant,
                      frequency,
                      averageAmount:
                        amounts.reduce((sum, amt) => sum + amt, 0) /
                        amounts.length,
                      lastDate: txs[txs.length - 1].date,
                      transactionCount: txs.length,
                    });
                  }
                }

                patternSpan.setAttribute(
                  'identifiedPatternsCount',
                  patterns.length
                );
                logger.info(
                  `Identified ${patterns.length} recurring transaction patterns`,
                  { bankAccountId }
                );

                return patterns;
              } catch (patternError) {
                const errorMessage =
                  patternError instanceof Error
                    ? patternError.message
                    : 'Unknown error';
                patternSpan.setAttribute('error', errorMessage);
                logger.error('Error during pattern identification', {
                  error: errorMessage,
                  bankAccountId,
                });
                throw patternError;
              }
            }
          );

          // Store the recurring transaction patterns
          await logger.trace('store-recurring-patterns', async (storeSpan) => {
            storeSpan.setAttribute('patternCount', recurringPatterns.length);

            try {
              // Clear previous recurring transactions for this account that were auto-detected
              await prisma.recurringTransaction.deleteMany({
                where: {
                  bankAccountId,
                  source: 'detected',
                },
              });

              // Insert new recurring patterns
              if (recurringPatterns.length > 0) {
                const today = new Date();

                // Convert our frequency formats to match the enum
                const frequencyMap: Record<string, any> = {
                  weekly: 'WEEKLY',
                  biweekly: 'BIWEEKLY',
                  monthly: 'MONTHLY',
                  quarterly: 'IRREGULAR', // No direct mapping for quarterly
                  yearly: 'ANNUALLY',
                  unknown: 'UNKNOWN',
                };

                await prisma.recurringTransaction.createMany({
                  data: recurringPatterns.map((pattern) => ({
                    bankAccountId,
                    title: pattern.merchant,
                    description: `Auto-detected recurring payment to ${pattern.merchant}`,
                    amount: Math.abs(pattern.averageAmount),
                    currency: 'USD', // Default, could be improved with actual currency
                    frequency: frequencyMap[pattern.frequency] || 'UNKNOWN',
                    startDate: new Date(pattern.lastDate),
                    nextScheduledDate: calculateNextOccurrence(
                      pattern.lastDate,
                      pattern.frequency
                    ),
                    merchantName: pattern.merchant,
                    confidenceScore: 0.7, // Medium confidence for auto-detected
                    source: 'detected',
                    status: 'active',
                    isAutomated: false, // Don't auto-create transactions
                    transactionType: 'subscription', // Assume subscription
                    executionCount: pattern.transactionCount,
                  })),
                });
              }

              logger.info(
                `Stored ${recurringPatterns.length} recurring transaction patterns`,
                { bankAccountId }
              );
            } catch (storeError) {
              const errorMessage =
                storeError instanceof Error
                  ? storeError.message
                  : 'Unknown database error';
              storeSpan.setAttribute('error', errorMessage);
              logger.error('Database error when storing recurring patterns', {
                error: errorMessage,
                bankAccountId,
              });
              throw storeError;
            }
          });

          logger.info('Recurring transaction analysis completed successfully', {
            bankAccountId,
            patternsIdentified: recurringPatterns.length,
          });

          return {
            status: 'success',
            patternsIdentified: recurringPatterns.length,
            message: `Successfully identified ${recurringPatterns.length} recurring transaction patterns`,
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          span.setAttribute('error', errorMessage);

          logger.error('Failed to analyze recurring transactions', {
            error: errorMessage,
            bankAccountId,
          });

          throw new Error(
            `Failed to analyze recurring transactions: ${errorMessage}`
          );
        }
      }
    );
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

    // For resource-intensive operations, maybe just skip retrying
    if (error instanceof Error && error.message.includes('resource limit')) {
      logger.warn(
        `Resource limit reached, skipping retry for account ${bankAccountId}`
      );
      return {
        skipRetrying: true,
      };
    }

    // For other errors, use the default retry strategy
    return undefined;
  },
});

/**
 * Helper function to calculate the next occurrence date based on frequency
 *
 * @param lastDate - The date of the last transaction
 * @param frequency - The identified frequency pattern
 * @returns The predicted date of the next occurrence
 */
function calculateNextOccurrence(
  lastDate: string | Date,
  frequency: string
): Date {
  const date = new Date(lastDate);

  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      // For unknown frequency, default to monthly
      date.setMonth(date.getMonth() + 1);
  }

  return date;
}
