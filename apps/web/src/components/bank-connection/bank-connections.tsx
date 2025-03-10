/**
 * Component for managing bank account connections
 *
 * This component allows users to connect their bank accounts using Plaid
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { BankAccount } from '@/server/types/index';
import { PlaidIntegration } from '../account/components/plaid-link';
import { SyncTransactionsButton } from './sync-transactions-button';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

interface BankConnectionsProps {
  userId: string;
}

export function BankConnections({ userId }: BankConnectionsProps) {
  const [isLinkLoading, setIsLinkLoading] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [shouldOpenPlaid, setShouldOpenPlaid] = useState(false);

  // Fetch connected bank accounts
  const {
    data,
    error: queryError,
    isLoading,
    refetch,
  } = api.bankAccounts.getAll.useQuery();

  // Update state when data changes
  useEffect(() => {
    if (data) {
      setBankAccounts(data as BankAccount[]);
    }
  }, [data]);

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      setError('Failed to load bank accounts');
      console.error(queryError);
    }
  }, [queryError]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Reset state when component unmounts
      setLinkToken(null);
      setShouldOpenPlaid(false);
    };
  }, []);

  // Create Plaid link token
  const createLinkTokenMutation = api.bankAccounts.createLinkToken.useMutation({
    onError: (err) => {
      setIsLinkLoading(false);
      setShouldOpenPlaid(false);
      setError('Failed to create connection link');
      console.error(err);
    },
    onSuccess: (token) => {
      setLinkToken(token);
      setIsLinkLoading(false);
      // Set flag to open Plaid immediately after token is received
      setShouldOpenPlaid(true);
    },
  });

  // Exchange public token for access token
  const exchangeTokenMutation =
    api.bankAccounts.exchangePublicToken.useMutation({
      onError: (err) => {
        toast.error('Failed to connect bank account');
        console.error(err);
        // Reset state on error
        setShouldOpenPlaid(false);
      },
      onSuccess: async () => {
        toast.success('Bank account connected successfully');
        // Reset state on success
        setLinkToken(null);
        setShouldOpenPlaid(false);
        await refetch();
      },
    });

  // Disconnect bank account
  const disconnectMutation = api.bankAccounts.disconnect.useMutation({
    onError: (err) => {
      toast.error('Failed to disconnect bank account');
      console.error(err);
    },
    onSuccess: async () => {
      toast.success('Bank account disconnected successfully');
      await refetch();
    },
  });

  // Function to start bank connection process
  const handleConnectBank = useCallback(() => {
    setIsLinkLoading(true);
    setError(null);
    createLinkTokenMutation.mutate();
  }, [createLinkTokenMutation]);

  // Handle successful Plaid connection
  const handlePlaidSuccess = useCallback(
    (publicToken: string, metadata: any) => {
      exchangeTokenMutation.mutate({
        metadata,
        publicToken,
      });
    },
    [exchangeTokenMutation]
  );

  // Handle Plaid exit (when user closes the Plaid modal)
  const handlePlaidExit = useCallback(() => {
    setShouldOpenPlaid(false);
    // We keep the link token in case the user wants to try again
  }, []);

  // Handle disconnecting a bank account
  const handleDisconnect = (accountId: string) => {
    disconnectMutation.mutate({ accountId });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Bank Connections</h3>
          <p className="text-sm text-muted-foreground">
            Connect your financial institutions to automatically import
            transactions
          </p>
        </div>
        <div className="flex space-x-2">
          <SyncTransactionsButton connectionId={''} />
          {linkToken ? (
            <PlaidIntegration
              onExit={handlePlaidExit}
              onSuccess={handlePlaidSuccess}
              autoOpen={shouldOpenPlaid}
              isLoading={isLinkLoading}
              linkToken={linkToken}
            />
          ) : (
            <button
              className="ml-auto flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              disabled={isLinkLoading}
              onClick={handleConnectBank}
            >
              {isLinkLoading ? 'Connecting...' : 'Connect Bank'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="py-6 text-center text-muted-foreground">
          Loading bank connections...
        </div>
      ) : bankAccounts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h4 className="mb-2 text-lg font-medium">No bank connections</h4>
          <p className="mb-4 text-sm text-muted-foreground">
            Connect your first bank account to start tracking your finances
          </p>
          {!linkToken && (
            <button
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              disabled={isLinkLoading}
              onClick={handleConnectBank}
            >
              {isLinkLoading ? 'Connecting...' : 'Connect Your First Bank'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between rounded-md border p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{account.name}</h4>
                  <Badge variant="outline">{account.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {account.displayName} •••• {account.mask}
                </p>
              </div>
              <button
                className="h-8 px-2 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => handleDisconnect(account.id)}
              >
                Disconnect
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
