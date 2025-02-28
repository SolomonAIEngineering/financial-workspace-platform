import { AccountStatus, TransactionCategory } from '@prisma/client';
import { eventTrigger } from '@trigger.dev/sdk';
import { addDays, format, subDays } from 'date-fns';

import { prisma } from '@/server/db';
import { getTransactions } from '@/server/services/plaid';

import { client } from '../../../client';

/**
 * This job handles upserting transactions from Plaid to the database It
 * processes transactions in batches to avoid hitting rate limits and handles
 * duplicate detection and transaction updates
 */
export const upsertTransactionsJob = client.defineJob({
  id: 'upsert-transactions-job',
  name: 'Upsert Transactions',
  trigger: eventTrigger({
    name: 'upsert-transactions',
  }),
  version: '1.0.0',
  run: async (payload, io) => {
    const { accessToken, bankAccountId, endDate, startDate, userId } = payload;

    await io.logger.info(
      `Starting transaction upsert for account ${bankAccountId}`
    );

    // Get the bank account from the database
    const bankAccount = await io.runTask('get-bank-account', async () => {
      return await prisma.bankAccount.findUnique({
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
    });

    if (!bankAccount) {
      await io.logger.error(`Bank account ${bankAccountId} not found`);

      throw new Error(`Bank account ${bankAccountId} not found`);
    }
    if (bankAccount.status !== 'ACTIVE') {
      await io.logger.info(
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

      // Get the bank connection for this account
      const bankConnection = await prisma.bankConnection.findUnique({
        where: { id: bankAccount.bankConnectionId },
      });

      if (!bankConnection) {
        throw new Error(
          `Bank connection not found for account ${bankAccountId}`
        );
      }

      // Get all accounts for this connection to pass to getTransactions
      const bankAccounts = await prisma.bankAccount.findMany({
        where: { bankConnectionId: bankAccount.bankConnectionId },
      });

      // Fetch transactions from Plaid
      const plaidTransactions = await io.runTask(
        'fetch-plaid-transactions',
        async () => {
          return await getTransactions(
            accessToken,
            bankConnection,
            bankAccounts,
            startDateStr,
            endDateStr
          );
        }
      );

      await io.logger.info(
        `Fetched ${plaidTransactions.length} transactions from Plaid`
      );

      // Process the transactions in batches
      const transactionCount = await io.runTask(
        'process-transactions',
        async () => {
          let newCount = 0;
          let updatedCount = 0;

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
                await io.logger.warn(
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
                  bankConnection: {
                    connect: { id: bankAccount.bankConnectionId },
                  },
                  category: category,
                  date: new Date(plaidTransaction.date),
                  merchantName: plaidTransaction.merchantName || null,
                  name: plaidTransaction.name,
                  pending: plaidTransaction.pending,
                  plaidTransactionId: plaidTransaction.plaidTransactionId,
                  user: { connect: { id: userId } },
                },
              });
              newCount++;
            }
          }

          return { newCount, updatedCount };
        }
      );

      // Update bank account with last synced time
      await prisma.bankAccount.update({
        data: {
          status: AccountStatus.ACTIVE,
          updatedAt: new Date(),
        },
        where: { id: bankAccountId },
      });

      await io.logger.info(
        `Transaction sync completed. Added ${transactionCount.newCount}, updated ${transactionCount.updatedCount} transactions`
      );

      return {
        newTransactions: transactionCount.newCount,
        status: 'success',
        totalTransactions: plaidTransactions.length,
        updatedTransactions: transactionCount.updatedCount,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await io.logger.error(`Transaction sync failed: ${errorMessage}`);

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

/** Map Plaid categories to our TransactionCategory enum */
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
