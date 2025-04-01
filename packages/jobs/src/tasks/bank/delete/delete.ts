import { Task, logger, schemaTask } from '@trigger.dev/sdk/v3';

import { engine } from '@solomonai/lib/clients';
import { prisma } from '@solomonai/prisma';
import { z } from 'zod';

/**
 * Schema defining the required input for deleting a bank connection
 * Validates that all required fields are present and properly formatted
 */
const deleteConnectionInputSchema = z.object({
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
})

/**
 * Input type derived from the Zod schema
 * Represents the validated input parameters for the delete connection task
 */
type DeleteConnectionInput = z.infer<typeof deleteConnectionInputSchema>;

/**
 * Schema defining the output structure returned by the delete connection task
 */
const deleteConnectionOutputSchema = z.object({
  /** Indicates whether the deletion operation was successful */
  success: z.boolean(),

  /** Message describing the result of the operation */
  message: z.string(),
});

/**
 * Output type derived from the Zod schema
 * Represents the structure of the response from the delete connection task
 */
type DeleteConnectionOutput = z.infer<typeof deleteConnectionOutputSchema>;

/**
 * Defines a task to delete a bank connection from a financial provider. This
 * task handles the process of removing a connection from the system and
 * revoking access with the provider.
 *
 * @remarks
 *   The task implements error handling and retry mechanisms to ensure reliable
 *   execution. It validates inputs using Zod schema validation before
 *   attempting deletion.
 * 
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
export const deleteConnection: Task<
  'delete-connection',
  DeleteConnectionInput,
  DeleteConnectionOutput
> = schemaTask({
  /**
   * Unique identifier for this task
   */
  id: 'delete-connection',

  /**
   * Schema used to validate input parameters
   */
  schema: deleteConnectionInputSchema,

  /**
   * Maximum duration in seconds that this task can run before timing out
   */
  maxDuration: 60,

  /**
   * Queue configuration to control concurrency and rate limiting
   */
  queue: {
    concurrencyLimit: 5,
  },

  /**
   * Configure retry behavior for the task
   * Implements an exponential backoff strategy with defined limits
   *
   * @see https://trigger.dev/docs/errors-retrying
   */
  retry: {
    maxAttempts: 2,
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
   * @param payload.provider - The financial provider (teller, plaid, gocardless, stripe)
   * @param payload.accessToken - The access token for authenticating with the provider
   * @param ctx - The execution context provided by Trigger.dev
   * 
   * @returns A result object with success status and message
   * 
   * @throws Error if the deletion process fails with the provider or during cleanup
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


        // we need to clean up database records for the connection
        const connection = await prisma.bankConnection.findUnique({
          where: {
            id: referenceId,
          },
        });

        if (!connection) {
          throw new Error(`Connection not found: ${referenceId}`);
        }

        /**
         * Call the engine API to delete the account from the provider and our system
         * This handles both revoking access with the provider and cleaning up database records
         */
        const result = await engine.apiFinancialAccounts.delete(referenceId, {
          accountId: referenceId,
          provider: provider as 'teller' | 'plaid' | 'gocardless' | 'stripe',
          accessToken,
        });

        /**
         * Handle unsuccessful deletion attempts
         * This will trigger the retry mechanism defined above
         */
        if (!result.success) {
          throw new Error(`Failed to delete ${provider} connection`);
        }

        // delete the connection
        const deletedConnection = await prisma.bankConnection.delete({
          where: { id: referenceId },
        });

        if (!deletedConnection) {
          throw new Error(`Failed to delete connection: ${referenceId}`);
        }


        logger.info('Successfully deleted bank connection', {
          referenceId,
          provider,
        });

        /**
         * Return success response with appropriate message
         */
        return {
          success: true,
          message: `Successfully deleted ${provider} connection for ${referenceId}`,
        };
      });
    } catch (error) {
      /**
       * Extract error message for consistent error handling
       */
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      /**
       * Log detailed error information for troubleshooting
       */
      logger.error('Failed to delete bank connection', {
        referenceId,
        provider,
        error: errorMessage,
      });

      // TODO: Add specific error handling for provider API errors
      // TODO: Implement partial deletion recovery for cases where the provider deleted but database cleanup failed

      /**
       * Propagate error with context to allow for proper client-side handling
       * The error includes the provider and reference ID for better debugging
       */
      throw new Error(
        `Failed to delete ${provider} connection: ${errorMessage}`
      );
    }
  },
});
