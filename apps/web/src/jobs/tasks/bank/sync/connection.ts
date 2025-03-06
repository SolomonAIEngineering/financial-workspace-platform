import { BankConnectionStatus } from '@prisma/client';
import { eventTrigger } from '@trigger.dev/sdk';

import { prisma } from '@/server/db';
import { getItemDetails } from '@/server/services/plaid';

import { client } from '../../../client';

/**
 * This job handles syncing a bank connection and all its accounts It's a
 * fan-out job that triggers sync-account for each account
 */
export const syncConnectionJob = client.defineJob({
  id: 'sync-connection-job',
  name: 'Sync Bank Connection',
  trigger: eventTrigger({
    name: 'sync-connection',
  }),
  version: '1.0.0',
  run: async (payload, io) => {
    const { connectionId, manualSync = false } = payload;

    await io.logger.info(`Starting connection sync for ${connectionId}`);

    try {
      // Fetch the connection details
      const connection = await io.runTask('get-connection', async () => {
        return await prisma.bankConnection.findUnique({
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
      });

      if (!connection) {
        await io.logger.error(`Connection ${connectionId} not found`);

        throw new Error(`Connection ${connectionId} not found`);
      }

      // Check connection status with Plaid
      const connectionDetails = await io.runTask(
        'check-connection-status',
        async () => {
          return await getItemDetails(connection.accessToken);
        }
      );

      // Update connection status based on response
      if (connectionDetails.status?.error) {
        await io.logger.warn(
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
      const accounts = await io.runTask('get-accounts', async () => {
        return await prisma.bankAccount.findMany({
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
      });

      if (accounts.length === 0) {
        await io.logger.info(
          `No active accounts found for connection ${connectionId}`
        );

        return {
          accountsSynced: 0,
          status: 'success',
        };
      }

      await io.logger.info(`Found ${accounts.length} accounts to sync`);

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

      await io.logger.info(
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
      await io.logger.error(`Connection sync failed: ${errorMessage}`);

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
