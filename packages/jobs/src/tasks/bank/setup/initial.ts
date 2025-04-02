import {
  InitialSetupInput,
  InitialSetupOutput,
  initialSetupInputSchema,
  initialSetupOutputSchema
} from './schema';
import { logger, schedules, schemaTask } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { Task } from '@trigger.dev/sdk/v3';
import { bankSyncScheduler } from '../scheduler/bank-scheduler';
import { generateCronTag } from '../../../utils/generate-cron-tag';
import { prisma } from '@solomonai/prisma/server';
import { syncConnectionJob as syncConnection } from '../sync/connection';

/**
 * This job handles the complete initial setup process when a user connects a
 * financial institution through Plaid Link or similar services.
 *
 * Key responsibilities:
 *
 * - Fetches institution details from Plaid (name, logo, colors)
 * - Creates a bank connection record in the database
 * - Retrieves all available accounts from the external provider
 * - Creates bank account records for each connected account
 * - Triggers staggered initial sync jobs for all accounts (with delays to avoid
 *   rate limits)
 * - Records the connection activity in the user history
 *
 * This job is a critical part of the user onboarding flow for financial data
 * integration, converting raw Plaid credentials into structured data in our
 * system.
 *
 * @file Bank Connection Initial Setup Job
 * @example
 *   // Trigger the initial setup job after Plaid Link success:
 *   await client.sendEvent({
 *     name: 'initial-setup',
 *     payload: {
 *       userId: 'user_123abc',
 *       accessToken: 'access-token-from-plaid',
 *       itemId: 'item-id-from-plaid',
 *       institutionId: 'ins_123456',
 *       publicToken: 'public-token-from-plaid',
 *     },
 *   });
 *
 * @example
 *   // The job returns a summary on success:
 *   {
 *   status: "success",
 *   bankConnectionId: "conn_abc123",
 *   accountCount: 5
 *   }
 */
export const initialSetupJob: Task<
  typeof BANK_JOBS.INITIAL_SETUP,
  InitialSetupInput,
  InitialSetupOutput
> = schemaTask({
  id: BANK_JOBS.INITIAL_SETUP,
  description: 'Initial Bank Connection Setup',
  schema: initialSetupInputSchema,
  maxDuration: 300,
  queue: {
    concurrencyLimit: 50,
  },
  /**
   * Main job execution function that sets up a new bank connection
   *
   * @param payload - The job payload containing connection details
   * @param payload.teamId - The ID of the team
   * @param payload.connectionId - The ID of the bank connection
   * @param io - The I/O context provided by Trigger.dev for logging, running
   *   tasks, etc.
   * @returns A result object containing the connection ID, account count, and
   *   status
   * @throws Error if any part of the setup process fails
   */
  run: async (payload) => {
    const { teamId, connectionId } = payload;
    logger.info(`Starting initial setup for institution ${connectionId}`);

    // TODO: Add validation that the team and connection exist before proceeding
    // TODO: Add handling for retries if this job is re-run

    // Schedule the bank sync task to run daily at a random time to distribute load
    // Use a deduplication key to prevent duplicate schedules for the same team
    // Add teamId as externalId to use it in the bankSyncScheduler task

    // TODO: store the schedule id in the database for the given team
    const schedule = await schedules.create({
      task: bankSyncScheduler.id,
      cron: generateCronTag(teamId),
      timezone: 'UTC',
      externalId: teamId,
      deduplicationKey: `${teamId}-${bankSyncScheduler.id}`,
    });

    if (!schedule) {
      throw new Error('Failed to create bank sync schedule');
    }

    // update the team with the schedule id
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        scheduleId: schedule.id, // save the schedule id in the database
      },
    });

    if (!updatedTeam) {
      throw new Error('Failed to update team with schedule id');
    }

    logger.info('Successfully created bank sync schedule', {
      scheduleId: schedule.id,
      timezone: schedule.timezone,
      externalId: schedule.externalId,
      deduplicationKey: schedule.deduplicationKey,
    });

    // Run initial sync for transactions and balance for the connection
    const syncResult = await syncConnection.triggerAndWait({
      connectionId,
      manualSync: true,
    });

    // Fetch the connection to get the access token
    await syncConnection.trigger(
      {
        connectionId,
        manualSync: true,
      },
      {
        delay: '5m',
      }
    );

    // Return success result
    return initialSetupOutputSchema.parse({
      success: true,
      bankConnectionId: connectionId,
      accountCount: 0, // TODO: Update with actual account count
    });
  },
});
