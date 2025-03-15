import { logger, schedules } from '@trigger.dev/sdk/v3';

import { prisma } from '@/server/db';
import { syncConnectionJob } from '../sync/connection';
import { z } from 'zod';

const formattedConnectionSchema = z.object({
  payload: z.object({
    connectionId: z.string(),
  }),
});

type FormattedConnection = z.infer<typeof formattedConnectionSchema>;

// This is a fan-out pattern. We want to trigger a job for each bank connection
// Then in sync connection we check if the connection is connected and if not we update the status (Connected, Disconnected)
export const bankSyncScheduler = schedules.task({
  id: 'bank-sync-scheduler',
  maxDuration: 600,
  run: async (payload) => {
    // Only run in production (Set in Trigger.dev)
    if (process.env.TRIGGER_ENVIRONMENT !== 'production') return;

    const teamId = payload.externalId;

    if (!teamId) {
      throw new Error('teamId is required');
    }

    try {
      // Get all bank connections for the team
      const bankConnections = await prisma.bankConnection.findMany({
        where: {
          Team: {
            some: {
              id: teamId,
            },
          },
        },
      });

      // Format the bank connections for the sync connection job
      const formattedConnections: Array<FormattedConnection> =
        bankConnections?.map((connection) => ({
          payload: {
            connectionId: connection.id,
          },
        }));

      // If there are no bank connections to sync, return
      if (!formattedConnections?.length) {
        logger.info('No bank connections to sync');
        return;
      }

      // Trigger the sync connection job for each bank connection
      await syncConnectionJob.batchTrigger(formattedConnections);
    } catch (error) {
      logger.error('Failed to sync bank connections', { error });

      throw error;
    }
  },
});
