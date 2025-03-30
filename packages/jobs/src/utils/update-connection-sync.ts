import { BankConnectionStatus, SyncStatus } from '@solomonai/prisma/client';

import { prisma } from '@solomonai/prisma';

/**
 * Updates the synchronization status of a bank connection.
 *
 * This utility function manages the state of bank connections during the
 * synchronization process. It can track when a connection is actively syncing,
 * has completed syncing, or has encountered an error. It also updates the
 * lastSyncedAt timestamp when appropriate.
 *
 * Key behaviors:
 *
 * - When status is SYNCING: Clears lastSyncedAt (sync in progress)
 * - When status is SUCCESS/FAILED/etc: Sets lastSyncedAt to current time
 * - When error is provided: Sets connection status to ERROR and stores the error
 *   message
 *
 * @example
 *   ```typescript
 *   // Mark a connection as currently syncing
 *   await updateConnectionSyncStatus('conn_123456', SyncStatus.SYNCING);
 *
 *   try {
 *     // Perform sync operations...
 *     const data = await plaidClient.transactionsSync({ access_token });
 *     await processTransactions(data.transactions);
 *
 *     // Mark sync as successful after completion
 *     await updateConnectionSyncStatus('conn_123456', SyncStatus.SUCCESS);
 *   } catch (error) {
 *     // Handle sync failure with error message
 *     await updateConnectionSyncStatus(
 *       'conn_123456',
 *       SyncStatus.FAILED,
 *       error.message || 'Failed to sync transactions'
 *     );
 *   }
 *   ```;
 *
 * @param connectionId - The unique identifier of the bank connection to update
 * @param status - The new synchronization status to set
 * @param error - Optional error message if the sync failed
 * @returns A Promise that resolves when the database update is complete
 */
export async function updateConnectionSyncStatus(
  connectionId: string,
  status: SyncStatus,
  error?: string
): Promise<void> {
  await prisma.bankConnection.update({
    data: {
      errorMessage: error || undefined,
      lastSyncedAt: status === SyncStatus.SYNCING ? undefined : new Date(),
      status: error ? BankConnectionStatus.ERROR : undefined,
      syncStatus: status,
    },
    where: {
      id: connectionId,
    },
  });
}
