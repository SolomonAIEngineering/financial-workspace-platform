import { BANK_JOBS } from '../../constants';
import { client } from '../../../client';
import { eventTrigger } from '@trigger.dev/sdk';
import { prisma } from '@/server/db';
import { z } from 'zod';

/**
 * @file Bank Connection Token Refresh Job
 * @description This job handles the token refresh process for bank connections across different providers.
 * It's triggered when a connection's access token needs to be renewed, handling the renewal process
 * specific to each provider (Plaid, Teller, GoCardless).
 * 
 * Key responsibilities:
 * - Refreshes access tokens before they expire
 * - Updates connection status during refresh processes
 * - Handles provider-specific refresh flows
 * - Triggers verification syncs after refreshes
 * - Sends notifications to users when manual intervention is needed
 * 
 * @example
 * // Trigger a token refresh for a Plaid connection
 * await client.sendEvent({
 *   name: "refresh-connection",
 *   payload: {
 *     connectionId: "conn_123abc",
 *     accessToken: "current-access-token",
 *     refreshToken: "current-refresh-token",
 *     provider: "plaid",
 *     userId: "user_456def"
 *   }
 * });
 * 
 * @example
 * // The job returns a result object with the new tokens on success:
 * {
 *   success: true,
 *   newAccessToken: "new-access-token-123",
 *   newRefreshToken: "new-refresh-token-456",
 *   expiresAt: "2023-05-15T10:30:00.000Z"
 * }
 * 
 * // Or an error message on failure:
 * {
 *   success: false,
 *   error: "Invalid refresh token"
 * }
 */
export const refreshConnectionJob = client.defineJob({
  id: BANK_JOBS.REFRESH_CONNECTION,
  name: 'Refresh Bank Connection',
  trigger: eventTrigger({
    name: 'refresh-connection',
    schema: z.object({
      connectionId: z.string(),
      accessToken: z.string(),
      refreshToken: z.string(),
      provider: z.enum(['plaid', 'teller', 'gocardless']),
      userId: z.string(),
    }),
  }),
  version: '1.0.0',
  /**
   * Main job execution function that refreshes tokens for a specific bank connection
   * 
   * @param payload - The job payload containing connection details and tokens
   * @param payload.connectionId - The unique ID of the bank connection to refresh
   * @param payload.accessToken - The current access token for the connection
   * @param payload.refreshToken - The current refresh token for the connection
   * @param payload.provider - The provider type ('plaid', 'teller', or 'gocardless')
   * @param payload.userId - The ID of the user who owns the connection
   * @param io - The I/O context provided by Trigger.dev for logging, running tasks, etc.
   * @returns A result object containing success status and new token information
   */
  run: async (payload, io) => {
    const { connectionId, accessToken, refreshToken, provider, userId } =
      payload;

    await io.logger.info('Starting connection refresh job', {
      connectionId,
      provider,
    });

    try {
      // Update connection status to refreshing
      await io.runTask('update-connection-status-refreshing', async () => {
        await prisma.bankConnection.update({
          data: {
            status: 'REFRESHING',
            lastRefreshAttempt: new Date(),
          },
          where: { id: connectionId },
        });
      });

      // Perform provider-specific token refresh
      let refreshResult;

      if (provider === 'plaid') {
        refreshResult = await io.runTask('refresh-plaid-tokens', async () => {
          // In a real implementation, you would call the Plaid API to refresh tokens
          // For now, we'll simulate a successful refresh
          return {
            access_token: `new_${accessToken}`,
            refresh_token: `new_${refreshToken}`,
            expires_at: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(), // 30 days from now
          };
        });
      } else if (provider === 'teller') {
        refreshResult = await io.runTask('refresh-teller-tokens', async () => {
          // Simulate Teller token refresh
          return {
            access_token: `new_${accessToken}`,
            refresh_token: `new_${refreshToken}`,
            expires_at: new Date(
              Date.now() + 90 * 24 * 60 * 60 * 1000
            ).toISOString(), // 90 days from now
          };
        });
      } else if (provider === 'gocardless') {
        refreshResult = await io.runTask(
          'refresh-gocardless-tokens',
          async () => {
            // Simulate GoCardless token refresh
            return {
              access_token: `new_${accessToken}`,
              refresh_token: `new_${refreshToken}`,
              expires_at: new Date(
                Date.now() + 60 * 24 * 60 * 60 * 1000
              ).toISOString(), // 60 days from now
            };
          }
        );
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      // Extract new tokens from result
      const newAccessToken = refreshResult.access_token;
      const newRefreshToken = refreshResult.refresh_token;
      const expiresAt = refreshResult.expires_at;

      await io.logger.info('Successfully refreshed connection tokens', {
        connectionId,
        expiresAt,
      });

      // Update connection with new tokens
      await io.runTask('update-connection-with-new-tokens', async () => {
        await prisma.bankConnection.update({
          data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresAt: new Date(expiresAt),
            status: 'ACTIVE',
            lastRefreshSuccess: new Date(),
            error: null,
          },
          where: { id: connectionId },
        });
      });

      // Queue a sync job with the new access token to verify it works
      await client.sendEvent({
        name: 'sync-connection',
        payload: {
          connectionId,
          accessToken: newAccessToken,
          userId,
        },
      });

      return {
        success: true,
        newAccessToken,
        newRefreshToken,
        expiresAt,
      };
    } catch (error) {
      await io.logger.error('Connection refresh job failed', {
        connectionId,
        provider,
        error: error.message,
      });

      // Update connection status based on error
      let status = 'REFRESH_FAILED';
      let errorMessage = error.message;

      // Provider-specific error handling
      if (provider === 'plaid' && error.code === 'INVALID_REFRESH_TOKEN') {
        status = 'INVALID_REFRESH_TOKEN';
        errorMessage = 'Invalid refresh token';
      } else if (
        provider === 'gocardless' &&
        error.code === 'refresh_token_expired'
      ) {
        status = 'REFRESH_TOKEN_EXPIRED';
        errorMessage = 'Refresh token expired';
      }

      await io.runTask('update-connection-with-error', async () => {
        await prisma.bankConnection.update({
          data: {
            status,
            error: errorMessage,
            lastRefreshAttempt: new Date(),
          },
          where: { id: connectionId },
        });
      });

      // Notify user if refresh failed and needs attention
      if (
        status === 'INVALID_REFRESH_TOKEN' ||
        status === 'REFRESH_TOKEN_EXPIRED'
      ) {
        await client.sendEvent({
          name: 'connection-notification',
          payload: {
            userId,
            type: 'connection_refresh_failed',
            title: 'Bank Connection Needs Attention',
            message: 'Your bank connection needs to be reconnected.',
            data: {
              connectionId,
              provider,
              error: errorMessage,
            },
          },
        });
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});
