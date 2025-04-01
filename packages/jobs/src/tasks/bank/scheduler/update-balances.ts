import { logger, schedules, tasks } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { BankConnectionStatus } from '@solomonai/prisma/client';
import { prisma } from '@solomonai/prisma';
import { syncConnectionJob } from '../sync/connection';

/**
 * Scheduled job that updates bank account balances frequently without pulling
 * full transaction history, providing more real-time balance data.
 * 
 * @remarks
 * This task is designed to efficiently update balance information across a large
 * number of bank connections by:
 * 
 * 1. Finding active bank connections that need balance updates
 * 2. Prioritizing connections with the oldest balance information
 * 3. Processing connections in batches to prevent rate limiting
 * 4. Using batch operations to optimize API usage
 * 
 * The job runs every 6 hours to maintain relatively up-to-date balance information
 * without overwhelming external banking APIs or consuming excessive resources.
 * 
 * @example
 * This job runs automatically on schedule, but can be triggered manually:
 * ```ts
 * await client.sendEvent({
 *   name: 'run-job',
 *   payload: {
 *     jobId: 'update-bank-balances',
 *   },
 * });
 * ```
 * 
 * @returns An object containing metrics about the balance update operation
 */
export const updateBalancesJob = schedules.task({
  id: BANK_JOBS.UPDATE_BALANCES,
  description: 'Update Bank Balances',
  cron: '0 */6 * * *', // Every 6 hours
  // TODO: Add configurable update frequency based on account type (checking vs savings)
  // TODO: Add staggered execution to prevent updating all balances at once

  /**
   * Main execution function for the bank balance update scheduler
   * 
   * @returns A summary object with metrics about the balance update operation
   */
  run: async () => {
    await logger.info('Starting balance update job');

    /**
     * Structure representing a bank connection with its accounts
     * Used for updating balances across multiple accounts within a connection
     * 
     * @typedef {Object} BankConnection
     * @property {string} id - Unique identifier for the connection
     * @property {Array<any>} accounts - Accounts associated with this connection
     * @property {string} accessToken - Token used to authenticate with the provider
     * @property {any} [key: string] - Additional dynamic properties
     */
    let connections: {
      id: string;
      accounts: any[];
      accessToken: string;
      [key: string]: any;
    }[] = [];

    // TODO: Add stricter typing for connections to avoid any[] types

    /**
     * Fetch active bank connections prioritizing those with oldest balance data
     * Limits to 100 connections per batch to manage load and API rate limits
     */
    const result = await prisma.bankConnection.findMany({
      include: {
        accounts: {
          where: {
            status: 'ACTIVE',
          },
        },
      },
      orderBy: {
        balanceLastUpdated: 'asc', // Update oldest first
      },
      take: 100, // Process in batches
      where: {
        status: BankConnectionStatus.ACTIVE,
      },
    });


    connections = result;

    await logger.info(
      `Found ${connections.length} connections to update balances`
    );

    /**
     * Metrics to track the success and impact of the balance update operation
     */
    let successCount = 0;
    let errorCount = 0;
    let accountsUpdated = 0;

    // TODO: Add tracking for balance change magnitudes to detect unusual activity
    // TODO: Add tracking for balance update latency by provider

    /**
     * Prepare payloads for batch processing of all connections
     * Each payload contains the connection ID and flag indicating manual sync
     * This enables efficient parallelized processing of balance updates
     */
    const batchPayloads = connections.map(connection => ({
      payload: {
        connectionId: connection.id,
        manualSync: true,
      }
    }));

    try {
      // Make a single batch call for all connections
      await logger.info(`Triggering batch sync for ${batchPayloads.length} connections`);

      /**
       * Trigger batch operation to update all connections simultaneously
       * This is more efficient than making separate API calls for each connection
       * The syncConnectionJob handles fetching fresh account data from providers
       */
      const batchResults = await tasks.batchTriggerAndWait<typeof syncConnectionJob>(
        BANK_JOBS.SYNC_CONNECTION,
        batchPayloads
      );

      // Process batch results based on each connection (using entries so we have indices)
      await logger.info(`Processing batch results for ${connections.length} connections`);

    } catch (error) {
      /**
       * Handle errors during the batch operation
       * Record error details and mark all connections as failed in this batch
       */
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await logger.error(`Error in batch sync operation: ${errorMessage}`);
      errorCount += connections.length;
    }

    /**
     * Return metrics summarizing the balance update operation
     * These metrics can be used for monitoring and alerting
     * 
     * @typedef {Object} BalanceUpdateResult
     * @property {number} accountsUpdated - Number of individual accounts updated
     * @property {number} connectionsProcessed - Total number of connections processed
     * @property {number} errorCount - Number of connections that encountered errors
     * @property {number} successCount - Number of connections successfully updated
     */
    return {
      accountsUpdated,
      connectionsProcessed: connections.length,
      errorCount,
      successCount,
    };
  },
});
