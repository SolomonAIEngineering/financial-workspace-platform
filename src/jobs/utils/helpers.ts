import {
  type BankConnection,
  BankConnectionStatus,
  SyncStatus,
} from '@prisma/client';
import { format, subDays } from 'date-fns';

import { prisma } from '@/server/db';

/**
 * Get connections that need to be synced This can be used by scheduled jobs to
 * identify connections that need refreshing
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

/** Update a connection's sync status */
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

/** Format a date for Plaid API */
export function formatDateForPlaid(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get start and end dates for transaction sync By default, fetches last 30 days
 * of transactions
 */
export function getTransactionDateRange(days = 30): {
  endDate: string;
  startDate: string;
} {
  const endDate = new Date();
  const startDate = subDays(endDate, days);

  return {
    endDate: formatDateForPlaid(endDate),
    startDate: formatDateForPlaid(startDate),
  };
}

/** Chunk an array into smaller arrays Used for batch processing */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunked: T[][] = [];
  let index = 0;

  while (index < array.length) {
    chunked.push(array.slice(index, index + size));
    index += size;
  }

  return chunked;
}
