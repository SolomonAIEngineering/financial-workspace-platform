'use server';

import { authActionClient } from '../safe-action';
import { client } from '@/jobs/client';
import { manualSyncBankAccountSchema } from './schema';
import { prisma } from '@/server/db';
import { revalidatePath } from 'next/cache';
import { syncConnectionJob } from '@/jobs';

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
      const event = await syncConnectionJob.trigger({
        connectionId,
        manualSync: true,
      });

      // Revalidate the accounts page to show updated status
      revalidatePath('/accounts');

      return event;
    } catch (error) {
      console.error('Error syncing transactions:', error);
      return null;
    }
  });
