import {
  BalanceConnection,
  BalanceUpdatePayload,
  BalanceUpdateResult,
  BatchOperationResults,
  balanceUpdateResultSchema
} from '../sync/schema';
import { logger, schedules, tasks } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { BankConnectionStatus } from '@solomonai/prisma/client';
import { prisma } from '@solomonai/prisma';
import { syncConnectionJob } from '../sync/connection';

// Constants
const CONNECTIONS_BATCH_SIZE = 100;
const MAX_RETRIES = 3;

/**
 * Fetches bank connections that need balance updates
 * 
 * @returns List of bank connections ordered by oldest balance update first
 */
async function fetchConnectionsForBalanceUpdate(): Promise<BalanceConnection[]> {
  const connections = await prisma.bankConnection.findMany({
    include: {
      accounts: {
        where: {
          status: 'ACTIVE',
        },
        select: {
          id: true,
          name: true,
          status: true,
          balanceLastUpdated: true,
          currentBalance: true,
          availableBalance: true,
        }
      },
    },
    orderBy: {
      balanceLastUpdated: 'asc', // Update oldest first
    },
    take: CONNECTIONS_BATCH_SIZE, // Process in batches
    where: {
      status: BankConnectionStatus.ACTIVE,
    },
  });

  return connections as unknown as BalanceConnection[];
}

/**
 * Prepares batch payloads for the synchronization job
 * 
 * @param connections - List of bank connections to update
 * @returns List of batch payloads for the sync job
 */
function prepareBatchPayloads(connections: BalanceConnection[]): { payload: BalanceUpdatePayload }[] {
  return connections.map(connection => ({
    payload: {
      connectionId: connection.id,
      manualSync: true,
    }
  }));
}

/**
 * Process the results of a batch operation
 * 
 * @param batchResults - Results from the batch operation
 * @param connections - The original connections that were processed
 * @returns Metrics about the operation including success and error counts
 */
async function processBatchResults(
  batchResults: BatchOperationResults,
  connections: BalanceConnection[]
): Promise<{
  successCount: number;
  errorCount: number;
  accountsUpdated: number;
}> {
  let successCount = 0;
  let errorCount = 0;
  let accountsUpdated = 0;

  // Maps connection IDs to their index in the connections array for easy lookup
  const connectionMap = new Map<string, number>(
    connections.map((connection, index) => [connection.id, index])
  );

  // Process each result from the batch operation
  for (const result of batchResults.results) {
    const { runId, status, output, error } = result;

    // Get the original connection from the payload
    const connectionId = result.payload.connectionId;
    const connectionIndex = connectionMap.get(connectionId);

    if (connectionIndex === undefined) {
      logger.warn(`Unknown connection ID in batch results: ${connectionId}`);
      continue;
    }

    const connection = connections[connectionIndex];

    if (status === 'COMPLETED') {
      // Successful sync
      successCount++;

      // Count updated accounts (if output contains this information)
      if (output && output.accounts) {
        accountsUpdated += output.accounts.length;
      } else {
        // Fallback to counting all active accounts in the connection
        accountsUpdated += connection.accounts.length;
      }

      logger.info(`Successfully updated balance for connection ${connectionId} (${connection.institutionName})`);
    } else {
      // Failed sync
      errorCount++;

      const errorMessage = error?.message || 'Unknown error';
      logger.error(`Failed to update balance for connection ${connectionId}: ${errorMessage}`, {
        connectionId,
        institutionName: connection.institutionName,
        runId,
        error: errorMessage
      });
    }
  }

  return { successCount, errorCount, accountsUpdated };
}

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
 * The job runs every 12 hours to maintain relatively up-to-date balance information
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
  cron: '0 */12 * * *', // Every 12 hours

  /**
   * Main execution function for the bank balance update scheduler
   * 
   * @returns A summary object with metrics about the balance update operation
   */
  run: async (): Promise<BalanceUpdateResult> => {
    try {
      await logger.info('Starting balance update job');

      // Fetch bank connections that need balance updates
      const connections = await fetchConnectionsForBalanceUpdate();

      await logger.info(
        `Found ${connections.length} connections to update balances`
      );

      // If no connections to update, return early
      if (connections.length === 0) {
        return balanceUpdateResultSchema.parse({
          accountsUpdated: 0,
          connectionsProcessed: 0,
          errorCount: 0,
          successCount: 0,
        });
      }

      // Prepare payloads for batch processing
      const batchPayloads = prepareBatchPayloads(connections);

      try {
        // Make a single batch call for all connections
        await logger.info(`Triggering batch sync for ${batchPayloads.length} connections`);

        // Trigger batch operation to update all connections simultaneously
        const batchResults = await tasks.batchTriggerAndWait<typeof syncConnectionJob>(
          BANK_JOBS.SYNC_CONNECTION,
          batchPayloads
        );

        // Process batch results
        await logger.info(`Processing batch results for ${connections.length} connections`);
        const { successCount, errorCount, accountsUpdated } = await processBatchResults(
          batchResults as unknown as BatchOperationResults,
          connections
        );

        // Return metrics summarizing the balance update operation
        return balanceUpdateResultSchema.parse({
          accountsUpdated,
          connectionsProcessed: connections.length,
          errorCount,
          successCount,
        });
      } catch (error: unknown) {
        // Handle errors during the batch operation
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        await logger.error(`Error in batch sync operation: ${errorMessage}`, { error });

        // Return metrics indicating all connections failed
        return balanceUpdateResultSchema.parse({
          accountsUpdated: 0,
          connectionsProcessed: connections.length,
          errorCount: connections.length,
          successCount: 0,
        });
      }
    } catch (error: unknown) {
      // Handle unexpected errors in the main function
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await logger.error(`Unexpected error in update balances job: ${errorMessage}`, { error });

      // Return metrics indicating complete failure
      return balanceUpdateResultSchema.parse({
        accountsUpdated: 0,
        connectionsProcessed: 0,
        errorCount: 0,
        successCount: 0,
      });
    }
  },
});
