/**
 * Bank Accounts Tab
 *
 * This component displays a list of connected bank accounts with their details
 * and allows users to manage them.
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

import { api } from '@/trpc/react';

interface BankAccount {
  id: string;
  availableBalance: number | null;
  currentBalance: number | null;
  institution: string;
  isoCurrencyCode: string;
  mask: string;
  name: string;
  type: string;
  connectedAt?: Date;
  institutionColor?: string | null;
  institutionLogo?: string | null;
  lastUpdated?: Date;
  subtype?: string | null;
}

interface BankAccountsListProps {
  userId: string;
}

export function BankAccountsList({ userId }: BankAccountsListProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Fetch bank accounts
  const {
    data,
    error: queryError,
    isLoading,
  } = api.bankAccounts.getAll.useQuery();

  // Update state when data changes
  useEffect(() => {
    if (data) {
      // Map API data to match our interface
      const mappedAccounts = data.map((account: any) => {
        // Create the mapped account with known properties
        const mappedAccount: BankAccount = {
          id: account.id,
          availableBalance: account.availableBalance,
          currentBalance: account.currentBalance,
          institution: account.bankConnection?.institutionName || '',
          isoCurrencyCode: account.isoCurrencyCode || 'USD',
          lastUpdated: account.createdAt || new Date(),
          mask: account.mask || '',
          name: account.name || '',
          subtype: account.subtype || null,
          type: account.type,
          institutionLogo: account.bankConnection?.logo || null,
          institutionColor: account.bankConnection?.primaryColor || null,
        };

        return mappedAccount;
      });
      setAccounts(mappedAccounts);
    }
  }, [data]);

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      setError('Failed to load bank accounts');
      console.error(queryError);
    }
  }, [queryError]);

  // Filter accounts based on selected filter
  const filteredAccounts = accounts.filter((account) => {
    if (filter === 'all') return true;

    return account.type.toLowerCase() === filter.toLowerCase();
  });

  // Format currency
  const formatCurrency = (amount: number | null, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      currency,
      style: 'currency',
    }).format(amount || 0);
  };

  // Get account types for filter
  const accountTypes = [
    'all',
    ...new Set(accounts.map((account) => account.type.toLowerCase())),
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-xl font-bold tracking-tight">Bank Accounts</h3>
            <p className="text-muted-foreground">
              View and manage your connected bank accounts
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Filter by:</span>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Account Type" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
