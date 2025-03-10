import {
    type BankConnection,
    BankConnectionStatus,
    SyncStatus,
} from '@prisma/client';
import { prisma } from '@/server/db';

/**
 * Retrieves bank connections that need to be synchronized with financial institutions.
 * 
 * This function identifies bank connections that require data synchronization based on
 * specific criteria, making it ideal for scheduled jobs and automated sync processes.
 * It implements an intelligent prioritization strategy that focuses on connections that:
 * 
 * 1. Have never been synced before (new connections)
 * 2. Haven't been synced in the last 12 hours (stale connections)
 * 3. Are explicitly scheduled for synchronization
 * 
 * Connections in ERROR status are excluded to prevent repeated failed attempts.
 * Results are ordered by sync age (oldest first) and limited to batches of 50 to
 * manage system load and API rate limits.
 * 
 * @returns A Promise resolving to an array of BankConnection objects that need synchronization
 * 
 * @example
 * ```typescript
 * // In a scheduled sync job
 * export async function syncBankConnectionsJob() {
 *   const connectionsToSync = await getConnectionsForSync();
 *   console.info(`Found ${connectionsToSync.length} connections to sync`);
 *   
 *   // Process each connection
 *   for (const connection of connectionsToSync) {
 *     try {
 *       await updateConnectionSyncStatus(connection.id, SyncStatus.SYNCING);
 *       await syncConnectionData(connection);
 *       await updateConnectionSyncStatus(connection.id, SyncStatus.SUCCESS);
 *     } catch (error) {
 *       await updateConnectionSyncStatus(
 *         connection.id, 
 *         SyncStatus.FAILED, 
 *         error.message
 *       );
 *     }
 *   }
 * }
 * 
 * // To manually trigger a sync for specific user connections
 * async function scheduleUserConnectionsSync(userId: string) {
 *   // First mark connections as scheduled
 *   await prisma.bankConnection.updateMany({
 *     where: { userId },
 *     data: { syncStatus: SyncStatus.SCHEDULED }
 *   });
 *   
 *   // Then run the sync process which will pick them up
 *   const connections = await getConnectionsForSync();
 *   // process connections...
 * }
 * ```
 */
export async function getConnectionsForSync(): Promise<BankConnection[]> {
    const connections = await prisma.bankConnection.findMany({
        orderBy: {
            lastSyncedAt: 'asc', // Sync oldest first
        },
        take: 50, // Process in batches of 50
        where: {
            OR: [
                { lastSyncedAt: null }, // Never synced
                {
                    lastSyncedAt: {
                        // Last sync was more than 12 hours ago
                        lt: new Date(Date.now() - 12 * 60 * 60 * 1000),
                    },
                },
                { syncStatus: SyncStatus.SCHEDULED }, // Explicitly scheduled for sync
            ],
            status: {
                not: BankConnectionStatus.ERROR,
            },
        },
    });

    return connections;
}
