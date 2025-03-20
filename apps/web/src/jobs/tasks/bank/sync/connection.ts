import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { BankConnectionStatus } from '@solomonai/prisma/client';
import { client } from '../../../client';
import { getItemDetails } from '@/server/services/plaid';
import { prisma } from '@/server/db';
import { z } from 'zod';

/**
 * Orchestrates the synchronization of an entire bank connection and all its
 * associated accounts. This task is the central coordinator for the bank data
 * refresh pipeline.
 *
 * @remarks
 *   This task handles these primary functions:
 *
 *   1. Verifies the connection status with the provider (e.g., Plaid)
 *   2. Updates the connection status in the database
 *   3. Triggers individual account syncs for all accounts under this connection
 *   4. Optionally triggers transaction notifications for manual syncs
 *
 *   The task implements error handling, retry mechanisms, and comprehensive
 *   tracing to ensure reliable execution even with intermittent provider API
 *   issues. It includes intelligent handling of connection errors, including
 *   detecting when a user needs to re-authenticate versus other types of
 *   errors.
 * @example
 *   ```ts
 *   await client.sendEvent({
 *     name: 'sync-connection',
 *     payload: {
 *       connectionId: 'conn_123abc',
 *       manualSync: true, // Optional, defaults to false
 *     },
 *   });
 *   ```;
 *
 * @returns A result object with the connection status and related information
 */
