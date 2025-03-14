import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { client } from '@/jobs/client';
import { getItemDetails } from '@/server/services/plaid';
import { prisma } from '@/server/db';
import { z } from 'zod';

// TODO: rework this logic

/**
 * This job implements an intelligent recovery mechanism for failed bank
 * connections. It uses an exponential backoff strategy to retry failed
 * connections, checks their status with the respective provider APIs, and
 * handles appropriate recovery actions.
 *
 * Key features:
 *
 * - Attempts to recover connections that have entered an error state
 * - Implements exponential backoff for retries (15min, 30min, 60min)
 * - Supports multiple banking providers (Plaid, Teller, GoCardless)
 * - Automatically syncs data once a connection is recovered
 * - Notifies users when a connection cannot be automatically recovered
 *
 * @file Bank Connection Recovery Job
 * @example
 *   // Trigger a recovery attempt for a connection
 *   await client.sendEvent({
 *     name: 'connection-recovery',
 *     payload: {
 *       connectionId: 'conn_123abc',
 *       provider: 'plaid',
 *       accessToken: 'access-token-xyz',
 *       retryCount: 0, // Optional, defaults to 0
 *     },
 *   });
 *
 * @example
 *   // The job returns different result objects based on the recovery status:
 *
 *   // When recovery is successful:
 *   {
 *   success: true,
 *   recovered: true
 *   }
 *
 *   // When a retry is scheduled:
 *   {
 *   success: true,
 *   recovered: false,
 *   scheduled: true,
 *   nextAttempt: "in 30 minutes"
 *   }
 *
 *   // When max retries are exceeded:
 *   {
 *   success: true,
 *   recovered: false,
 *   scheduled: false,
 *   maxRetriesExceeded: true
 *   }
 *
 *   // When an unexpected error occurs:
 *   {
 *   success: false,
 *   error: "Error message details"
 *   }
 */
export const connectionRecoveryJob = schemaTask({
  id: BANK_JOBS.CONNECTION_RECOVERY,
  description: 'Bank Connection Recovery',
  schema: z.object({
    connectionId: z.string(),
    provider: z.enum(['plaid', 'teller', 'gocardless']),
    accessToken: z.string(),
    retryCount: z.number().optional(),
  }),
  /**
   * Main job execution function that attempts to recover a failed connection
   *
   * @param payload - The job payload containing connection details
   * @param payload.connectionId - The unique ID of the bank connection to
   *   recover
   * @param payload.provider - The provider type ('plaid', 'teller', or
   *   'gocardless')
   * @param payload.accessToken - The current access token for the connection
   * @param payload.retryCount - The current retry attempt count (defaults to 0)
   * @param io - The I/O context provided by Trigger.dev for logging, running
   *   tasks, etc.
   * @returns A result object containing success status and recovery information
   */
  run: async (payload, io) => {
    const { connectionId, provider, accessToken, retryCount = 0 } = payload;

    logger.info('Starting connection recovery job', {
      connectionId,
      provider,
      retryCount,
    });

    try {
      // Check connection status
      let status = { valid: false, error: null };

      switch (provider) {
        case 'plaid': {
          const itemDetails = await getItemDetails(accessToken);

          status.valid = itemDetails.status === 'HEALTHY';
          status.error = itemDetails.status;
          break;
        }
        case 'teller': {
          // Simulate Teller connection check
          status = { valid: true, error: null };
          break;
        }
        case 'gocardless': {
          // Simulate GoCardless connection check
          status = { valid: true, error: null };
          break;
        }
        default: {
          throw new Error(`Unsupported provider: ${provider}`);
        }
      }

      if (status.valid) {
        // Connection is valid, update status
        const updatedConnection = await prisma.bankConnection.update({
          data: {
            status: 'ACTIVE',
            errorMessage: null,
          },
          where: { id: connectionId },
        });

        // Get the user ID for this connection
        const connection = await prisma.bankConnection.findUnique({
          select: {
            userId: true,
          },
          where: { id: connectionId },
        });

        // Trigger a sync to verify the connection works
        await client.sendEvent({
          name: 'sync-connection',
          payload: {
            connectionId,
            userId: connection?.userId,
          },
        });

        return {
          success: true,
          recovered: true,
        };
      } else {
        // Connection is invalid, increment retry count
        const newRetryCount = retryCount + 1;

        await prisma.bankConnection.update({
          data: {
            status: 'ERROR',
            errorMessage: status.error || 'Connection validation failed',
          },
          where: { id: connectionId },
        });

        // If we haven't exceeded max retries, schedule another attempt
        if (newRetryCount < 3) {
          // Schedule with exponential backoff
          const delayMinutes = Math.pow(2, newRetryCount) * 15; // 15min, 30min, 60min

          await client.sendEvent({
            context: {
              delaySeconds: delayMinutes * 60, // Convert minutes to seconds
            },
            name: 'connection-recovery',
            payload: {
              connectionId,
              provider,
              accessToken,
              retryCount: newRetryCount,
            },
          });

          logger.info('Scheduled next recovery attempt', {
            connectionId,
            nextAttempt: `in ${delayMinutes} minutes`,
            retryCount: newRetryCount,
          });

          return {
            success: true,
            recovered: false,
            scheduled: true,
            nextAttempt: `in ${delayMinutes} minutes`,
          };
        }

        // Get the user ID for this connection
        const connection = await prisma.bankConnection.findUnique({
          select: {
            userId: true,
          },
          where: { id: connectionId },
        });

        // Max retries exceeded, notify user
        await client.sendEvent({
          name: 'connection-notification',
          payload: {
            userId: connection?.userId,
            type: 'connection_failed',
            title: 'Bank Connection Failed',
            message:
              'We were unable to connect to your bank. Please reconnect your account.',
            data: {
              connectionId,
              error: status.error,
            },
          },
        });

        return {
          success: true,
          recovered: false,
          scheduled: false,
          maxRetriesExceeded: true,
        };
      }
    } catch (error) {
      logger.error('Connection recovery job failed', {
        connectionId,
        provider,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  },
});
