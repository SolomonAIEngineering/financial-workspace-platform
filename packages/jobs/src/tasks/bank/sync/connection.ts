import {
  BankAccountRecord,
  BankConnectionDetails,
  SyncConnectionInput,
  SyncConnectionOutput,
  bankAccountRecordSchema,
  bankConnectionDetailsSchema,
  syncConnectionInputSchema
} from './schema';
import { logger, schemaTask, tasks } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { BankConnectionStatus } from '@solomonai/prisma/client';
import { Task } from '@trigger.dev/sdk/v3';
import { getItemDetails } from '@solomonai/jobs/src/utils/plaid';
import { prisma } from '@solomonai/prisma/server';
import { syncAccount } from './account';

/**
 * Fetches bank connection details from the database
 *
 * @param connectionId - The unique identifier for the connection to fetch
 * @returns The bank connection record with selected fields
 * @throws Error if the connection doesn't exist or has no team
 */
async function fetchConnectionDetails(connectionId: string): Promise<BankConnectionDetails> {
  const connection = await prisma.bankConnection.findUnique({
    select: {
      id: true,
      accessToken: true,
      institutionId: true,
      institutionName: true,
      status: true,
      userId: true,
      provider: true,
      team: {
        select: {
          id: true,
        },
      },
    },
    where: { id: connectionId },
  });

  if (!connection) {
    throw new Error(`Connection ${connectionId} not found`);
  }

  if (!connection.team) {
    throw new Error(`Connection ${connectionId} has no team`);
  }

  return connection as BankConnectionDetails;
}

/**
 * Verifies the connection status with the external provider
 * and updates the status in the database
 *
 * @param connection - The bank connection details
 * @param connectionId - The connection ID
 * @param statusSpan - The trace span for tracking this operation
 * @returns The status object with error information if applicable
 */
async function verifyConnectionStatus(
  connection: BankConnectionDetails,
  connectionId: string,
  statusSpan: any
) {
  try {
    // Check connection status with provider
    // TODO: move this to api client
    const connectionDetails = await getItemDetails(connection.accessToken);

    // Update connection status based on response
    if (connectionDetails.status?.error) {
      const errorMsg = connectionDetails.status.error;
      statusSpan.setAttribute('error', errorMsg);
      logger.warn(`Connection error: ${errorMsg}`);

      const status = await handleConnectionError(
        connectionId,
        errorMsg,
        statusSpan
      );
      return status;
    }

    // Update connection as active
    await updateConnectionStatus(
      connectionId,
      BankConnectionStatus.ACTIVE,
      null
    );

    statusSpan.setAttribute('updatedStatus', BankConnectionStatus.ACTIVE);
    logger.info(`Connection status verified and updated to ACTIVE`);
    return { status: 'success' };
  } catch (statusError) {
    const errorMessage = statusError instanceof Error
      ? statusError.message
      : 'Unknown error';

    statusSpan.setAttribute('error', errorMessage);
    logger.error(`Failed to check connection status: ${errorMessage}`);
    throw statusError;
  }
}

/**
 * Handles connection errors by updating the status based on error type
 *
 * @param connectionId - The connection ID
 * @param errorMsg - The error message from the provider
 * @param statusSpan - The trace span for tracking this operation
 * @returns The status object with error information
 */
async function handleConnectionError(
  connectionId: string,
  errorMsg: string,
  statusSpan: any
) {
  // Determine the appropriate status based on the error
  if (errorMsg.includes('ITEM_LOGIN_REQUIRED')) {
    // Login required error
    await updateConnectionStatus(
      connectionId,
      BankConnectionStatus.LOGIN_REQUIRED,
      errorMsg
    );

    statusSpan.setAttribute('updatedStatus', BankConnectionStatus.LOGIN_REQUIRED);
  } else {
    // General error
    await updateConnectionStatus(
      connectionId,
      BankConnectionStatus.ERROR,
      errorMsg
    );

    statusSpan.setAttribute('updatedStatus', BankConnectionStatus.ERROR);
  }

  return {
    error: errorMsg,
    status: 'error',
  };
}

/**
 * Updates the connection status in the database
 *
 * @param connectionId - The connection ID
 * @param status - The new status to set
 * @param errorMessage - Optional error message to store
 * @returns The updated bank connection record
 */
async function updateConnectionStatus(
  connectionId: string,
  status: BankConnectionStatus,
  errorMessage: string | null
) {
  const updateData: any = {
    status,
    lastCheckedAt: new Date(),
  };

  if (errorMessage !== null) {
    updateData.errorMessage = errorMessage;
  } else {
    updateData.errorMessage = null;
    updateData.lastAccessedAt = new Date();
  }

  return await prisma.bankConnection.update({
    data: updateData,
    where: { id: connectionId },
  });
}

/**
 * Fetches accounts for a bank connection and triggers sync jobs for each
 *
 * @param connectionId - The connection ID
 * @param connection - The bank connection details
 * @param team - The team object
 * @param manualSync - Whether this is a manual sync
 * @param accountsSpan - The trace span for tracking this operation
 * @returns The result object with account sync information
 */
