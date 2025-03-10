'use server';

import { authActionClient } from '../safe-action';
import { createPlaidLinkTokenSchema } from './schema';
import { engine } from '@/lib/engine';

export const createPlaidLinkTokenAction = authActionClient
  .schema(createPlaidLinkTokenSchema)
  .action(async ({ ctx: { user }, parsedInput: { accessToken } }) => {
    try {
      /**
       * Step 1: Create or update customer in Plain CRM This creates a
       * customer profile or updates an existing one based on user
       * email
       */

      /**
       * Creates a Plaid link token for the authenticated user
       *
       * This server action generates a Plaid link token that allows
       * the client to initialize the Plaid Link flow for connecting
       * financial institutions. The token is generated using the
       * user's ID from the authentication context and an optional
       * access token.
       *
       * @example
       *   // Basic usage (for new connections)
       *   const linkToken = await createPlaidLinkTokenAction({});
       *
       *   // For updating an existing connection
       *   const linkToken = await createPlaidLinkTokenAction({
       *     accessToken: 'access-sandbox-123...',
       *   });
       *
       * @param {object} params - The parameters for creating the link
       *   token
       * @param {object} params.ctx - The context object containing
       *   authenticated user information
       * @param {object} params.ctx.user - The authenticated user
       *   object
       * @param {string} params.ctx.user.id - The unique identifier of
       *   the authenticated user
       * @param {object} params.parsedInput - The validated input
       *   parameters
       * @param {string | null} params.parsedInput.accessToken -
       *   Optional Plaid access token for updating an existing
       *   connection
       * @returns {Promise<string>} A Plaid link token string that can
       *   be used to initialize Plaid Link on the client
       * @throws {Error} If the API call to create the link token
       *   fails
       */
      const { data } = await engine.auth.plaid.link({
        userId: user.id,
        accessToken: accessToken ?? undefined,
      });

      return data.link_token;
    } catch (error) {
      /**
       * Step 5: Error handling Let next-safe-action handle the error
       * formatting Client will receive { error: { message, ... } }
       */
      console.error('Unexpected error in feedback submission:', error);

      throw error;
    }
  });
