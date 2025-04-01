import {
  ConnectionDeleteResult,
  ConnectionToDelete,
  DeleteTeamInput,
  DeleteTeamOutput,
  deleteTeamInputSchema,
  deleteTeamOutputSchema
} from './schema';
import { Task, logger, schedules, schemaTask } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../constants';
import { bankSyncScheduler } from '../bank/scheduler/bank-scheduler';
import { engine } from '@solomonai/lib/clients';
import { prisma } from '@solomonai/prisma';

/**
 * Attempt to delete a team's scheduled sync job
 * 
 * @param teamId - The ID of the team
 * @returns Success message or error
 */
async function deleteTeamSyncSchedule(teamId: string): Promise<{ success: boolean; message: string }> {
  try {

    // get the team from the database
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

    if (!team || !team.scheduleId) {
      return {
        success: false,
        message: `Team ${teamId} not found`,
      };
    }


    // Find the schedule for this team by its deduplication key
    await schedules.del(team.scheduleId);

    logger.info('Successfully deleted team sync schedule', {
      teamId,
      scheduleKey: team.scheduleId,
    });

    return {
      success: true,
      message: `Successfully deleted schedule for team ${teamId}`
    };
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

    return {
      success: false,
      message: `Failed to delete schedule: ${errorMessage}`
    };
  }
}

/**
 * Delete a single connection from its provider
 * 
 * @param connection - The connection to delete
 * @returns Result of the deletion operation
 */
async function deleteConnectionFromProvider(
  connection: ConnectionToDelete
): Promise<ConnectionDeleteResult> {
  try {
    if (
      !connection.provider ||
      !connection.reference_id ||
      !connection.access_token
    ) {
      return {
        success: false,
        message: 'Missing connection details',
        provider: connection.provider,
        referenceId: connection.reference_id || undefined,
      };
    }

    // Use the engine API to delete the connection from the provider
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
      referenceId: connection.reference_id || undefined,
      provider: connection.provider,
      error: errorMessage,
    };
  }
}

/**
 * Delete all connections for a team from their respective providers
 * 
 * @param connections - Array of connections to delete
 * @param teamId - The ID of the team for logging purposes
 * @returns Results of the deletion operation with success counts
 */
async function deleteTeamConnections(
  connections: ConnectionToDelete[],
  teamId: string
): Promise<{
  successfulConnections: number;
  failedConnections: number;
  results: PromiseSettledResult<ConnectionDeleteResult>[];
}> {
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
      .map(deleteConnectionFromProvider)
  );

  // Analyze connection results
  const successfulConnections = connectionResults.filter(
    (result) =>
      result.status === 'fulfilled' && result.value.success
  ).length;

  const failedConnections = connectionResults.filter(
    (result) =>
      result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
  ).length;

  logger.info('Connection deletion results', {
    teamId,
    totalConnections: connections.length,
    successfulConnections,
    failedConnections,
  });

  return {
    successfulConnections,
    failedConnections,
    results: connectionResults
  };
}

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
export const deleteTeam: Task<
  typeof BANK_JOBS.DELETE_TEAM,
  DeleteTeamInput,
  DeleteTeamOutput
> = schemaTask({
  id: BANK_JOBS.DELETE_TEAM,
  description: 'Delete a team and all its financial connections',
  schema: deleteTeamInputSchema,
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
  run: async (payload): Promise<DeleteTeamOutput> => {
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
        const scheduleResult = await deleteTeamSyncSchedule(teamId);

        // Step 2: Delete connections from providers
        const connectionResults = await deleteTeamConnections(connections, teamId);

        // Optional - Additional database cleanup could be added here
        // For example, directly removing data associated with this team

        // Delete the team from the database
        const deletedTeam = await prisma.team.delete({
          where: {
            id: teamId,
          },
        });

        // delete the team account from stripe 

        logger.info('Team deletion process completed', {
          teamId,
          connectionsProcessed: connections.length,
          successfulConnections: connectionResults.successfulConnections,
          failedConnections: connectionResults.failedConnections,
        });

        return deleteTeamOutputSchema.parse({
          success: true,
          teamId,
          connectionsProcessed: connections.length,
          successfulConnections: connectionResults.successfulConnections,
          failedConnections: connectionResults.failedConnections,
          message: `Successfully processed team deletion. ${connectionResults.successfulConnections} connections deleted, ${connectionResults.failedConnections} failed.`,
        });
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
});
