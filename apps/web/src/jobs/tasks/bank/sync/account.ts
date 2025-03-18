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

/**
 * The number of transactions to process in a single batch to avoid memory
 * issues
 */
const BATCH_SIZE = 500;

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
export const syncAccount = schemaTask({
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
  schema: z.object({
    /** The internal bank account ID */
    id: z.string(),

    /** The team ID that owns this account */
    teamId: z.string(),

    /** The external account ID from the provider */
    accountId: z.string(),

    /** The access token for the provider API */
    accessToken: z.string(),

    /** Number of previous error retries */
    errorRetries: z.number().optional(),

    /** The financial data provider */
    provider: z.enum([
      'gocardless',
      'plaid',
      'teller',
      'enablebanking',
      'stripe',
    ]),

    /** Whether this is a manually triggered sync */
    manualSync: z.boolean().optional(),

    /** The type of bank account */
    accountType: z
      .enum(Object.values(AccountType) as [string, ...string[]])
      .optional(),
  }),
  /**
   * Main execution function for the account sync task
   *
   * @param payload - The validated input parameters
   * @param payload.id - The internal bank account ID
   * @param payload.teamId - The team ID that owns this account
   * @param payload.accountId - The external account ID from the provider
   * @param payload.accessToken - The access token for the provider API
   * @param payload.errorRetries - Number of previous error retries
   * @param payload.provider - The financial data provider
   * @param payload.manualSync - Whether this is a manually triggered sync
   * @param payload.accountType - The type of bank account
   * @param ctx - The execution context provided by Trigger.dev
   * @returns Void or throws an error if the process fails
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

      let classification: AccountClassification | undefined;

      if (accountType) {
        classification = getClassification(accountType as AccountType);
      }

      // Fetch and update balance
      await logger.trace('fetch-account-balance', async (balanceSpan) => {
        balanceSpan.setAttribute('accountId', accountId);

        try {
          logger.info('Fetching account balance', { accountId });

          const balanceResponse =
            await client.apiFinancialAccounts.listBalances({
              provider: provider as
                | 'gocardless'
                | 'plaid'
                | 'teller'
                | 'stripe',
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

            logger.info('Account balance is zero or not available', {
              accountId,
            });
          }
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
                errorDetails: parsedError.message,
                errorRetries: retries,
              },
            });

            throw error;
          }
        }
      });

      // Fetch and process transactions
      await logger.trace(
        'fetch-account-transactions',
        async (transactionSpan) => {
          transactionSpan.setAttribute('accountId', accountId);
          transactionSpan.setAttribute('manualSync', Boolean(manualSync));

          try {
            logger.info('Fetching transactions', { accountId });

            const payload: APITransactionListParams = {
              provider: provider as
                | 'gocardless'
                | 'plaid'
                | 'teller'
                | 'stripe',
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

            const transactionsResponse =
              await client.apiTransactions.list(payload);

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
            for (let i = 0; i < transactionCount; i += BATCH_SIZE) {
              const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
              const transactionBatch = transactionsData.slice(
                i,
                i + BATCH_SIZE
              );
              const batchSize = transactionBatch.length;

              await logger.trace(
                'process-transaction-batch',
                async (batchSpan) => {
                  batchSpan.setAttribute('batchNumber', batchNumber);
                  batchSpan.setAttribute('batchSize', batchSize);
                  batchSpan.setAttribute('batchStart', i);
                  batchSpan.setAttribute('batchEnd', i + batchSize - 1);

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

                    // Continue with other batches even if one fails
                    // This ensures we don't lose all transactions if one batch fails
                  }
                }
              );
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
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            transactionSpan.setAttribute('error', errorMessage);

            logger.error('Failed to sync transactions', {
              error: errorMessage,
              accountId,
            });
            throw error;
          }
        }
      );

      return {
        success: true,
        accountId,
        provider,
        message: `Successfully synced account ${accountId}`,
      };
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
    const { accountId, provider } = payload;

    // If it's a rate limiting error, wait longer
    if (
      error instanceof Error &&
      (error.message.includes('rate limit') ||
        error.message.includes('too many requests'))
    ) {
      logger.warn(`Rate limit hit for ${provider}, delaying retry`, {
        accountId,
      });
      return {
        retryAt: new Date(Date.now() + 300000), // Wait 5 minutes
      };
    }

    // If the API is down or unreachable, wait longer
    if (
      error instanceof Error &&
      (error.message.includes('service unavailable') ||
        error.message.includes('connection refused'))
    ) {
      logger.warn(`Provider API unavailable for ${provider}, delaying retry`, {
        accountId,
      });
      return {
        retryAt: new Date(Date.now() + 600000), // Wait 10 minutes
      };
    }

    // If it's a disconnected account, don't retry
    const parsedError = parseAPIError(error);
    if (parsedError.code === 'disconnected') {
      logger.warn(`Account ${accountId} is disconnected, skipping retries`, {
        provider,
      });
      return {
        skipRetrying: true,
      };
    }

    // For other errors, use the default retry strategy
    return;
  },
});
