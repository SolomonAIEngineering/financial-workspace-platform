'use client';

import { BankConnection, BankConnectionStatus } from '@/server/types/prisma';

import { Button } from '@/registry/default/potion-ui/button';
import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { connectionStatus } from './bank-connection';
import { useConnectParams } from '@/hooks/use-connect-params';

interface ReconnectProviderButtonProps {
  connection: BankConnection;
  disabled?: boolean;
}

/**
 * ReconnectProviderButton Component
 *
 * Button that allows users to reconnect a bank connection that is expiring,
 * disconnected, or has an error.
 */
export function ReconnectProviderButton({
  connection,
  disabled = false,
}: ReconnectProviderButtonProps) {
  const { setParams } = useConnectParams();
  const { show, expired } = connectionStatus(connection);

  // Only show the button if the connection needs attention
  if (
    !show &&
    connection.status !== BankConnectionStatus.DISCONNECTED &&
    connection.status !== BankConnectionStatus.ERROR
  ) {
    return null;
  }

  const handleReconnect = async () => {
    // Set URL parameters to open the connection modal with the right provider
    await setParams({
      step: 'connect',
      provider: connection.oauthSupported ? 'plaid' : 'teller',
      institution_id: connection.institutionId,
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={handleReconnect}
      className={expired ? 'border-red-500 text-red-500 hover:bg-red-50' : ''}
    >
      <RefreshCcw className="mr-2 h-4 w-4" />
      Reconnect
    </Button>
  );
}
