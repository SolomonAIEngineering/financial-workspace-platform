'use server';

import { authActionClient } from '../safe-action';
import { syncAccount } from '@/jobs/tasks/bank/sync/account';
import { syncTransactionsSchema } from './schema';

/**
 * Triggers a background job to sync transactions for a bank connection
 *
 * This server action triggers the Trigger.dev job to sync transactions after a
 * user has connected their account via Plaid. It returns a runId that can be
 * used to track the progress of the sync.
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
 * @returns {Promise<object>} The response containing runId for real-time
 *   tracking
 */
export const syncTransactionsAction = authActionClient
  .schema(syncTransactionsSchema)
  .action(
    async ({
      ctx: { user },
      parsedInput: { accessToken, itemId, institutionId, userId },
    }) => {
      try {
        const result = await syncAccount.trigger({
          id: userId,
          teamId: user.id,
          accountId: itemId,
          provider: 'plaid',
          accessToken,
          manualSync: true,
        });

        // Create a public token for this run (this would need to be implemented in your backend)
        // For now, we'll just return the run ID which can be used with your own authentication

        return result;
      } catch (error) {
        console.error('Error triggering transaction sync:', error);
        throw error;
      }
    }
  );
