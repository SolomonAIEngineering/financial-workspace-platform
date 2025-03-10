'use client';

import React, { useState } from 'react';

import { Button } from '@/registry/default/potion-ui/button';
import { Loader2 } from 'lucide-react';
import { useConnectParams } from '@/lib/hooks/use-connect-params';

interface ConnectBankProviderProps {
  id: string;
  provider: string;
  openPlaid: () => void;
  availableHistory: number;
}

/**
 * ConnectBankProvider Component
 *
 * Handles provider-specific connection logic for different bank providers.
 */
export function ConnectBankProvider({
  id,
  provider,
  openPlaid,
  availableHistory,
}: ConnectBankProviderProps) {
  const { setParams } = useConnectParams();
  const [isLoading, setIsLoading] = useState(false);

  // Mock function to update institution usage
  const updateInstitutionUsage = async ({
    institutionId,
  }: {
    institutionId: string;
  }) => {
    // In a real implementation, this would call an API endpoint
    console.info('Updating institution usage:', institutionId);
    return { success: true };
  };

  const updateUsage = async () => {
    await updateInstitutionUsage({ institutionId: id });
  };

  // Render different provider components based on the provider type
  switch (provider) {
    case 'teller': {
      return (
        <TellerConnect
          id={id}
          onSelect={async () => {
            // NOTE: Wait for Teller sdk to be configured
            setTimeout(async () => {
              await setParams({ step: null });
            }, 950);

            await updateUsage();
          }}
        />
      );
    }
    case 'gocardless': {
      return (
        <GoCardLessConnect
          id={id}
          availableHistory={availableHistory}
          onSelect={async () => {
            await updateUsage();
          }}
        />
      );
    }
    case 'plaid': {
      return (
        <BankConnectButton
          onClick={async () => {
            await updateUsage();

            // Just call openPlaid directly - all the cleanup is now handled 
            // in the ConnectTransactionsModal component's handleOpenPlaid
            openPlaid();
          }}
        />
      );
    }
    default: {
      return null;
    }
  }
}

/**
 * TellerConnect Component
 *
 * Handles connection to Teller API.
 */
function TellerConnect({ id, onSelect }: { id: string; onSelect: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);

    try {
      // In a real implementation, this would initialize the Teller SDK
      console.info('Connecting to Teller for institution:', id);

      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSelect();
    } catch (error) {
      console.error('Teller connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="xs"
      disabled={isLoading}
      onClick={handleConnect}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        'Connect'
      )}
    </Button>
  );
}

/**
 * GoCardLessConnect Component
 *
 * Handles connection to GoCardless API.
 */
function GoCardLessConnect({
  id,
  availableHistory,
  onSelect,
}: {
  id: string;
  availableHistory: number;
  onSelect: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);

    try {
      // In a real implementation, this would initialize the GoCardless SDK
      console.info('Connecting to GoCardless for institution:', id);
      console.info('Available history:', availableHistory, 'months');

      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSelect();
    } catch (error) {
      console.error('GoCardless connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="xs"
      disabled={isLoading}
      onClick={handleConnect}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        'Connect'
      )}
    </Button>
  );
}

/**
 * BankConnectButton Component
 *
 * Generic button for connecting to a bank.
 */
function BankConnectButton({ onClick }: { onClick: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);

    // Just call the onClick handler directly
    onClick();

    // Reset loading state after a very brief delay
    setTimeout(() => {
      setIsLoading(false);
    }, 50);
  };

  return (
    <Button
      variant="outline"
      size="xs"
      disabled={isLoading}
      onClick={handleClick}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        'Connect'
      )}
    </Button>
  );
}
