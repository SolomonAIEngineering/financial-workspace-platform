'use client';

import { AccordionContent, AccordionTrigger } from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/registry/default/potion-ui/tooltip';

import { AlertCircle } from 'lucide-react';
import { BankLogo } from '../bank-account/bank-logo';
import { ReconnectProviderButton } from './reconnect-provider-button';
import { SyncTransactionsButton } from './sync-transactions-button';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';
import { useState } from 'react';

// Constants for displaying connection states
const WARNING_DAYS = 7; // Show warning when connection expires in 7 days
const ERROR_DAYS = 2; // Show error when connection expires in 2 days
const DISPLAY_DAYS = 14; // Show expiration notice within 14 days

// Custom interface for bank connection with accounts included
export interface BankConnectionWithAccounts {
  id: string;
  name: string;
  logo?: string | null;
  provider: string;
  status: string;
  expires_at?: Date | null;
  accounts: BankAccount[];
}

// Define the BankAccount interface if not already defined elsewhere
export interface BankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  enabled: boolean;
}

/** Utility function to determine the connection status based on expiration date */
export function connectionStatus(connection: any) {
  const warning =
    connection.expires_at &&
    differenceInDays(new Date(connection.expires_at), new Date()) <=
      WARNING_DAYS;

  const error =
    connection.expires_at &&
    differenceInDays(new Date(connection.expires_at), new Date()) <= ERROR_DAYS;

  const expired =
    connection.expires_at &&
    differenceInDays(new Date(connection.expires_at), new Date()) <= 0;

  const show =
    connection.expires_at &&
    differenceInDays(new Date(connection.expires_at), new Date()) <=
      DISPLAY_DAYS;

  return {
    warning,
    error,
    expired,
    show,
  };
}

/**
 * BankConnection Component
 *
 * Displays a bank connection with its connection status and accounts.
 */
export function BankAccountConnection({
  connection,
}: {
  connection: any; // Use type assertion to bypass type checks
}) {
  const [isSyncing, setIsSyncing] = useState(false);

  // get bank account tied to this connection

  return (
    <>
      <AccordionTrigger className="py-4 hover:no-underline">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-4">
            <BankLogo src={connection.logo} alt={connection.name} />
            <div>
              <h3 className="text-sm font-medium">{connection.name}</h3>
              <div className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <ConnectionState
                        connection={connection}
                        isSyncing={isSyncing}
                      />
                    </div>
                  </TooltipTrigger>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <SyncTransactionsButton
              connectionId={connection.id}
              onSyncStart={() => setIsSyncing(true)}
              onSyncComplete={() => setIsSyncing(false)}
            />
            <ReconnectProviderButton
              connection={connection}
              disabled={isSyncing}
            />
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="pt-1 pb-4">
        <div className="ml-4 space-y-3 pl-6">
          {connection.accounts.map((account) => (
            <div
              key={account.id}
              className={cn(
                'flex items-center justify-between rounded-md px-4 py-2',
                !account.enabled && 'opacity-50'
              )}
            >
              <div className="space-y-1">
                <h4 className="text-sm font-medium">{account.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {account.type} •{' '}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: account.currency,
                  }).format(account.balance)}
                </p>
              </div>

              {!account.enabled ? (
                <span className="text-xs text-muted-foreground">Disabled</span>
              ) : null}
            </div>
          ))}
        </div>
      </AccordionContent>
    </>
  );
}

/**
 * ConnectionState Component
 *
 * Displays the current state of a connection (syncing, error, expiring, etc.)
 */
function ConnectionState({
  connection,
  isSyncing,
}: {
  connection: any;
  isSyncing: boolean;
}) {
  const { show, expired } = connectionStatus(connection);

  if (isSyncing) {
    return (
      <div className="flex items-center space-x-1 text-xs font-normal">
        <span>Syncing...</span>
      </div>
    );
  }

  if (connection.status === 'disconnected') {
    return (
      <>
        <div className="flex items-center space-x-1 text-xs font-normal text-[#c33839]">
          <AlertCircle className="h-3 w-3" />
          <span>Connection issue</span>
        </div>

        <TooltipContent
          className="max-w-[430px] px-3 py-1.5 text-xs"
          sideOffset={20}
          side="left"
        >
          Please reconnect to restore the connection to a good state.
        </TooltipContent>
      </>
    );
  }

  if (show) {
    return (
      <>
        <div className="flex items-center space-x-1 text-xs font-normal text-[#FFD02B]">
          <AlertCircle className="h-3 w-3" />
          <span>Connection expires soon</span>
        </div>

        {connection.expires_at && (
          <TooltipContent
            className="max-w-[430px] px-3 py-1.5 text-xs"
            sideOffset={20}
            side="left"
          >
            We only have access to your bank for another{' '}
            {differenceInDays(new Date(connection.expires_at), new Date())}{' '}
            days. Please update the connection to keep everything in sync.
          </TooltipContent>
        )}
      </>
    );
  }

  return (
    <div className="text-xs text-muted-foreground">
      <span className="capitalize">{connection.provider}</span> •{' '}
      <span className="capitalize">{connection.status}</span>
    </div>
  );
}
