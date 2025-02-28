/**
 * Plaid Link Component
 *
 * This component provides an interface for connecting to Plaid Link. In a real
 * implementation, you would need to:
 *
 * 1. Install the react-plaid-link package: pnpm add react-plaid-link
 * 2. Properly configure Plaid with your API keys
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type PlaidLinkError,
  type PlaidLinkOnExit,
  type PlaidLinkOnExitMetadata,
  type PlaidLinkOnSuccessMetadata,
  type PlaidLinkOptionsWithLinkToken,
  usePlaidLink,
} from 'react-plaid-link';

import { toast } from 'sonner';

// In a real implementation, you would import the real PlaidLink component
// import { PlaidLink } from 'react-plaid-link';

interface PlaidIntegrationProps {
  linkToken: string;
  onSuccess: (
    publicToken: string,
    metadata: PlaidLinkOnSuccessMetadata
  ) => void;
  autoOpen?: boolean;
  buttonText?: string;
  isLoading?: boolean;
  loadingText?: string;
  onExit?: () => void;
}

// This is a mock for the PlaidLink component
function MockPlaidLink({ children, token, onExit, onSuccess }: PlaidLinkProps) {
  const handleClick = () => {
    // In a real implementation, this would open the Plaid Link modal
    // Here we mock a successful connection after a small delay
    setTimeout(() => {
      // Generate a fake public token
      const publicToken = `public-sandbox-${Math.random().toString(36).slice(2, 10)}`;

      // Generate fake metadata that mimics what Plaid would return
      const metadata = {
        accounts: [
          {
            id: `acc-${Math.random().toString(36).slice(2, 10)}`,
            mask: '1234',
            name: 'Chase Checking',
            subtype: 'checking',
            type: 'depository',
          },
        ],
        institution: {
          institution_id: 'ins_3',
          name: 'Chase',
        },
        link_session_id: `session-${Math.random().toString(36).slice(2, 10)}`,
      };

      // Call the success callback
      onSuccess(publicToken, metadata);
    }, 2000);
  };

  return (
    <button
      className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

// Mock implementation for demonstration purposes
interface PlaidLinkProps {
  children: React.ReactNode;
  token: string;
  onExit: () => void;
  onSuccess: (publicToken: string, metadata: any) => void;
}

/** Component to integrate with Plaid Link */
export function PlaidIntegration({
  autoOpen = false,
  buttonText = 'Connect Bank',
  isLoading = false,
  linkToken,
  loadingText = 'Connecting...',
  onExit,
  onSuccess,
}: PlaidIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle successful connection
  const handleSuccess = useCallback(
    (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
      setIsConnecting(false);
      onSuccess(publicToken, metadata);
    },
    [onSuccess]
  );

  // Handle exit from Plaid Link
  const handleExit: PlaidLinkOnExit = useCallback(
    (error: PlaidLinkError | null, metadata?: PlaidLinkOnExitMetadata) => {
      setIsConnecting(false);

      if (error) {
        toast.error(`Error: ${error.error_code || 'Connection failed'}`);
      } else if (metadata && metadata.status === 'requires_credentials') {
        toast.error(
          'Please enter your credentials to connect your bank account'
        );
      } else {
        toast.error('Bank connection was canceled');
      }
      // Call the onExit callback if provided
      if (onExit) {
        onExit();
      }
    },
    [onExit]
  );

  // Configure Plaid Link
  const config: PlaidLinkOptionsWithLinkToken = {
    token: linkToken,
    onExit: handleExit,
    onSuccess: handleSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  // Handler for button click
  const handleClick = useCallback(() => {
    if (ready) {
      setIsConnecting(true);
      open();
    }
  }, [ready, open]);

  // Auto-open Plaid Link when autoOpen is true and the component is ready
  useEffect(() => {
    if (autoOpen && ready && !isConnecting) {
      setIsConnecting(true);
      open();
    }
  }, [autoOpen, ready, open, isConnecting]);

  return (
    <button
      className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      disabled={!ready || isLoading || isConnecting}
      onClick={handleClick}
    >
      {isLoading || isConnecting ? loadingText : buttonText}
    </button>
  );
}
