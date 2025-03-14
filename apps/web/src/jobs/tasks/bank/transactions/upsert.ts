import { AccountStatus, TransactionCategory } from '@prisma/client';
import { addDays, format, subDays } from 'date-fns';
import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { getTransactions } from '@/server/services/plaid';
import { prisma } from '@/server/db';
import { z } from 'zod';

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
    accessToken: z.string(),
    bankAccountId: z.string(),
    endDate: z.string().optional(),
    startDate: z.string().optional(),
    userId: z.string(),
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
    const { accessToken, bankAccountId, endDate, startDate, userId } = payload;

    await logger.info(
      `Starting transaction upsert for account ${bankAccountId}`
    );

    // Get the bank account from the database
    const bankAccount = await prisma.bankAccount.findUnique({
      select: {
        id: true,
        bankConnectionId: true,
        name: true,
        plaidAccountId: true,
        status: true,
        updatedAt: true,
      },
      where: { id: bankAccountId },
    });

    if (!bankAccount) {
      await logger.error(`Bank account ${bankAccountId} not found`);

      throw new Error(`Bank account ${bankAccountId} not found`);
    }

    // get the bank connection for the bank account
    const bankConnection = await prisma.bankConnection.findUnique({
      where: {
        id: bankAccount.bankConnectionId,
      },
    });

    if (bankAccount.status !== 'ACTIVE') {
      await logger.info(
        `Bank account ${bankAccountId} is not active, skipping sync`
      );

      return {
        reason: 'Account not active',
        status: 'skipped',
      };
    }

    // Set sync status to in progress
    await prisma.bankAccount.update({
      data: {
        status: AccountStatus.PENDING,
        updatedAt: new Date(),
      },
      where: { id: bankAccountId },
    });

    try {
      // Determine date range for transaction fetch
      const today = new Date();
      const defaultStartDate = bankAccount.updatedAt
        ? subDays(bankAccount.updatedAt, 5) // Overlap to catch pending transactions
        : subDays(today, 90); // Initial sync goes back 90 days
      const defaultEndDate = addDays(today, 1); // Include today's transactions

      const start = startDate ? new Date(startDate) : defaultStartDate;
      const end = endDate ? new Date(endDate) : defaultEndDate;

      // Format dates as strings for Plaid API
      const startDateStr = format(start, 'yyyy-MM-dd');
      const endDateStr = format(end, 'yyyy-MM-dd');

      // Get all accounts for this connection to pass to getTransactions
      const bankAccounts = await prisma.bankAccount.findMany({
        where: { bankConnectionId: bankAccount.bankConnectionId },
      });

      if (!bankConnection) {
        throw new Error(
          `Bank connection not found for account ${bankAccountId}`
        );
      }

      // Fetch transactions from Plaid
      const plaidTransactions = await getTransactions(
        accessToken,
        bankConnection,
        bankAccounts,
        startDateStr,
        endDateStr
      );

      await logger.info(
        `Fetched ${plaidTransactions.length} transactions from Plaid`
      );

      let updatedCount = 0;
      let newCount = 0;

      // Process the transactions in batches
      for (const plaidTransaction of plaidTransactions) {
        // Check if the transaction already exists
        const existingTransaction = await prisma.transaction.findFirst({
          where: {
            bankAccountId: bankAccountId,
            plaidTransactionId: plaidTransaction.plaidTransactionId,
          },
        });

        // Determine category
        let category: TransactionCategory | null = null;

        if (
          plaidTransaction.originalCategory &&
          plaidTransaction.originalCategory.length > 0
        ) {
          // Map the Plaid category to our category enum
          try {
            category = mapPlaidCategoryToTransactionCategory(
              plaidTransaction.originalCategory.split(',')[0].trim()
            );
          } catch (error) {
            await logger.warn(
              `Could not map category for transaction ${plaidTransaction.plaidTransactionId}: ${error}`
            );
          }
        }
        if (existingTransaction) {
          // Update the existing transaction
          await prisma.transaction.update({
            data: {
              amount: plaidTransaction.amount,
              category: category,
              date: new Date(plaidTransaction.date),
              merchantName: plaidTransaction.merchantName || null,
              name: plaidTransaction.name,
              pending: plaidTransaction.pending,
              updatedAt: new Date(),
            },
            where: { id: existingTransaction.id },
          });
          updatedCount++;
        } else {
          // Create a new transaction
          await prisma.transaction.create({
            data: {
              amount: plaidTransaction.amount,
              bankAccount: { connect: { id: bankAccountId } },
              userId: userId,
              category: category,
              date: new Date(plaidTransaction.date),
              merchantName: plaidTransaction.merchantName || null,
              name: plaidTransaction.name,
              pending: plaidTransaction.pending,
              plaidTransactionId: plaidTransaction.plaidTransactionId,
            },
          });
          newCount++;
        }
      }

      // Update bank account with last synced time
      await prisma.bankAccount.update({
        data: {
          status: AccountStatus.ACTIVE,
          updatedAt: new Date(),
        },
        where: { id: bankAccountId },
      });

      await logger.info(
        `Transaction sync completed. Added ${newCount}, updated ${updatedCount} transactions`
      );

      return {
        newTransactions: newCount,
        status: 'success',
        totalTransactions: plaidTransactions.length,
        updatedTransactions: updatedCount,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await logger.error(`Transaction sync failed: ${errorMessage}`);

      // Update bank account with error information
      await prisma.bankAccount.update({
        data: {
          status: AccountStatus.INACTIVE,
          updatedAt: new Date(),
        },
        where: { id: bankAccountId },
      });

      throw error;
    }
  },
});

