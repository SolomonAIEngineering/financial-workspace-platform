import {
  AccountClassification,
  getClassification,
} from '@solomonai/jobs/src/utils/transform';
import {
  SyncAccountInput,
  SyncAccountOutput,
  syncAccountInputSchema
} from './schema';
import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { APITransactionListParams } from '@solomon-ai/workspace-financial-backend-sdk/resources/index.js';
import { AccountType } from '@solomonai/prisma';
import { Task } from '@trigger.dev/sdk/v3';
import { engine as client } from '@solomonai/lib/clients';
import { parseAPIError } from '@solomonai/jobs/src/utils/parse-error';
import { prisma } from '@solomonai/prisma/server';
import { upsertTransactionsJob as upsertTransactions } from '../transactions/upsert';

/**
 * The number of transactions to process in a single batch to avoid memory
 * issues
 */
const BATCH_SIZE = 500;

/**
 * Verifies that a bank account exists before proceeding with sync
 * 
 * @param accountId - The internal bank account ID
 * @returns The bank account record or throws if not found
 */
async function verifyBankAccountExists(accountId: string) {
  const bankAccount = await prisma.bankAccount.findUnique({
    where: { id: accountId },
  });

  if (!bankAccount) {
    const errorMessage = `Bank account with ID ${accountId} not found in database`;
    logger.error('Bank account not found, cannot sync', { id: accountId });
    throw new Error(errorMessage);
  }

  return bankAccount;
}

/**
 * Fetches and updates account balance
 * 
 * @param params - Parameters needed for balance update
 * @returns Whether the operation was successful
 */
async function fetchAndUpdateBalance({
  id,
  accountId,
  provider,
  accessToken,
  errorRetries,
}: {
  id: string;
  accountId: string;
  provider: string;
  accessToken: string;
  errorRetries?: number;
}) {
  return await logger.trace('fetch-account-balance', async (balanceSpan) => {
    balanceSpan.setAttribute('accountId', accountId);

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
      balanceSpan.setAttribute('balanceReceived', Boolean(balanceData));

      logger.info('Successfully fetched balance, updating database', {
        accountId,
      });

      // Only update the balance if it's greater than 0
      const balance = balanceData?.amount ?? 0;
      balanceSpan.setAttribute('balance', balance);

      if (balance > 0) {
        // Reset error details and retries if we successfully got the balance
        await prisma.bankAccount.update({
          where: { id },
          data: {
            currentBalance: balance as number,
            errorMessage: null,
            errorCount: 0,
          },
        });

        logger.info(`Updated account balance: ${balance}`, { accountId });
      } else {
        // Reset error details and retries if we successfully got the balance
        await prisma.bankAccount.update({
          where: { id },
          data: {
            errorMessage: null,
            errorCount: 0,
          },
        });

        logger.info('Account balance is zero or not available', {
          accountId,
        });
      }

      return true;
    } catch (error) {
      const parsedError = parseAPIError(error);
      balanceSpan.setAttribute('error', parsedError.message);
      balanceSpan.setAttribute('errorCode', parsedError.code || 'unknown');

      logger.error('Failed to sync account balance', {
        error: parsedError,
        accountId,
      });

      if (parsedError.code === 'disconnected') {
        const retries = errorRetries ? errorRetries + 1 : 1;
        balanceSpan.setAttribute('errorRetries', retries);

        // Update the account with the error details and retries
        await prisma.bankAccount.update({
          where: { id },
          data: {
            errorMessage: parsedError.message,
            errorCount: retries,
          },
        });

        throw error;
      }

      return false;
    }
  });
}

/**
 * Processes a batch of transactions for a bank account
 * 
 * @param params - Parameters needed for batch processing
 * @returns Success status of the batch processing
 */
async function processTransactionBatch({
  batchNumber,
  batchCount,
  transactionBatch,
  accountId,
  id,
  manualSync,
}: {
  batchNumber: number;
  batchCount: number;
  transactionBatch: any[];
  accountId: string;
  id: string;
  manualSync?: boolean;
}) {
  const batchSize = transactionBatch.length;

  return await logger.trace(
    'process-transaction-batch',
    async (batchSpan) => {
      batchSpan.setAttribute('batchNumber', batchNumber);
      batchSpan.setAttribute('batchSize', batchSize);
      batchSpan.setAttribute('batchStart', (batchNumber - 1) * BATCH_SIZE);
      batchSpan.setAttribute('batchEnd', (batchNumber - 1) * BATCH_SIZE + batchSize - 1);

      logger.info(
        `Processing batch ${batchNumber} of ${batchCount} (${batchSize} transactions)`,
        { accountId }
      );

      try {
        await upsertTransactions.triggerAndWait({
          transactions: transactionBatch,
          userId: id,
          bankAccountId: id,
          manualSync,
        });

        logger.info(`Successfully processed batch ${batchNumber}`, {
          accountId,
          batchSize,
        });
        return true;
      } catch (batchError) {
        const errorMessage =
          batchError instanceof Error
            ? batchError.message
            : 'Unknown batch processing error';

        batchSpan.setAttribute('error', errorMessage);
        logger.error(
          `Failed to process transaction batch ${batchNumber}`,
          {
            error: errorMessage,
            accountId,
            batchNumber,
            batchSize,
          }
        );
        return false;
      }
    }
  );
}

