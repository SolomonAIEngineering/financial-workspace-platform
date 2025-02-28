/**
 * Bank Transactions Tab
 *
 * This component displays a list of bank transactions with filtering and search
 * capabilities.
 */

'use client';

import { useEffect, useState } from 'react';

import { ArrowUpDown, Calendar, Filter, Search } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/registry/default/potion-ui/button';
import { Input } from '@/registry/default/potion-ui/input';
import { api } from '@/trpc/react';

interface BankTransactionsProps {
  userId: string;
}

interface Transaction {
  id: string;
  accountId: string;
  accountName: string;
  amount: number;
  category: string | null;
  date: Date;
  isoCurrencyCode: string;
  merchantName: string | null;
  name: string;
  pending: boolean;
}

export function BankTransactions({ userId }: BankTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>(
    '30d'
  );

  // Calculate date range based on selection
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case '7d': {
        startDate.setDate(startDate.getDate() - 7);

        break;
      }
      case '30d': {
        startDate.setDate(startDate.getDate() - 30);

        break;
      }
      case '90d': {
        startDate.setDate(startDate.getDate() - 90);

        break;
      }
      case 'all': {
        startDate = new Date(0); // Beginning of time

        break;
      }
    }

    return { endDate, startDate };
  };

  // Fetch transactions
  const {
    data,
    error: queryError,
    isLoading,
  } = api.bankAccounts.getTransactions.useQuery(
    dateRange === 'all' ? {} : getDateRange()
  );

  // Update state when data changes
  useEffect(() => {
    if (data) {
      // Map API data to match our interface
      const mappedTransactions = data.transactions.map((transaction) => ({
        id: transaction.id,
        accountId: transaction.bankAccountId,
        accountName: transaction.bankAccount?.name || 'Unknown Account',
        amount: transaction.amount,
        category: transaction.category || null,
        date: transaction.date,
        isoCurrencyCode: transaction.isoCurrencyCode || 'USD',
        merchantName: transaction.merchantName || null,
        name: transaction.name,
        pending: transaction.pending || false,
      }));
      setTransactions(mappedTransactions);
    }
  }, [data]);

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      setError('Failed to load transactions');
      console.error(queryError);
    }
  }, [queryError]);

  // Format currency
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      currency,
      style: 'currency',
    }).format(amount);
  };

  // Get unique categories and accounts for filters
  const categories = [
    'all',
    ...new Set(
      transactions.map((t) => t.category || 'Uncategorized').filter(Boolean)
    ),
  ];
  const accounts = ['all', ...new Set(transactions.map((t) => t.accountName))];

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter((transaction) => {
      // Search term filter
      const searchMatch =
        searchTerm === '' ||
        transaction?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction?.merchantName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Category filter
      const categoryMatch =
        categoryFilter === 'all' ||
        transaction.category === categoryFilter ||
        (categoryFilter === 'Uncategorized' && !transaction.category);

      // Account filter
      const accountMatch =
        accountFilter === 'all' || transaction.accountName === accountFilter;

      return searchMatch && categoryMatch && accountMatch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-xl font-bold tracking-tight">Transactions</h3>
            <p className="text-muted-foreground">
              View and manage your bank transactions
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4 flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions..."
            />
          </div>

          {/* Date Range Filter */}
          <Select
            value={dateRange}
            onValueChange={(value) => setDateRange(value as any)}
          >
            <SelectTrigger className="w-[130px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Account Filter */}
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account} value={account}>
                  {account === 'all' ? 'All Accounts' : account}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Direction */}
          <Button size="xs" variant="outline" onClick={toggleSortDirection}>
            <ArrowUpDown className="mr-2 h-4 w-4" />
            {sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
