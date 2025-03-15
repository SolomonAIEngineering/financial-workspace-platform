import { logger, schedules, schemaTask } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { bankSyncScheduler } from '../scheduler/bank-scheduler';
import { generateCronTag } from '@/lib/generate-cron-tag';
import { syncConnectionJob as syncConnection } from '../sync/connection';
import { z } from 'zod';

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
export const initialSetupJob = schemaTask({
  id: BANK_JOBS.INITIAL_SETUP,
  description: 'Initial Bank Connection Setup',
  schema: z.object({
    teamId: z.string(),
    connectionId: z.string(),
  }),
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

    // S  chedule the bank sync task to run daily at a random time to distribute load
    // Use a deduplication key to prevent duplicate schedules for the same team
    // Add teamId as externalId to use it in the bankSyncScheduler task
    await schedules.create({
      task: bankSyncScheduler.id,
      cron: generateCronTag(teamId),
      timezone: 'UTC',
      externalId: teamId,
      deduplicationKey: `${teamId}-${bankSyncScheduler.id}`,
    });

    // Run initial sync for transactions and balance for the connection
    await syncConnection.triggerAndWait({
      connectionId,
      manualSync: true,
    });

    // And run once more to ensure all transactions are fetched on the providers side
    // GoCardLess, Teller and Plaid can take up to 3 minutes to fetch all transactions
    // For Teller and Plaid we also listen on the webhook to fetch any new transactions
    await syncConnection.trigger(
      {
        connectionId,
        manualSync: true,
      },
      {
        delay: '5m',
      }
    );
  },
});
