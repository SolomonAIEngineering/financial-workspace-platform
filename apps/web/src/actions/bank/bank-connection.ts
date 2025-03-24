'use server';

import { authActionClient } from '../safe-action';
import { bankConnectionSchema } from './schema';
import { initialSetupJob } from '@/jobs';
import { prisma } from '@solomonai/prisma';
import { revalidateTag } from 'next/cache';
import { trpc } from '@/trpc/server';

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
      parsedInput: {
        accessToken,
        institutionId,
        itemId,
        userId,
        teamId,
        provider,
        accounts,
      },
    }) => {
      try {
        // get the team from the team id
        const team = await prisma.team.findUnique({
          where: {
            id: teamId,
          },
        });

        if (!team) {
          throw new Error('Team not found');
        }

        // create the bank connection
        const bankConnection = await trpc.bankConnection.createBankConnection({
          institutionId,
          accessToken,
          itemId,
          userId,
          teamId,
          provider,
          accounts,
        });

        // Trigger the initial setup job
        const event = await initialSetupJob.trigger({
          teamId,
          connectionId: bankConnection?.connectionId,
        });

        // revalidate the bank connection
        revalidateTag(`bank_accounts_${teamId}`);
        revalidateTag(`bank_accounts_currencies_${teamId}`);
        revalidateTag(`bank_connections_${teamId}`);

        return event;
      } catch (error) {
        console.error('Error setting up bank connection:', error);
        return null;
      }
    }
  );
