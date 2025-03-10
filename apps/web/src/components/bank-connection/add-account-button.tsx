'use client';

import { Button } from '@/registry/default/potion-ui/button';
import { PlusCircle } from 'lucide-react';
import React from 'react';
import { useConnectParams } from '@/lib/hooks/use-connect-params';

/**
 * AddAccountButton Component
 *
 * A button component that initiates the bank account connection flow. When
 * clicked, it sets the URL parameters to open the ConnectTransactionsModal,
 * which allows users to search for and connect to their financial
 * institutions.
 *
 * This component uses the useConnectParams hook to manage URL query parameters,
 * which enables the modal state to persist across page refreshes and allows for
 * deep linking to specific steps in the connection flow.
 *
 * @example
 *   // Used in the ConnectedAccounts component
 *   <CardFooter className="flex justify-between">
 *     <div />
 *     <AddAccountButton />
 *   </CardFooter>;
 *
 * @example
 *   // Used when no accounts exist
 *   <div className="text-center">
 *     <p>No accounts found</p>
 *     <AddAccountButton />
 *   </div>;
 *
 * @returns {JSX.Element} A button with a plus icon and "Add Account" text
 * @component
 */
export function AddAccountButton() {
  const { setParams } = useConnectParams();

  /**
   * Handler for opening the connect modal Sets the 'step' URL parameter to
   * 'connect', which triggers the ConnectTransactionsModal to open
   */
  const handleOpenConnectModal = async () => {
    await setParams({ step: 'connect' });
  };

  return (
    <Button
      variant="outline"
      size="xs"
      className="gap-1.5"
      onClick={handleOpenConnectModal}
    >
      <PlusCircle className="h-4 w-4" />
      <span>Add Account</span>
    </Button>
  );
}
