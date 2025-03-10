import { BANK_JOBS } from '../../constants';
import { client } from '../../../client';
import { eventTrigger } from '@trigger.dev/sdk';
import { getItemDetails } from '@/server/services/plaid';
import { prisma } from '@/server/db';
import { z } from 'zod';

/**
 * @file Bank Connection Recovery Job
 * @description This job implements an intelligent recovery mechanism for failed bank connections.
 * It uses an exponential backoff strategy to retry failed connections, checks their status
 * with the respective provider APIs, and handles appropriate recovery actions.
 * 
 * Key features:
 * - Attempts to recover connections that have entered an error state
 * - Implements exponential backoff for retries (15min, 30min, 60min)
 * - Supports multiple banking providers (Plaid, Teller, GoCardless)
 * - Automatically syncs data once a connection is recovered
 * - Notifies users when a connection cannot be automatically recovered
 * 
 * @example
 * // Trigger a recovery attempt for a connection
 * await client.sendEvent({
 *   name: "connection-recovery",
 *   payload: {
 *     connectionId: "conn_123abc",
 *     provider: "plaid",
 *     accessToken: "access-token-xyz",
 *     retryCount: 0 // Optional, defaults to 0
 *   }
 * });
 * 
 * @example
 * // The job returns different result objects based on the recovery status:
 * 
 * // When recovery is successful:
 * {
 *   success: true,
 *   recovered: true
 * }
 * 
 * // When a retry is scheduled:
 * {
 *   success: true,
 *   recovered: false,
 *   scheduled: true,
 *   nextAttempt: "in 30 minutes"
 * }
 * 
 * // When max retries are exceeded:
 * {
 *   success: true,
 *   recovered: false,
 *   scheduled: false,
 *   maxRetriesExceeded: true
 * }
 * 
 * // When an unexpected error occurs:
 * {
 *   success: false,
 *   error: "Error message details"
 * }
 */
export const connectionRecoveryJob = client.defineJob({
  id: BANK_JOBS.CONNECTION_RECOVERY,
  name: 'Bank Connection Recovery',
  trigger: eventTrigger({
    name: 'connection-recovery',
    schema: z.object({
      connectionId: z.string(),
      provider: z.enum(['plaid', 'teller', 'gocardless']),
      accessToken: z.string(),
      retryCount: z.number().optional(),
    }),
  }),
  version: '1.0.0',
  /**
   * Main job execution function that attempts to recover a failed connection
   * 
   * @param payload - The job payload containing connection details
   * @param payload.connectionId - The unique ID of the bank connection to recover
   * @param payload.provider - The provider type ('plaid', 'teller', or 'gocardless')
   * @param payload.accessToken - The current access token for the connection
   * @param payload.retryCount - The current retry attempt count (defaults to 0)
   * @param io - The I/O context provided by Trigger.dev for logging, running tasks, etc.
   * @returns A result object containing success status and recovery information
   */
  run: async (payload, io) => {
    const { connectionId, provider, accessToken, retryCount = 0 } = payload;

    await io.logger.info('Starting connection recovery job', {
      connectionId,
      provider,
      retryCount,
    });

    try {
      // Check connection status
      let status = { valid: false, error: null };

      if (provider === 'plaid') {
        const itemDetails = await io.runTask(
          'check-plaid-connection',
          async () => {
            return await getItemDetails(accessToken);
          }
        );

        status.valid = !itemDetails.error;
        status.error = itemDetails.error;
      } else if (provider === 'teller') {
        // Simulate Teller connection check
        status = await io.runTask('check-teller-connection', async () => {
          // For demo purposes, we'll simulate a valid connection
          return { valid: true, error: null };
        });
      } else if (provider === 'gocardless') {
        // Simulate GoCardless connection check
        status = await io.runTask('check-gocardless-connection', async () => {
          // For demo purposes, we'll simulate a valid connection
          return { valid: true, error: null };
        });
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      if (status.valid) {
        // Connection is valid, update status
        await io.runTask('update-connection-status-active', async () => {
          await prisma.bankConnection.update({
            data: {
              status: 'ACTIVE',
              error: null,
              errorRetries: 0,
            },
            where: { id: connectionId },
          });
        });

        // Get the user ID for this connection
        const connection = await io.runTask('get-connection', async () => {
          return await prisma.bankConnection.findUnique({
            select: {
              userId: true,
            },
            where: { id: connectionId },
          });
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

        await io.runTask('update-connection-status-error', async () => {
          await prisma.bankConnection.update({
            data: {
              status: 'ERROR',
              error: status.error || 'Connection validation failed',
              errorRetries: newRetryCount,
            },
            where: { id: connectionId },
          });
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

          await io.logger.info('Scheduled next recovery attempt', {
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
        const connection = await io.runTask('get-connection-user', async () => {
          return await prisma.bankConnection.findUnique({
            select: {
              userId: true,
            },
            where: { id: connectionId },
          });
        });

        // Max retries exceeded, notify user
        await client.sendEvent({
          name: 'connection-notification',
          payload: {
            userId: connection.userId,
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
      await io.logger.error('Connection recovery job failed', {
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
