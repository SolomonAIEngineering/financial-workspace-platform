'use client';

import { Button } from '@/registry/default/potion-ui/button';
import { ManualAccountsProps } from './bank-account-list';
import React from 'react';
import { useConnectParams } from '@/lib/hooks/use-connect-params';

/**
 * ManualAccounts Component
 *
 * A component that displays manually added bank accounts and provides options
 * to manage these accounts. Unlike connected accounts, manual accounts are
 * created and maintained by the user (not synced from a financial
 * institution).
 *
 * Features:
 *
 * 1. Displays a list of manual accounts with their details
 * 2. Provides options to edit or delete each account
 * 3. Includes a button to add new manual accounts
 * 4. Returns null if no manual accounts exist
 *
 * This component uses the useConnectParams hook to initiate the manual account
 * creation flow via URL parameters.
 *
 * @example
 *   // With manual accounts
 *   <ManualAccounts data={manualAccounts} />;
 *
 * @example
 *   // Component will return null when no manual accounts exist
 *   <ManualAccounts data={[]} />;
 *
 * @param {ManualAccountsProps} props - The component props
 * @param {BankAccount[]} props.data - Array of manual bank accounts to display
 * @returns {JSX.Element | null} The rendered component or null if no manual
 *   accounts exist
 * @component
 */
export function ManualAccounts({ data }: ManualAccountsProps) {
  const { setParams } = useConnectParams();

  // If there are no manual accounts, don't render anything
  if (data.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-4 px-6">
      <div>
        <h3 className="text-base font-medium">Manual Accounts</h3>
        <p className="text-sm text-muted-foreground">
          Accounts you've added manually to track your finances
        </p>
      </div>

      <div className="space-y-3">
        {data.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between rounded-md border p-4"
          >
            <div className="space-y-1">
              <h4 className="font-medium">{account.name}</h4>
              <p className="text-sm text-muted-foreground">
                {account.type} •{' '}
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: account.isoCurrencyCode || 'USD',
                }).format(account.currentBalance || 0)}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="outline" size="sm">
                Delete
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setParams({ step: 'import' })}
        >
          Add Manual Account
        </Button>
      </div>
    </div>
  );
}
