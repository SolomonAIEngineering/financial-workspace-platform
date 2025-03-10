'use client';

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React, { Suspense } from 'react';

import { AddAccountButton } from './add-account-button';
import { BankAccountList } from '../bank-account/bank-account-list';
import { BankAccountListSkeleton } from '../bank-account/bank-account-list-skeleton';

/**
 * ConnectedAccounts Component
 *
 * The main container component for the bank account management interface. This
 * component serves as the entry point for the account management system and
 * orchestrates the display of all connected bank accounts.
 *
 * Key features:
 *
 * 1. Provides a consistent card layout with appropriate header and footer
 * 2. Uses React Suspense for handling loading states
 * 3. Renders the BankAccountList for displaying connected accounts
 * 4. Includes an AddAccountButton for initiating new connections
 *
 * The component is designed to be used in settings pages or dashboard areas
 * where users need to manage their financial connections.
 *
 * @example
 *   // Used in a settings page
 *   <SettingsLayout>
 *     <ConnectedAccounts />
 *   </SettingsLayout>;
 *
 * @example
 *   // Used in a dashboard panel
 *   <DashboardPanel>
 *     <ConnectedAccounts />
 *   </DashboardPanel>;
 *
 * @returns {JSX.Element} A card containing the bank account management
 *   interface
 * @component
 */
export function ConnectedAccounts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Manage bank accounts, update connections or connect new ones.
        </CardDescription>
      </CardHeader>

      <Suspense fallback={<BankAccountListSkeleton />}>
        <BankAccountList />
      </Suspense>

      <CardFooter className="flex justify-between">
        <div />
        <AddAccountButton />
      </CardFooter>
    </Card>
  );
}