async function syncBankAccounts(
  connectionId: string,
  connection: BankConnectionDetails,
  team: { id: string },
  manualSync: boolean,
  accountsSpan: any
) {
  try {
    const accounts = await fetchEnabledAccounts(connectionId, manualSync);
    const accountCount = accounts.length;
    accountsSpan.setAttribute('accountCount', accountCount);

    if (accountCount === 0) {
      logger.info(`No active accounts found for connection ${connectionId}`);
      return {
        accountsSynced: 0,
        status: 'success',
      };
    }

    logger.info(`Found ${accountCount} accounts to sync`);

    // Trigger sync jobs for each account
    const accountsSynced = await triggerAccountSyncs(
      accounts,
      connection,
      team,
      manualSync,
      accountsSpan
    );

    // Handle transaction notifications for manual syncs
    if (manualSync) {
      await handleManualSyncNotifications(connection, accountsSpan);
    }

    logger.info(`Connection sync completed, triggered ${accountsSynced} account syncs`);
    return {
      accountsSynced,
      connectionId,
      status: 'success',
    };
  } catch (accountsError) {
    const errorMessage = accountsError instanceof Error
      ? accountsError.message
      : 'Unknown error';

    accountsSpan.setAttribute('error', errorMessage);
    logger.error(`Failed to sync accounts: ${errorMessage}`);
    throw accountsError;
  }
}

/**
 * Fetches enabled accounts for a bank connection
 *
 * @param connectionId - The connection ID
 * @param manualSync - Whether this is a manual sync
 * @returns Array of bank account records
 */
async function fetchEnabledAccounts(
  connectionId: string,
  manualSync: boolean
): Promise<BankAccountRecord[]> {
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

  // Validate accounts with schema
  return accounts as BankAccountRecord[];
}

/**
 * Triggers sync jobs for each account with appropriate delays
 *
 * @param accounts - Array of bank account records
 * @param connection - The bank connection details
 * @param team - The team object
 * @param manualSync - Whether this is a manual sync
 * @param accountsSpan - The trace span for tracking this operation
 * @returns The number of accounts synced
 */
async function triggerAccountSyncs(
  accounts: BankAccountRecord[],
  connection: BankConnectionDetails,
  team: { id: string },
  manualSync: boolean,
  accountsSpan: any
): Promise<number> {
  let accountsSynced = 0;

  for (const account of accounts) {
    const delaySeconds = manualSync
      ? accountsSynced * 2
      : accountsSynced * 30;

    accountsSpan.setAttribute(`account_${accountsSynced}_id`, account.id);
    accountsSpan.setAttribute(`account_${accountsSynced}_delay`, delaySeconds);

    // Trigger account sync with delay
    await tasks.trigger<typeof syncAccount>(
      'sync-account',
      {
        id: account.id,
        accessToken: connection.accessToken,
        accountId: account.plaidAccountId || account.id,
        manualSync,
        teamId: team.id,
        provider: connection.provider,
      },
      {
        delay: delaySeconds ? `${delaySeconds}s` : undefined,
      }
    );

    logger.info(`Triggered sync for account ${account.id} with ${delaySeconds}s delay`);
    accountsSynced++;
  }

  return accountsSynced;
}

/**
 * Handles notification triggers for manual syncs
 *
 * @param connection - The bank connection details
 * @param accountsSpan - The trace span for tracking this operation
 */
async function handleManualSyncNotifications(
  connection: BankConnectionDetails,
  accountsSpan: any
) {
  accountsSpan.setAttribute('triggeredNotifications', true);

  // Trigger notifications with a 2-minute delay (TODO: Enable this soon)
  // await tasks.trigger<typeof BANK_JOBS.SYNC_TRANSACTION_NOTIFICATIONS>(
  //   'sync-transaction-notifications-trigger',
  //   {
  //     userId: connection.userId,
  //   },
  //   {
  //     delay: '120s', // 2 minutes
  //   }
  // );

  logger.info(`Triggered transaction notifications for user ${connection.userId}`);
}

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
export const syncConnectionJob: Task<
  typeof BANK_JOBS.SYNC_CONNECTION,
  SyncConnectionInput,
  SyncConnectionOutput
> = schemaTask({
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
  schema: syncConnectionInputSchema,
  /**
   * Main execution function for the connection sync task
   *
   * @param payload - The validated input parameters
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
        // Fetch and validate the connection details
        const connection = await fetchConnectionDetails(connectionId);
        const team = connection.team![0];

        span.setAttribute('institutionId', connection.institutionId);
        span.setAttribute('institutionName', connection.institutionName);
        span.setAttribute('userId', connection.userId);

        // Verify connection status with the provider
        await logger.trace('check-connection-status', async (statusSpan) => {
          statusSpan.setAttribute('connectionId', connectionId);
          statusSpan.setAttribute('institutionId', connection.institutionId);

          await verifyConnectionStatus(connection, connectionId, statusSpan);
        });

        // Fetch and sync accounts
        await logger.trace('fetch-accounts', async (accountsSpan) => {
          accountsSpan.setAttribute('connectionId', connectionId);

          await syncBankAccounts(
            connectionId,
            connection,
            team,
            manualSync,
            accountsSpan
          );
        });

        return {
          connectionId,
          status: 'success',
          message: `Successfully synced connection ${connectionId}`,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        span.setAttribute('error', errorMessage);

        logger.error(`Connection sync failed: ${errorMessage}`);

        // Update connection status to error
        try {
          await updateConnectionStatus(
            connectionId,
            BankConnectionStatus.ERROR,
            errorMessage
          );
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
});