/**
 * Fetches and processes transactions for a bank account
 * 
 * @param params - Parameters needed for transaction processing
 * @returns Whether the operation was successful
 */
async function fetchAndProcessTransactions({
  id,
  accountId,
  provider,
  accessToken,
  classification,
  manualSync,
}: {
  id: string;
  accountId: string;
  provider: string;
  accessToken: string;
  classification?: AccountClassification;
  manualSync?: boolean;
}) {
  return await logger.trace(
    'fetch-account-transactions',
    async (transactionSpan) => {
      transactionSpan.setAttribute('accountId', accountId);
      transactionSpan.setAttribute('manualSync', Boolean(manualSync));

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
          transactionSpan.setAttribute('classification', classification);
        }

        const transactionsResponse = await client.apiTransactions.list(payload);

        if (!transactionsResponse) {
          throw new Error('Failed to get transactions');
        }

        // Reset error details and retries if we successfully got the transactions
        await prisma.bankAccount.update({
          where: { id },
          data: {
            errorMessage: null,
            errorCount: 0,
          },
        });

        const { data: transactionsData } = transactionsResponse;

        if (!transactionsData) {
          logger.info(`No transactions to upsert for account ${accountId}`);
          return true;
        }

        const transactionCount = transactionsData.length;
        transactionSpan.setAttribute('transactionCount', transactionCount);

        logger.info(`Found ${transactionCount} transactions to process`, {
          accountId,
        });

        // Calculate batch info for logging
        const batchCount = Math.ceil(transactionCount / BATCH_SIZE);
        transactionSpan.setAttribute('batchCount', batchCount);

        // Upsert transactions in batches of 500
        // This is to avoid memory issues with the DB
        let allBatchesSuccessful = true;
        for (let i = 0; i < transactionCount; i += BATCH_SIZE) {
          const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
          const transactionBatch = transactionsData.slice(i, i + BATCH_SIZE);

          const batchSuccess = await processTransactionBatch({
            batchNumber,
            batchCount,
            transactionBatch,
            accountId,
            id,
            manualSync,
          });

          if (!batchSuccess) {
            allBatchesSuccessful = false;
          }
        }

        logger.info('Transaction sync completed successfully', {
          accountId,
          transactionCount,
          batchCount,
        });

        // Update the last synced timestamp
        await prisma.bankAccount.update({
          where: { id },
          data: {
            lastSyncedAt: new Date(),
          },
        });

        return allBatchesSuccessful;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        transactionSpan.setAttribute('error', errorMessage);

        logger.error('Failed to sync transactions', {
          error: errorMessage,
          accountId,
        });
        throw error;
      }
    }
  );
}

/**
 * Syncs a bank account by fetching its latest balance and transactions. This
 * task is a critical component of the financial data refresh pipeline.
 *
 * @remarks
 *   This task handles two primary operations:
 *
 *   1. Fetching and updating the current balance for the account
 *   2. Retrieving transactions and processing them in batches
 *
 *   The task implements error handling, retry mechanisms, and comprehensive
 *   tracing to ensure reliable execution even with intermittent provider API
 *   issues. It can handle various account types and financial providers.
 * @example
 *   ```ts
 *   await client.sendEvent({
 *     name: 'sync-account-trigger',
 *     payload: {
 *       id: 'account-123',
 *       teamId: 'team-456',
 *       accountId: 'ext-acct-789',
 *       provider: 'plaid',
 *       accessToken: 'access-token-xyz',
 *       manualSync: true,
 *       accountType: 'CHECKING'
 *     },
 *   });
 *   ```;
 *
 * @returns Void or throws an error if the process fails
 */
export const syncAccount: Task<
  'sync-account',
  SyncAccountInput,
  SyncAccountOutput
> = schemaTask({
  id: 'sync-account',
  maxDuration: 300,
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
  schema: syncAccountInputSchema,
  /**
   * Main execution function for the account sync task
   *
   * @param payload - The validated input parameters
   * @returns Object indicating success status and details
   */
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

    // Verify account exists before proceeding
    await verifyBankAccountExists(id);

    // Create a trace for the entire sync operation
    return await logger.trace('sync-bank-account', async (span) => {
      span.setAttribute('accountId', accountId);
      span.setAttribute('provider', provider);
      span.setAttribute('teamId', teamId);
      span.setAttribute('manualSync', Boolean(manualSync));

      if (accountType) {
        span.setAttribute('accountType', accountType);
      }

      // Log start of sync process
      logger.info('Starting account sync process', { accountId, provider });

      // Determine account classification if type is provided
      let classification: AccountClassification | undefined;
      if (accountType) {
        // accountType is now properly typed as AccountType enum
        classification = getClassification(accountType);
      }

      // Step 1: Fetch and update balance
      await fetchAndUpdateBalance({
        id,
        accountId,
        provider,
        accessToken,
        errorRetries,
      });

      // Step 2: Fetch and process transactions
      await fetchAndProcessTransactions({
        id,
        accountId,
        provider,
        accessToken,
        classification,
        manualSync,
      });

      return {
        success: true,
        accountId,
        provider,
        message: `Successfully synced account ${accountId}`,
      };
    });
  },
});
