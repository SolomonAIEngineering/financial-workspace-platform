'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/registry/default/potion-ui/button';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { manualSyncBankAccountAction } from '@/actions/bank/manual-sync-bank-account-action';

interface SyncStatusProps {
  bankAccount: {
    id: string;
    bankConnectionId: string;
    lastTransactionSync: Date | null;
  };
}

export function SyncStatus({ bankAccount }: SyncStatusProps) {
  const [lastSyncText, setLastSyncText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  }>({});

  useEffect(() => {
    if (!bankAccount.lastTransactionSync) {
      setLastSyncText('Never synced');
      return;
    }

    const updateSyncText = () => {
      setLastSyncText(
        `Last synced ${formatDistanceToNow(new Date(bankAccount.lastTransactionSync!))} ago`
      );
    };

    updateSyncText();
    const interval = setInterval(updateSyncText, 600_000); // Update every 10 minutes

    return () => clearInterval(interval);
  }, [bankAccount.lastTransactionSync]);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult({});

    try {
      const result = await manualSyncBankAccountAction({
        connectionId: bankAccount.bankConnectionId,
      });

      if (result?.data?.success) {
        setSyncResult({
          success: true,
          message: 'Sync started',
        });
      }
    } catch (error) {
      setSyncResult({
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${bankAccount.lastTransactionSync ? 'bg-green-500' : 'bg-amber-500'
            }`}
        />
        <span className="text-sm text-gray-600">{lastSyncText}</span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Syncing...
          </>
        ) : (
          'Sync Now'
        )}
      </Button>

      {syncResult.success === true && (
        <p className="text-sm text-green-600">{syncResult.message}</p>
      )}

      {syncResult.success === false && (
        <p className="text-sm text-red-600">{syncResult.error}</p>
      )}
    </div>
  );
}
