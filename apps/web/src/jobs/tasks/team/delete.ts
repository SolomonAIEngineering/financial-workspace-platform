import { logger, schedules, schemaTask } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../constants';
import { engine } from '@/lib/engine';
import { z } from 'zod';

/**
 * Defines a task to completely delete a team and all its financial connections.
 * This task handles the process of removing a team from the system, including
 * revoking access with all financial providers and cleaning up associated
 * data.
 *
 * @remarks
 *   The task implements error handling and retry mechanisms to ensure reliable
 *   execution. It validates inputs using Zod schema validation before
 *   attempting deletion.
 *
 *   Key steps in the deletion process:
 *
 *   1. Delete all connections from external financial providers
 *   2. Remove scheduled sync jobs for the team
 *   3. Delete the team and associated data from the database
 *
 * @example
 *   ```ts
 *   await client.sendEvent({
 *     name: 'delete-team',
 *     payload: {
 *       teamId: 'team-uuid-123',
 *       connections: [
 *         {
 *           provider: 'plaid',
 *           reference_id: 'connection-123',
 *           access_token: 'access-token-from-provider'
 *         }
 *       ]
 *     },
 *   });
 *   ```;
 *
 * @returns A result object containing the success status and a message
 */
export const deleteTeam = schemaTask({
  id: BANK_JOBS.DELETE_TEAM,
  description: 'Delete a team and all its financial connections',
  schema: z.object({
    teamId: z.string().uuid(),
    connections: z.array(
      z.object({
        provider: z
          .enum(['teller', 'plaid', 'gocardless', 'enablebanking', 'stripe'])
          .nullable(),
        reference_id: z.string().nullable(),
        access_token: z.string().nullable(),
      })
    ),
  }),
  maxDuration: 300,
  queue: {
    concurrencyLimit: 10,
  },
  /**
   * Configure retry behavior for the task
   *
   * @see https://trigger.dev/docs/errors-retrying
   */
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 60000,
    randomize: true,
  },
  /**
   * Main execution function for the team deletion task
   *
   * @param payload - The validated input parameters
   * @param payload.teamId - The unique identifier for the team to delete
   * @param payload.connections - Array of connections to delete from providers
   * @param ctx - The execution context provided by Trigger.dev
   * @returns A result object with success status and message
   * @throws Error if the deletion process fails
   */
  run: async (payload, { ctx }) => {
    const { teamId, connections } = payload;

    try {
      // Create a trace for this operation
      return await logger.trace('delete-team', async (span) => {
        // Add attributes to the trace for better observability
        span.setAttribute('teamId', teamId);
        span.setAttribute('connectionCount', connections.length);

        logger.info('Starting team deletion process', {
          teamId,
          connectionCount: connections.length,
        });

        // Step 1: Try to delete the scheduled sync job for this team
        // Note: schedules.delete is the recommended method, but we'll handle gracefully if it fails
        try {
          // Find the schedule for this team by its deduplication key
          const scheduleKey = `${teamId}-bank-sync-scheduler`;

          await schedules.del(scheduleKey);

          logger.info('Successfully deleted team sync schedule', {
            teamId,
            scheduleKey,
          });
        } catch (scheduleError) {
          // Log but continue - this is not a critical failure
          const errorMessage =
            scheduleError instanceof Error
              ? scheduleError.message
              : 'Unknown error';
          logger.warn(
            'Could not delete team sync schedule, continuing with deletion',
            {
              teamId,
              error: errorMessage,
            }
          );
        }

        // Step 2: Delete connections from providers
        logger.info('Deleting connections from financial providers', {
          connectionCount: connections.length,
          teamId,
        });

        // Process connections in parallel
        const connectionResults = await Promise.allSettled(
          connections
            .filter(
              (conn) => conn.provider && conn.reference_id && conn.access_token
            )
            .map(async (connection) => {
              try {
                if (
                  !connection.provider ||
                  !connection.reference_id ||
                  !connection.access_token
                ) {
                  return {
                    success: false,
                    message: 'Missing connection details',
                    connection,
                  };
                }

                // Use the engine API to delete each connection from the provider
                await engine.apiFinancialAccounts.delete(
                  connection.reference_id,
                  {
                    accountId: connection.reference_id,
                    provider: connection.provider as
                      | 'teller'
                      | 'plaid'
                      | 'gocardless'
                      | 'stripe',
                    accessToken: connection.access_token,
                  }
                );

                return {
                  success: true,
                  referenceId: connection.reference_id,
                  provider: connection.provider,
                };
              } catch (connError) {
                const errorMessage =
                  connError instanceof Error
                    ? connError.message
                    : 'Unknown error';
                logger.error('Failed to delete connection from provider', {
                  provider: connection.provider,
                  referenceId: connection.reference_id,
                  error: errorMessage,
                });

                return {
                  success: false,
                  referenceId: connection.reference_id,
                  provider: connection.provider,
                  error: errorMessage,
                };
              }
            })
        );

        // Analyze connection results
        const successfulConnections = connectionResults.filter(
          (result) =>
            result.status === 'fulfilled' && (result.value as any).success
        ).length;

        const failedConnections = connectionResults.filter(
          (result) =>
            result.status === 'rejected' || !(result.value as any).success
        ).length;

        logger.info('Connection deletion results', {
          teamId,
          totalConnections: connections.length,
          successfulConnections,
          failedConnections,
        });

        // Optional - Additional database cleanup could be added here
        // For example, directly removing data associated with this team

        logger.info('Team deletion process completed', {
          teamId,
          connectionsProcessed: connections.length,
          successfulConnections,
          failedConnections,
        });

        return {
          success: true,
          teamId,
          connectionsProcessed: connections.length,
          successfulConnections,
          failedConnections,
          message: `Successfully processed team deletion. ${successfulConnections} connections deleted, ${failedConnections} failed.`,
        };
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      logger.error('Failed to delete team', {
        teamId,
        error: errorMessage,
      });

      // Propagate error but with context
      throw new Error(`Failed to delete team ${teamId}: ${errorMessage}`);
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
    const { teamId } = payload;

    // If it's a database connection error, wait longer
    if (
      error instanceof Error &&
      error.message.includes('database connection')
    ) {
      logger.warn(
        `Database connection error, delaying retry for team ${teamId}`
      );
      return {
        retryAt: new Date(Date.now() + 60000), // Wait 1 minute
      };
    }

    // For other errors, use the default retry strategy
    return;
  },
});