/**
 * Maps Plaid category strings to internal TransactionCategory enum values
 *
 * This mapping function converts Plaid's category strings into our
 * application's standardized transaction categories, allowing for consistent
 * categorization regardless of the data source.
 *
 * @param plaidCategory - The category string from Plaid (e.g., 'Food and
 *   Drink', 'Transportation')
 * @returns The appropriate TransactionCategory enum value, or
 *   TransactionCategory.OTHER if no match is found
 */
function mapPlaidCategoryToTransactionCategory(
  plaidCategory: string
): TransactionCategory | null {
  const categoryMap: Record<string, TransactionCategory> = {
    'Bank Fees': TransactionCategory.BANK_FEES,
    'Bills and Utilities': TransactionCategory.UTILITIES,
    Education: TransactionCategory.OTHER,
    Entertainment: TransactionCategory.ENTERTAINMENT,
    'Food and Drink': TransactionCategory.FOOD_AND_DRINK,
    'General Merchandise': TransactionCategory.GENERAL_MERCHANDISE,
    Groceries: TransactionCategory.FOOD_AND_DRINK,
    Healthcare: TransactionCategory.MEDICAL,
    Home: TransactionCategory.HOME_IMPROVEMENT,
    Income: TransactionCategory.INCOME,
    Insurance: TransactionCategory.OTHER,
    Loan: TransactionCategory.LOAN_PAYMENTS,
    Medical: TransactionCategory.MEDICAL,
    Payment: TransactionCategory.TRANSFER,
    'Personal Care': TransactionCategory.PERSONAL_CARE,
    'Professional Services': TransactionCategory.GENERAL_SERVICES,
    Recreation: TransactionCategory.ENTERTAINMENT,
    Rent: TransactionCategory.HOME_IMPROVEMENT,
    Restaurants: TransactionCategory.FOOD_AND_DRINK,
    Shopping: TransactionCategory.GENERAL_MERCHANDISE,
    Tax: TransactionCategory.GOVERNMENT_AND_NON_PROFIT,
    Transfer: TransactionCategory.TRANSFER,
    Transportation: TransactionCategory.TRANSPORTATION,
    Travel: TransactionCategory.TRAVEL,
  };

  return categoryMap[plaidCategory] || TransactionCategory.OTHER;
}
