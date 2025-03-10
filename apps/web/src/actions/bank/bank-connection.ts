import { authActionClient } from '../safe-action';
import { bankConnectionSchema } from './schema';
import { client } from '@/jobs/client';

/**
 * @example
 *   // Handle a successful Plaid Link flow
 *   const result = await handleBankConnectionAction({
 *     accessToken: 'access-sandbox-123...',
 *     institutionId: 'ins_123456',
 *     itemId: 'item_123456',
 *     publicToken: 'public-sandbox-123...',
 *     userId: 'user_123456',
 *   });
 *
 * @function handleBankConnectionAction
 * @param {Object} connectionData - The data received from the Plaid Link flow
 * @param {string} connectionData.accessToken - The Plaid access token for the
 *   connection
 * @param {string} connectionData.institutionId - The ID of the financial
 *   institution
 * @param {string} connectionData.itemId - The Plaid item ID for the connection
 * @param {string} connectionData.publicToken - The Plaid public token received
 *   from the Link flow
 * @param {string} connectionData.userId - The ID of the user who created the
 *   connection
 * @returns {Promise<{ success: boolean; message?: string; error?: string }>} A
 *   promise that resolves to an object indicating the success or failure of the
 *   connection setup
 * @throws {Error} Errors are caught and returned as part of the response object
 * @institution
 *
 * Server action to handle bank connection after a successful Plaid Link flow.
 *
 * This function is called after a user successfully connects a bank account through Plaid Link.
 * It triggers an initial setup job that processes the connection data, creates the necessary
 * database records, and initiates the first synchronization of account and transaction data.
 */
export const handleBankConnectionAction = authActionClient
  .schema(bankConnectionSchema)
  .action(
    async ({
      ctx: { user },
      parsedInput: { accessToken, institutionId, itemId, publicToken, userId },
    }) => {
      try {
        // Trigger the initial setup job
        await client.sendEvent({
          name: 'initial-setup',
          payload: {
            accessToken,
            institutionId,
            itemId,
            publicToken,
            userId,
          },
        });

        return {
          success: true,
          message: 'Bank connection setup initiated',
        };
      } catch (error) {
        console.error('Error setting up bank connection:', error);
        return {
          success: false,
          error: error.message || 'Failed to set up bank connection',
        };
      }
    }
  );