export const syncConnectionJob = schemaTask({
  id: BANK_JOBS.SYNC_CONNECTION,
  description: 'Sync Bank Connection',
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
    /** The unique identifier for the bank connection to sync */
    connectionId: z.string(),

    /** Whether this is a manual sync initiated by the user */
    manualSync: z.boolean().optional(),
  }),
  /**
   * Main execution function for the connection sync task
   *
   * @param payload - The validated input parameters
   * @param payload.connectionId - The ID of the bank connection to sync
   * @param payload.manualSync - Whether this is a manual sync initiated by the
   *   user
   * @param ctx - The execution context provided by Trigger.dev
   * @returns A result object containing the connection ID, accounts synced
   *   count, and status
   * @throws Error if the connection sync fails or the connection cannot be
   *   found
   */
  run: async (payload, { ctx }) => {
    const { connectionId, manualSync = false } = payload;

    // Create a trace for the entire sync operation
    return await logger.trace('sync-bank-connection', async (span) => {
      span.setAttribute('connectionId', connectionId);
      span.setAttribute('manualSync', manualSync);

      logger.info(`Starting connection sync for ${connectionId}`);

      try {
        // Fetch the connection details
        const connection = await prisma.bankConnection.findUnique({
          select: {
            id: true,
            accessToken: true,
            institutionId: true,
            institutionName: true,
            status: true,
            userId: true,
          },
          where: { id: connectionId },
        });

        if (!connection) {
          const errorMsg = `Connection ${connectionId} not found`;
          span.setAttribute('error', errorMsg);
          logger.error(errorMsg);
          throw new Error(errorMsg);
        }

        span.setAttribute('institutionId', connection.institutionId);
        span.setAttribute('institutionName', connection.institutionName);
        span.setAttribute('userId', connection.userId);

        // Verify connection status with the provider
        await logger.trace('check-connection-status', async (statusSpan) => {
          statusSpan.setAttribute('connectionId', connectionId);
          statusSpan.setAttribute('institutionId', connection.institutionId);

          try {
            // Check connection status with Plaid
            const connectionDetails = await getItemDetails(
              connection.accessToken
            );

            // Update connection status based on response
            if (connectionDetails.status?.error) {
              const errorMsg = connectionDetails.status.error;
              statusSpan.setAttribute('error', errorMsg);
              logger.warn(`Connection error: ${errorMsg}`);

              // Determine the appropriate status based on the error
              if (errorMsg.includes('ITEM_LOGIN_REQUIRED')) {
                // Login required error
                await prisma.bankConnection.update({
                  data: {
                    errorMessage: errorMsg,
                    lastCheckedAt: new Date(),
                    status: BankConnectionStatus.LOGIN_REQUIRED,
                  },
                  where: { id: connectionId },
                });

                statusSpan.setAttribute(
                  'updatedStatus',
                  BankConnectionStatus.LOGIN_REQUIRED
                );
              } else {
                // General error
                await prisma.bankConnection.update({
                  data: {
                    errorMessage: errorMsg,
                    lastCheckedAt: new Date(),
                    status: BankConnectionStatus.ERROR,
                  },
                  where: { id: connectionId },
                });

                statusSpan.setAttribute(
                  'updatedStatus',
                  BankConnectionStatus.ERROR
                );
              }

              return {
                error: errorMsg,
                status: 'error',
              };
            }

            // Update connection as active
            await prisma.bankConnection.update({
              data: {
                errorMessage: null,
                lastAccessedAt: new Date(),
                lastCheckedAt: new Date(),
                status: BankConnectionStatus.ACTIVE,
              },
              where: { id: connectionId },
            });

            statusSpan.setAttribute(
              'updatedStatus',
              BankConnectionStatus.ACTIVE
            );
            logger.info(`Connection status verified and updated to ACTIVE`);
          } catch (statusError) {
            const errorMessage =
              statusError instanceof Error
                ? statusError.message
                : 'Unknown error';

            statusSpan.setAttribute('error', errorMessage);
            logger.error(`Failed to check connection status: ${errorMessage}`);
            throw statusError;
          }
        });

        // Fetch and sync accounts
        await logger.trace('fetch-accounts', async (accountsSpan) => {
          accountsSpan.setAttribute('connectionId', connectionId);

          try {
            // Fetch all enabled accounts for this connection
            const accounts = await prisma.bankAccount.findMany({
              select: {
                id: true,
                name: true,
                plaidAccountId: true,
                status: true,
                type: true,
              },
              where: {
                bankConnectionId: connectionId,
                enabled: true,
                // For automated syncs, we only include active accounts
                ...(manualSync ? {} : { status: 'ACTIVE' }),
              },
            });

            const accountCount = accounts.length;
            accountsSpan.setAttribute('accountCount', accountCount);

            if (accountCount === 0) {
              logger.info(
                `No active accounts found for connection ${connectionId}`
              );
              return {
                accountsSynced: 0,
                status: 'success',
              };
            }

            logger.info(`Found ${accountCount} accounts to sync`);

            // Trigger account syncs with appropriate delays
            let accountsSynced = 0;

            for (const account of accounts) {
              const delaySeconds = manualSync
                ? accountsSynced * 2
                : accountsSynced * 30;
              accountsSpan.setAttribute(
                `account_${accountsSynced}_id`,
                account.id
              );
              accountsSpan.setAttribute(
                `account_${accountsSynced}_delay`,
                delaySeconds
              );

              await client.sendEvent({
                // Use context for delay information
                context: {
                  delaySeconds,
                },
                name: 'sync-account-trigger',
                payload: {
                  accessToken: connection.accessToken,
                  bankAccountId: account.id,
                  manualSync,
                  userId: connection.userId,
                },
              });

              logger.info(
                `Triggered sync for account ${account.id} with ${delaySeconds}s delay`
              );
              accountsSynced++;
            }

            // For manual syncs, we'll also trigger transaction notifications
            if (manualSync) {
              accountsSpan.setAttribute('triggeredNotifications', true);

              await client.sendEvent({
                // Use context for delay information
                context: {
                  delaySeconds: 120, // 2 minutes
                },
                name: 'sync-transaction-notifications-trigger',
                payload: {
                  userId: connection.userId,
                },
              });

              logger.info(
                `Triggered transaction notifications for user ${connection.userId}`
              );
            }

            logger.info(
              `Connection sync completed, triggered ${accountsSynced} account syncs`
            );

            return {
              accountsSynced,
              connectionId,
              status: 'success',
            };
          } catch (accountsError) {
            const errorMessage =
              accountsError instanceof Error
                ? accountsError.message
                : 'Unknown error';

            accountsSpan.setAttribute('error', errorMessage);
            logger.error(`Failed to sync accounts: ${errorMessage}`);
            throw accountsError;
          }
        });

        return {
          connectionId,
          status: 'success',
          message: `Successfully synced connection ${connectionId}`,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        span.setAttribute('error', errorMessage);

        logger.error(`Connection sync failed: ${errorMessage}`);

        // Update connection status to error
        try {
          await prisma.bankConnection.update({
            data: {
              errorMessage: errorMessage,
              lastCheckedAt: new Date(),
              status: BankConnectionStatus.ERROR,
            },
            where: { id: connectionId },
          });
        } catch (updateError) {
          // Log but don't throw - we want to propagate the original error
          logger.error(
            `Failed to update connection status: ${updateError instanceof Error
              ? updateError.message
              : String(updateError)
            }`
          );
        }

        throw error;
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
    const { connectionId } = payload;

    // If it's a database connection error, wait longer
    if (
      error instanceof Error &&
      error.message.includes('database connection')
    ) {
      logger.warn(
        `Database connection error, delaying retry for ${connectionId}`
      );
      return {
        retryAt: new Date(Date.now() + 60000), // Wait 1 minute
      };
    }

    // If it's a Plaid API error, handle differently based on error type
    if (error instanceof Error && error.message.includes('PLAID_ERROR')) {
      // For rate limiting errors, wait longer
      if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
        logger.warn(`Rate limit exceeded for ${connectionId}, delaying retry`);
        return {
          retryAt: new Date(Date.now() + 300000), // Wait 5 minutes
        };
      }

      // For authentication errors, don't retry
      if (
        error.message.includes('INVALID_ACCESS_TOKEN') ||
        error.message.includes('ITEM_LOGIN_REQUIRED')
      ) {
        logger.warn(
          `Authentication error for ${connectionId}, skipping retries`
        );
        return {
          skipRetrying: true,
        };
      }
    }

    // For other errors, use the default retry strategy
    return;
  },
});
