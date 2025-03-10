'use server';

import { authActionClient } from '../safe-action';
import { engine } from '@/lib/engine';
import { exchangePublicTokenSchema } from './schema';

/**
 * Exchanges a Plaid public token for an access token
 *
 * This server action exchanges a Plaid public token (obtained from the Plaid
 * Link onSuccess callback) for an access token that can be used to make API
 * calls to retrieve account data.
 *
 * @example
 *   // Exchange a public token for an access token
 *   const result = await exchangePublicTokenAction({
 *     publicToken: 'public-sandbox-123...',
 *   });
 *
 * @param {object} params - The parameters for exchanging the public token
 * @param {object} params.ctx - The context object containing authenticated user
 *   information
 * @param {object} params.ctx.user - The authenticated user object
 * @param {string} params.ctx.user.id - The unique identifier of the
 *   authenticated user
 * @param {object} params.parsedInput - The validated input parameters
 * @param {string} params.parsedInput.publicToken - The public token received
 *   from Plaid Link's onSuccess callback
 * @returns {Promise<object>} The response data containing the access token and
 *   other relevant information
 * @throws {Error} If the API call to exchange the public token fails
 */
export const exchangePublicTokenAction = authActionClient
  .schema(exchangePublicTokenSchema)
  .action(async ({ ctx: { user }, parsedInput: { publicToken } }) => {
    try {
      /** Call the engine API to exchange the public token for an access token */
      const { data } = await engine.apiPlaid.exchangeToken({
        token: publicToken,
      });

      return data;
    } catch (error) {
      /**
       * Error handling - Let next-safe-action handle the error formatting
       * Client will receive { error: { message, ... } }
       */
      console.error('Error exchanging public token:', error);
      throw error;
    }
  });
