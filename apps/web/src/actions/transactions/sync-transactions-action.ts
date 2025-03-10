'use server';

import { BANK_JOBS } from '@/jobs/tasks/constants';
import { authActionClient } from '../safe-action';
import { client } from '@/jobs/client';
import { syncTransactionsSchema } from './schema';

/**
 * Triggers a background job to sync transactions for a bank connection
 *
 * This server action triggers the Trigger.dev job to sync transactions after a
 * user has connected their account via Plaid.
 *
 * @example
 *   // Trigger transaction sync for a bank connection
 *   const result = await syncTransactionsAction({
 *     accessToken: 'access-sandbox-123...',
 *     itemId: 'item-id-123',
 *     institutionId: 'ins_123',
 *     userId: 'user-123',
 *   });
 *
 * @returns {Promise<object>} The response indicating success or failure
 */
export const syncTransactionsAction = authActionClient
  .schema(syncTransactionsSchema)
  .action(
    async ({
      ctx: { user },
      parsedInput: { accessToken, itemId, institutionId, userId },
    }) => {
      try {
        // Import the client dynamically to avoid server/client conflicts

        // Use the constant for the event name instead of a string literal
        await client.sendEvent({
          name: BANK_JOBS.SYNC_ACCOUNT,
          payload: {
            userId,
            // Pass additional data that might be needed by the job
            connectionData: {
              accessToken,
              itemId,
              institutionId,
            },
          },
        });

        return {
          success: true,
          message: 'Transaction sync process started',
        };
      } catch (error) {
        console.error('Error triggering transaction sync:', error);
        throw error;
      }
    }
  );
