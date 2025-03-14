import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { BankConnectionStatus } from '@prisma/client';
import { client } from '../../../client';
import { getItemDetails } from '@/server/services/plaid';
import { prisma } from '@/server/db';
import { z } from 'zod';

/**
 * This job manages the synchronization of an entire bank connection and all its
 * associated accounts. It acts as a fan-out orchestrator that:
 *
 * 1. Verifies the connection status with the provider (e.g., Plaid)
 * 2. Updates the connection status in our database
 * 3. Triggers individual account syncs for all accounts under this connection
 * 4. Optionally triggers transaction notifications for manual syncs
 *
 * The job implements intelligent handling of connection errors, including
 * detecting when a user needs to re-authenticate (LOGIN_REQUIRED) versus other
 * types of errors. It also implements staggered scheduling to prevent rate
 * limiting issues.
 *
 * @file Bank Connection Synchronization Job
 * @example
 *   // Trigger a connection sync
 *   await client.sendEvent({
 *     name: 'sync-connection',
 *     payload: {
 *       connectionId: 'conn_123abc',
 *       manualSync: true, // Optional, defaults to false
 *     },
 *   });
 *
 * @example
 *   // The job returns different results based on the outcome:
 *
 *   // Successful sync:
 *   {
 *   status: "success",
 *   connectionId: "conn_123abc",
 *   accountsSynced: 5
 *   }
 *
 *   // Connection error:
 *   {
 *   status: "error",
 *   error: "ITEM_LOGIN_REQUIRED"
 *   }
 */
export const syncConnectionJob = schemaTask({
  id: BANK_JOBS.SYNC_CONNECTION,
  description: 'Sync Bank Connection',
  schema: z.object({
    connectionId: z.string(),
    manualSync: z.boolean().optional(),
  }),
  /**
   * Main job execution function that syncs a bank connection and all its
   * accounts
   *
   * @param payload - The job payload containing connection details
   * @param payload.connectionId - The ID of the bank connection to sync
   * @param payload.manualSync - Whether this is a manual sync initiated by the
   *   user (defaults to false)
   * @param io - The I/O context provided by Trigger.dev for logging, running
   *   tasks, etc.
   * @returns A result object containing the connection ID, number of accounts
   *   synced, and status
   * @throws Error if the connection sync fails or if the connection cannot be
   *   found
   */
  run: async (payload, io) => {
    const { connectionId, manualSync = false } = payload;

    await logger.info(`Starting connection sync for ${connectionId}`);

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
        await logger.error(`Connection ${connectionId} not found`);

        throw new Error(`Connection ${connectionId} not found`);
      }

      // Check connection status with Plaid
      const connectionDetails = await getItemDetails(connection.accessToken);

      // Update connection status based on response
      if (connectionDetails.status?.error) {
        await logger.warn(
          `Connection error: ${connectionDetails.status.error}`
        );

        // Determine the appropriate status based on the error
        if (connectionDetails.status.error.includes('ITEM_LOGIN_REQUIRED')) {
          // Login required error
          await prisma.bankConnection.update({
            data: {
              errorMessage: connectionDetails.status.error,
              lastCheckedAt: new Date(),
              status: BankConnectionStatus.LOGIN_REQUIRED,
            },
            where: { id: connectionId },
          });
        } else {
          // General error
          await prisma.bankConnection.update({
            data: {
              errorMessage: connectionDetails.status.error,
              lastCheckedAt: new Date(),
              status: BankConnectionStatus.ERROR,
            },
            where: { id: connectionId },
          });
        }

        return {
          error: connectionDetails.status.error,
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

      if (accounts.length === 0) {
        await logger.info(
          `No active accounts found for connection ${connectionId}`
        );

        return {
          accountsSynced: 0,
          status: 'success',
        };
      }

      await logger.info(`Found ${accounts.length} accounts to sync`);

      // Trigger account syncs with appropriate delays
      let accountsSynced = 0;

      for (const account of accounts) {
        await client.sendEvent({
          // Use context for delay information
          context: {
            delaySeconds: manualSync ? accountsSynced * 2 : accountsSynced * 30,
          },
          name: 'sync-account-trigger',
          payload: {
            accessToken: connection.accessToken,
            bankAccountId: account.id,
            manualSync,
            userId: connection.userId,
          },
        });
        accountsSynced++;
      }

      // For manual syncs, we'll also trigger transaction notifications
      if (manualSync) {
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
      }

      await logger.info(
        `Connection sync completed, triggered ${accountsSynced} account syncs`
      );

      return {
        accountsSynced,
        connectionId,
        status: 'success',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await logger.error(`Connection sync failed: ${errorMessage}`);

      // Update connection status to error
      await prisma.bankConnection.update({
        data: {
          errorMessage: errorMessage,
          lastCheckedAt: new Date(),
          status: BankConnectionStatus.ERROR,
        },
        where: { id: connectionId },
      });

      throw error;
    }
  },
});
