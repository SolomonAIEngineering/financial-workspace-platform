'use client';

import React, { useState } from 'react';

import { Button } from '@/registry/default/potion-ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Props for the SyncTransactionsButton component
 *
 * @property {string} connectionId - The unique identifier of the bank
 *   connection to sync
 * @property {() => void} [onSyncStart] - Optional callback function to execute
 *   when sync starts
 * @property {() => void} [onSyncComplete] - Optional callback function to
 *   execute when sync completes
 * @interface SyncTransactionsButtonProps
 */
interface SyncTransactionsButtonProps {
  connectionId: string;
  onSyncStart?: () => void;
  onSyncComplete?: () => void;
}

/**
 * SyncTransactionsButton Component
 *
 * A button component that initiates a manual synchronization of transactions
 * for a specific bank connection. The button shows a loading state while
 * syncing and displays a success/error toast message upon completion.
 *
 * This component handles the complete sync lifecycle:
 *
 * 1. Shows a loading state during the sync process
 * 2. Calls the API to trigger the sync job
 * 3. Notifies the user of success or failure
 * 4. Invokes callback functions at appropriate points for parent components to
 *    react
 *
 * @example
 *   <SyncTransactionsButton
 *     connectionId="conn_123456"
 *     onSyncStart={() => setIsSyncing(true)}
 *     onSyncComplete={() => setIsSyncing(false)}
 *   />;
 *
 * @param {SyncTransactionsButtonProps} props - The component props
 * @param {string} props.connectionId - ID of the bank connection to sync
 * @param {() => void} [props.onSyncStart] - Callback when sync starts
 * @param {() => void} [props.onSyncComplete] - Callback when sync completes
 * @returns {JSX.Element} A button that initiates transaction syncing
 * @component
 */
export function SyncTransactionsButton({
  connectionId,
  onSyncStart,
  onSyncComplete,
}: SyncTransactionsButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Handles the sync action when the button is clicked
   *
   * This function:
   *
   * 1. Sets the local syncing state
   * 2. Invokes the onSyncStart callback if provided
   * 3. Makes the API call to trigger the sync job
   * 4. Shows a success toast if successful
   * 5. Shows an error toast if the sync fails
   * 6. Resets the syncing state
   * 7. Invokes the onSyncComplete callback if provided
   *
   * @async
   */
  const handleSync = async () => {
    try {
      setIsSyncing(true);
      if (onSyncStart) onSyncStart();

      // In a real implementation, this would call an API endpoint
      // to trigger a background job for syncing transactions
      // Example: await api.bankAccounts.syncTransactions.mutate({ connectionId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('Transactions synced successfully');
    } catch (error) {
      console.error('Failed to sync transactions:', error);
      toast.error('Failed to sync transactions');
    } finally {
      setIsSyncing(false);
      if (onSyncComplete) onSyncComplete();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isSyncing}
      onClick={handleSync}
    >
      <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      <span className="ml-2">{isSyncing ? 'Syncing...' : 'Sync'}</span>
    </Button>
  );
}
