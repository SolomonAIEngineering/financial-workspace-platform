'use server';

import { authActionClient } from '../safe-action';
import { createPlaidLinkTokenSchema } from './schema';
import { engine } from '@/lib/engine';

/**
 * @example
 *   // Basic usage (for new connections)
 *   const linkToken = await createPlaidLinkTokenAction({});
 *
 *   // For updating an existing connection
 *   const linkToken = await createPlaidLinkTokenAction({
 *     accessToken: 'access-sandbox-123...',
 *   });
 *
 * @function createPlaidLinkTokenAction
 * @param {Object} options - The options for creating the Plaid link token
 * @param {Object} options.ctx - The context object containing authenticated
 *   user information
 * @param {Object} options.ctx.user - The authenticated user object
 * @param {string} options.ctx.user.id - The unique identifier of the
 *   authenticated user
 * @param {Object} options.parsedInput - The validated input parameters
 * @param {string | undefined} options.parsedInput.accessToken - Optional Plaid
 *   access token for updating an existing connection
 * @returns {Promise<string>} A Plaid link token string that can be used to
 *   initialize Plaid Link on the client
 * @throws {Error} If the API call to create the link token fails or if there's
 *   an issue with the user authentication
 * @institution
 *
 * Creates a Plaid link token for connecting a financial institution to the user's account.
 *
 * This server action generates a Plaid link token that allows the client to initialize
 * the Plaid Link flow for connecting financial institutions. The token is generated using
 * the user's ID from the authentication context and an optional access token for updating
 * existing connections.
 *
 * The link token is a short-lived token that is used to initialize Plaid Link on the client side.
 * It contains configuration information such as the products to use, the language to display,
 * and the user's information.
 */
export const createPlaidLinkTokenAction = authActionClient
  .schema(createPlaidLinkTokenSchema)
  .action(async ({ ctx: { user }, parsedInput: { accessToken } }) => {
    try {
      console.info('createPlaidLinkTokenAction called with:', {
        userId: user.id,
        accessToken: accessToken ? 'present' : 'not present',
      });

      // Log the API endpoint we're calling from the engine
      console.info('Calling engine.auth.plaid.link with params:', {
        userId: user.id,
        accessToken: accessToken ? 'present' : 'not present',
      });

      // Check environment variables are configured
      console.info('Environment variables check:', {
        engineApiEndpoint: process.env.ENGINE_API_ENDPOINT || 'not set',
        engineApiKeyPresent: process.env.MIDDAY_ENGINE_API_KEY
          ? 'present'
          : 'not set',
        plaidEnvPresent: process.env.PLAID_ENV ? 'present' : 'not set',
        plaidClientIdPresent: process.env.PLAID_CLIENT_ID
          ? 'present'
          : 'not set',
        plaidSecretPresent: process.env.PLAID_SECRET ? 'present' : 'not set',
      });

      /**
       * Step 1: Create or update customer in Plain CRM This creates a
       * customer profile or updates an existing one based on user email
       */

      /**
       * Creates a Plaid link token for the authenticated user
       *
       * This server action generates a Plaid link token that allows the
       * client to initialize the Plaid Link flow for connecting financial
       * institutions. The token is generated using the user's ID from the
       * authentication context and an optional access token.
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
       * @param {object} params.ctx.user - The authenticated user object
       * @param {string} params.ctx.user.id - The unique identifier of the
       *   authenticated user
       * @param {object} params.parsedInput - The validated input
       *   parameters
       * @param {string | null} params.parsedInput.accessToken - Optional
       *   Plaid access token for updating an existing connection
       * @returns {Promise<string>} A Plaid link token string that can be
       *   used to initialize Plaid Link on the client
       * @throws {Error} If the API call to create the link token fails
       */
      const { data } = await engine.apiPlaid.createLink({
        userId: user.id,
        accessToken: accessToken ?? undefined,
      });

      console.info('Successfully created Plaid link token');
      return data.link_token;
    } catch (error) {
      /**
       * Step 5: Error handling Let next-safe-action handle the error
       * formatting Client will receive { error: { message, ... } }
       */
      console.error('Unexpected error in createPlaidLinkTokenAction:', error);

      // Add detailed error logging
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        status: (error as any)?.status || 'unknown',
        headers: (error as any)?.headers || 'unknown',
        error: (error as any)?.error || 'unknown',
        stack: error instanceof Error ? error.stack : 'no stack trace',
      });

      throw error;
    }
  });
