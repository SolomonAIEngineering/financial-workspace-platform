'use client';

import { useEffect, useState } from 'react';

import { BankAccount } from '@/server/types/prisma';
// Import from the existing account-connection directory
import { BankConnections } from '@/components/bank-connection/bank-connections-list';
import { ManualAccounts } from '@/components/bank-account/manual-accounts';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/react';

// Import the BankAccount interface from bank-connection to avoid conflicts
// Import from the existing account-connection directory

/**
 * Represents a group of accounts from the same financial institution. Used to
 * organize accounts by bank in the UI.
 *
 * @property {string} id - Unique identifier for the financial institution
 * @property {string} name - Name of the financial institution
 * @property {string} [logo] - URL to the financial institution's logo
 * @property {string} provider - The provider used to connect to this bank
 *   (e.g., "plaid", "teller")
 * @property {string} status - Connection status (e.g., "active",
 *   "requires_attention")
 * @property {Date} [expires_at] - When the bank connection will expire
 * @property {BankAccount[]} accounts - Array of bank accounts associated with
 *   this institution
 * @interface BankGroup
 */
export interface BankGroup {
  id: string;
  name: string;
  logo?: string;
  provider: string;
  status: string;
  expires_at?: Date;
  accounts: BankAccount[];
}

/**
 * Props for the BankConnections component
 *
 * @property {BankGroup[]} data - Array of bank groups to display
 * @interface BankConnectionsProps
 */
export interface BankConnectionsProps {
  data: BankGroup[];
}

/**
 * Props for the ManualAccounts component
 *
 * @property {BankAccount[]} data - Array of manual accounts to display
 * @interface ManualAccountsProps
 */
export interface ManualAccountsProps {
  data: BankAccount[];
}

// Create a temporary interface to match the API response
interface APIBankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  enabled: boolean;
  manual: boolean;
  bank?: {
    id: string;
    name: string;
    logo?: string;
    provider: string;
    status: string;
    expires_at?: Date;
  } | null;
}

/**
 * BankAccountList Component
 *
 * This component manages the fetching and display of all bank accounts. It:
 *
 * 1. Fetches bank accounts from the server using tRPC
 * 2. Separates accounts into connected bank accounts and manual accounts
 * 3. Groups connected accounts by their financial institution
 * 4. Handles loading and error states
 * 5. Renders the accounts using BankConnections and ManualAccounts components
 *
 * @example
 *   <BankAccountList />;
 *
 * @returns {JSX.Element} The rendered component displaying all bank accounts
 * @component
 */
export function BankAccountList() {
  const [bankGroups, setBankGroups] = useState<BankGroup[]>([]);
  const [manualAccounts, setManualAccounts] = useState<BankAccount[]>([]);
  const trpc = useTRPC();

  // Fetch team bank accounts using tRPC
  const {
    data: bankAccounts,
    isLoading,
    error,
  } = useQuery(trpc.bankAccounts.getTeamBankAccounts.queryOptions({}));

  useEffect(() => {
    if (bankAccounts) {
      // Filter out manual accounts
      const manualAcc = bankAccounts.filter((account: any) => account.manual);
      setManualAccounts(manualAcc as any);

      // Group accounts by bank
      const bankMap: Record<string, BankGroup> = {};

      // Group accounts by bank
      for (const item of bankAccounts as any[]) {
        // Skip if bank is null or undefined
        if (!item.bank) continue;

        const bankId = item.bank.id;

        if (!bankId) {
          continue;
        }

        if (!bankMap[bankId]) {
          bankMap[bankId] = {
            id: bankId,
            name: item.bank.name || 'Unknown Bank',
            logo: item.bank.logo,
            provider: item.bank.provider,
            status: item.bank.status,
            expires_at: item.bank.expires_at,
            accounts: [],
          };
        }

        // Add this account to the bank group
        bankMap[bankId].accounts.push({
          id: item.id,
          name: item.name,
          type: item.type,
          balance: item.balance || 0,
          currency: item.currency || 'USD',
          enabled: item.enabled,
        } as any);
      }

      // Convert the map to an array
      const result = Object.values(bankMap);

      // Sort accounts by enabled status
      for (const bank of result) {
        if (Array.isArray(bank.accounts)) {
          bank.accounts.sort((a, b) => Number(b.enabled) - Number(a.enabled));
        }
      }

      setBankGroups(result);
    }
  }, [bankAccounts]);

  // Display an error message if there was a problem fetching accounts
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">
          Error loading bank accounts. Please try again later.
        </p>
      </div>
    );
  }

  // Show loading state while fetching accounts
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Loading bank accounts...</p>
      </div>
    );
  }

  return (
    <>
      <BankConnections data={bankGroups} />
      <ManualAccounts data={manualAccounts} />
    </>
  );
}
