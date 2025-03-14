import { authActionClient } from '../safe-action';
import { client } from '@/jobs/client';
import { manualSyncBankAccountSchema } from './schema';
import { prisma } from '@/server/db';
import { revalidatePath } from 'next/cache';

/**
 * @example
 *   // Trigger a manual sync for a specific connection
 *   const result = await manualSyncTransactionsAction('conn_123456');
 *
 *   if (result.success) {
 *     console.info(result.message); // "Sync started for X accounts"
 *   } else {
 *     console.error(result.error); // Error message if sync failed
 *   }
 *
 * @function manualSyncTransactionsAction
 * @param {string} connectionId - The unique identifier of the bank connection
 *   to sync
 * @returns {Promise<{ success: boolean; message?: string; error?: string }>} A
 *   promise that resolves to an object indicating the success or failure of the
 *   sync operation
 * @throws {Error} Errors are caught and returned as part of the response object
 * @institution
 *
 * Server action to manually trigger a synchronization of transactions for a bank connection.
 *
 * This function allows users to force a synchronization from the UI when they want to update
 * their transaction data without waiting for the scheduled automatic sync. It retrieves all
 * accounts associated with the specified connection and triggers a sync job for each account
 * with a delay between them to avoid overwhelming the system.
 */
export const manualSyncBankAccountAction = authActionClient
  .schema(manualSyncBankAccountSchema)
  .action(async ({ ctx: { user }, parsedInput: { connectionId } }) => {
    try {
      // Get the connection details tied to the respective connection id
      const connection = await prisma.bankConnection.findUnique({
        select: {
          accessToken: true,
          id: true,
          userId: true,
        },
        where: { id: connectionId },
      });

      if (!connection) {
        return {
          success: false,
          error: 'Connection not found',
        };
      }

      // Get all accounts for this connection
      const accounts = await prisma.bankAccount.findMany({
        select: {
          id: true,
        },
        where: {
          bankConnectionId: connectionId,
        },
      });

      // Trigger sync for each account with increasing delays
      let delayCounter = 0;

      for (const account of accounts) {
        await client.sendEvent({
          context: {
            delaySeconds: delayCounter * 5, // 5 second delay between accounts
          },
          name: 'sync-account',
          payload: {
            accessToken: connection.accessToken,
            bankAccountId: account.id,
            manualSync: true, // Flag as manual sync
            userId: connection.userId,
          },
        });
        delayCounter++;
      }

      // Revalidate the accounts page to show updated status
      revalidatePath('/accounts');

      return {
        success: true,
        message: `Sync started for ${accounts.length} accounts`,
      };
    } catch (error) {
      console.error('Error syncing transactions:', error);
      return {
        success: false,
        error: error.message || 'Failed to sync transactions',
      };
    }
  });
