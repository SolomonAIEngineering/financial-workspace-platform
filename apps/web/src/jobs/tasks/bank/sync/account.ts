import {
  AccountClassification,
  getClassification,
} from '@/jobs/utils/transform';
import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { APITransactionListParams } from '@solomon-ai/workspace-financial-backend-sdk/resources/index.js';
import { AccountType } from '@/server/types/index';
import { engine as client } from '@/lib/engine';
import { parseAPIError } from '@/jobs/utils/parse-error';
import { prisma } from '@/server/db';
import { upsertTransactionsJob as upsertTransactions } from '../transactions/upsert';
import { z } from 'zod';

const BATCH_SIZE = 500;

export const syncAccount = schemaTask({
  id: 'sync-account',
  maxDuration: 300,
  retry: {
    maxAttempts: 2,
  },
  schema: z.object({
    id: z.string(),
    teamId: z.string(),
    accountId: z.string(),
    accessToken: z.string(),
    errorRetries: z.number().optional(),
    provider: z.enum([
      'gocardless',
      'plaid',
      'teller',
      'enablebanking',
      'stripe',
    ]),
    manualSync: z.boolean().optional(),
    accountType: z
      .enum(Object.values(AccountType) as [string, ...string[]])
      .optional(),
  }),
  run: async (payload, { ctx }) => {
    const {
      id,
      teamId,
      accountId,
      accountType,
      accessToken,
      errorRetries,
      provider,
      manualSync,
    } = payload;

    // Log start of sync process
    logger.info('Starting account sync process', { accountId, provider });

    let classification: AccountClassification | undefined;

    if (accountType) {
      classification = getClassification(accountType as AccountType);
    }

    // Get the balance
    try {
      logger.info('Fetching account balance', { accountId });

      const balanceResponse = await client.apiFinancialAccounts.listBalances({
        provider: provider as 'gocardless' | 'plaid' | 'teller' | 'stripe',
        id: accountId,
        accessToken,
      });

      if (!balanceResponse) {
        throw new Error('Failed to get balance');
      }

      const { data: balanceData } = balanceResponse;

      logger.info('Successfully fetched balance, updating database', {
        accountId,
      });

      // Only update the balance if it's greater than 0
      const balance = balanceData?.amount ?? 0;

      if (balance > 0) {
        // Reset error details and retries if we successfully got the balance
        await prisma.bankAccount.update({
          where: { id },
          data: {
            balance: balance as number,
            errorDetails: null,
            errorRetries: null,
          },
        });

        logger.info(`Updated account balance: ${balance}`, { accountId });
      } else {
        // Reset error details and retries if we successfully got the balance
        await prisma.bankAccount.update({
          where: { id },
          data: {
            errorDetails: null,
            errorRetries: null,
          },
        });

        logger.info('Account balance is zero or not available', { accountId });
      }
    } catch (error) {
      const parsedError = parseAPIError(error);

      logger.error('Failed to sync account balance', {
        error: parsedError,
        accountId,
      });

      if (parsedError.code === 'disconnected') {
        const retries = errorRetries ? errorRetries + 1 : 1;

        // Update the account with the error details and retries
        await prisma.bankAccount.update({
          where: { id },
          data: {
            errorDetails: parsedError.message,
            errorRetries: retries,
          },
        });

        throw error;
      }
    }

    // Get the transactions
    try {
      logger.info('Fetching transactions', { accountId });

      const payload: APITransactionListParams = {
        provider: provider as 'gocardless' | 'plaid' | 'teller' | 'stripe',
        accountId,
        accessToken,
        // If the transactions are being synced manually, we want to get all transactions
        latest: manualSync ? 'false' : 'true',
        syncCursor: manualSync ? undefined : undefined,
      };

      if (classification) {
        payload.accountType = classification;
      }

      const transactionsResponse = await client.apiTransactions.list(payload);

      if (!transactionsResponse) {
        throw new Error('Failed to get transactions');
      }

      // Reset error details and retries if we successfully got the transactions
      await prisma.bankAccount.update({
        where: { id },
        data: {
          errorDetails: null,
          errorRetries: null,
        },
      });

      const { data: transactionsData } = transactionsResponse;

      if (!transactionsData) {
        logger.info(`No transactions to upsert for account ${accountId}`);
        return;
      }

      logger.info(`Found ${transactionsData.length} transactions to process`, {
        accountId,
      });

      // Upsert transactions in batches of 500
      // This is to avoid memory issues with the DB
      for (let i = 0; i < transactionsData.length; i += BATCH_SIZE) {
        const transactionBatch = transactionsData.slice(i, i + BATCH_SIZE);

        logger.info(
          `Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(transactionsData.length / BATCH_SIZE)}`,
          { accountId }
        );

        await upsertTransactions.triggerAndWait({
          transactions: transactionBatch,
          userId: id,
          bankAccountId: id,
          manualSync,
        });
      }

      logger.info('Transaction sync completed successfully', { accountId });
    } catch (error) {
      logger.error('Failed to sync transactions', { error, accountId });
      throw error;
    }
  },
});
