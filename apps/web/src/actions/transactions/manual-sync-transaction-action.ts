'use server';

import { authActionClient } from '@/actions/safe-action';
import { manualSyncTransactionsSchema } from './schema';
import { prisma } from '@/server/db';
import { syncConnectionJob } from '@/jobs/tasks/bank/sync/connection';

/**
 * Triggers a background job to sync transactions for a bank connection
 *
 * This server action triggers the Trigger.dev job to sync transactions after a
 * user has connected their account via Plaid. It returns a runId that can be
 * used to track the progress of the sync.
 *
 * @example
 *   // Trigger transaction sync for a bank connection
 *   const result = await manualSyncTransactionsAction({
 *     connectionId: '123',
 *   });
 *
 * @returns {Promise<object>} The response containing runId for real-time
 *   tracking
 */
export const manualSyncTransactionsAction = authActionClient
  .schema(manualSyncTransactionsSchema)
  .action(async ({ parsedInput: { connectionId } }) => {
    // make sure the connection exists
    const connection = await prisma.bankConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new Error('Connection not found');
    }

    // Create a job to sync the connection
    const result = await syncConnectionJob.trigger({
      connectionId,
      manualSync: true,
    });

    return result;
  });
