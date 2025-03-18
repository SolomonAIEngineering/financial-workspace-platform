import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { engine } from '@/lib/engine';
import { z } from 'zod';

/**
 * Defines a task to delete a bank connection from a financial provider. This
 * task handles the process of removing a connection from the system and
 * revoking access with the provider.
 *
 * @remarks
 *   The task implements error handling and retry mechanisms to ensure reliable
 *   execution. It validates inputs using Zod schema validation before
 *   attempting deletion.
 * @example
 *   ```ts
 *   await client.sendEvent({
 *     name: 'delete-bank-connection',
 *     payload: {
 *       referenceId: 'connection-123',
 *       provider: 'plaid',
 *       accessToken: 'access-token-from-provider'
 *     },
 *   });
 *   ```;
 *
 * @returns A result object containing the success status and a message
 */
export const deleteConnection = schemaTask({
  id: 'delete-connection',
  schema: z.object({
    /** The unique identifier for the bank connection to be deleted */
    referenceId: z.string().min(1, 'Reference ID is required'),

    /** The financial provider that manages this connection */
    provider: z
      .string()
      .min(1, 'Provider is required')
      .refine(
        (val) => ['teller', 'plaid', 'gocardless', 'stripe'].includes(val),
        {
          message: 'Provider must be one of: teller, plaid, gocardless, stripe',
        }
      ),

    /** The access token used to authenticate with the provider */
    accessToken: z.string().min(1, 'Access token is required'),
  }),
  maxDuration: 60,
  queue: {
    concurrencyLimit: 5,
  },
  /**
   * Configure retry behavior for the task
   *
   * @see https://trigger.dev/docs/errors-retrying
   */
  retry: {
    maxAttempts: 10,
    factor: 1.8,
    minTimeoutInMs: 500,
    maxTimeoutInMs: 30_000,
    randomize: false,
  },
  /**
   * Main execution function for the delete connection task
   *
   * @param payload - The validated input parameters
   * @param payload.referenceId - The unique identifier for the connection
   * @param payload.provider - The financial provider (teller, plaid,
   *   gocardless, stripe)
   * @param payload.accessToken - The access token for authenticating with the
   *   provider
   * @param ctx - The execution context provided by Trigger.dev
   * @returns A result object with success status and message
   * @throws Error if the deletion process fails
   */
  run: async (payload, ctx) => {
    const { referenceId, provider, accessToken } = payload;

    try {
      // Create a trace for this operation
      return await logger.trace('delete-bank-connection', async (span) => {
        // Add attributes to the trace for better observability
        span.setAttribute('provider', provider);
        span.setAttribute('referenceId', referenceId);

        logger.info('Attempting to delete bank connection', {
          referenceId,
          provider,
        });

        await engine.apiFinancialAccounts.delete(referenceId, {
          accountId: referenceId,
          provider: provider as 'teller' | 'plaid' | 'gocardless' | 'stripe',
          accessToken,
        });

        logger.info('Successfully deleted bank connection', {
          referenceId,
          provider,
        });

        return {
          success: true,
          message: `Successfully deleted ${provider} connection for ${referenceId}`,
        };
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      logger.error('Failed to delete bank connection', {
        referenceId,
        provider,
        error: errorMessage,
      });

      // Propagate error but with context
      throw new Error(
        `Failed to delete ${provider} connection: ${errorMessage}`
      );
    }
  },
  /**
   * Custom error handler to control retry behavior based on error type
   *
   * @param payload - The task payload
   * @param error - The error that occurred
   * @param options - Options object containing context and retry control
   * @returns Retry instructions or undefined to use default retry behavior
   */
  handleError: async (payload, error, { ctx, retryAt }) => {
    // If it's an authentication error, don't retry
    if (
      error instanceof Error &&
      (error.message.includes('authentication') ||
        error.message.includes('unauthorized'))
    ) {
      return {
        skipRetrying: true,
      };
    }

    // Let other errors use the default retry strategy
    return undefined;
  },
});
