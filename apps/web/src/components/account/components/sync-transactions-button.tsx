import { useState } from 'react';

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/registry/default/potion-ui/button';

/** Button component that allows users to manually trigger a transaction sync */
export function SyncTransactionsButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  // Trigger a manual sync
  const syncTransactions = async () => {
    try {
      setIsSyncing(true);

      // Call the API endpoint to trigger sync
      const response = await fetch('/api/sync-transactions', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.message || 'Failed to sync transactions');
      }

      // Show success notification
      toast.success('Transaction sync started', {
        description: 'Your transactions will be updated in the background.',
      });
    } catch (error) {
      console.error('Error syncing transactions:', error);

      // Show error notification
      toast.error('Failed to sync transactions', {
        description:
          error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      size="xs"
      variant="outline"
      disabled={isSyncing}
      onClick={syncTransactions}
    >
      {isSyncing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Syncing...
        </>
      ) : (
        'Sync Transactions'
      )}
    </Button>
  );
}
