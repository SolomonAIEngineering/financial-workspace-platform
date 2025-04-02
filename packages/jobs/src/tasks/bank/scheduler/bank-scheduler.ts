import { logger, schedules } from '@trigger.dev/sdk/v3';

import { prisma } from '@solomonai/prisma/server';
import { syncConnectionJob } from '../sync/connection';
import { z } from 'zod';

/** Schema for formatted connection objects used for batch triggering */
const formattedConnectionSchema = z.object({
  payload: z.object({
    connectionId: z.string(),
  }),
});

type FormattedConnection = z.infer<typeof formattedConnectionSchema>;

/**
 * Scheduled task that handles periodic syncing of all bank connections for a
 * team. This implements a fan-out pattern to trigger individual sync jobs for
 * each connection.
 *
 * @remarks
 *   This scheduler runs on a defined schedule and finds all bank connections
 *   associated with a team, then triggers individual sync jobs for each
 *   connection. It uses batch triggering for efficiency and implements error
 *   handling and retry mechanisms.
 * @example
 *   This job is triggered automatically according to the schedule defined in the Trigger.dev dashboard.
 *   It can also be manually triggered for testing:
 *   ```ts
 *   await client.sendEvent({
 *   name: 'manual-bank-sync',
 *   payload: {
 *   externalId: 'team-123',
 *   },
 *   });
 *   ```
 *
 * @returns Void or error if the process fails
 */
export const bankSyncScheduler = schedules.task({
  id: 'bank-sync-scheduler',
  maxDuration: 600,
  /**
   * Configure retry behavior for the scheduled task
   *
   * @see https://trigger.dev/docs/errors-retrying
   */
  retry: {
    maxAttempts: 5,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 60000,
    randomize: true,
  },
  /**
   * Main execution function for the bank sync scheduler
   *
   * @param payload - The scheduler payload
   * @param payload.externalId - The team ID to sync connections for
   * @param ctx - The execution context provided by Trigger.dev
   * @returns Void or throws an error if the process fails
   */
  run: async (payload, ctx) => {
    // Only run in production (Set in Trigger.dev)
    if (process.env.TRIGGER_ENVIRONMENT !== 'production') return;

    const teamId = payload.externalId;

    if (!teamId) {
      throw new Error('teamId is required');
    }

    // TODO: Add validation that the team exists before proceeding

    try {
      // Create a trace for the entire sync operation
      return await logger.trace('bank-sync-scheduler', async (span) => {
        span.setAttribute('teamId', teamId);

        logger.info('Starting bank connection sync for team', { teamId });

        // TODO: Add rate limiting check to prevent excessive syncs for the same team

        // Get all bank connections for the team
        const bankConnections = await prisma.bankConnection.findMany({
          where: {
            userId: {
              in: await prisma.usersOnTeam
                .findMany({
                  where: { teamId },
                  select: { userId: true },
                })
                .then((users) => users.map((u) => u.userId)),
            },
          },
        });


        span.setAttribute('connectionCount', bankConnections.length);
        logger.info(`Found ${bankConnections.length} bank connections`, {
          teamId,
        });

        // Format the bank connections for the sync connection job
        const formattedConnections = bankConnections?.map((connection) => ({
          payload: {
            connectionId: connection.id,
          },
          tags: ["team_id", teamId],
        }));

        // If there are no bank connections to sync, return
        if (!formattedConnections?.length) {
          logger.info('No bank connections to sync', { teamId });
          return {
            success: true,
            message: 'No bank connections to sync',
            connectionsCount: 0,
          };
        }


        // Trigger the sync connection job for each bank connection
        await syncConnectionJob.batchTrigger(formattedConnections);


        logger.info('Successfully triggered sync for all connections', {
          teamId,
          connectionCount: formattedConnections.length,
        });

        return {
          success: true,
          message: `Triggered sync for ${formattedConnections.length} bank connections`,
          connectionsCount: formattedConnections.length,
        };
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      logger.error('Failed to sync bank connections', {
        teamId,
        error: errorMessage,
      });

      throw new Error(
        `Failed to sync bank connections for team ${teamId}: ${errorMessage}`
      );
    }
  },
});
