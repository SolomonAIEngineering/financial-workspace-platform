import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { ColumnSchema } from '../tables/transaction/schema';
import { DataTable } from '@/components/tables/transaction/data-table';
import { api } from '@/trpc/react';
import { columns } from '../tables/transaction/columns';
import { useMemo } from 'react';

/**
 * Props interface for the RecentTransactions component
 *
 * @property {boolean} [isLoading] - Optional flag indicating if parent
 *   component is in loading state
 * @interface RecentTransactionsProps
 */
interface RecentTransactionsProps {
  isLoading?: boolean;
}

/**
 * RecentTransactions component displays a table of most recent financial
 * transactions with filtering and sorting capabilities
 *
 * @param {RecentTransactionsProps} props - Component props
 * @returns {JSX.Element} Card containing transaction data table
 * @component
 */
export function RecentTransactions({
  isLoading: initialLoading,
}: RecentTransactionsProps) {
  // Fetch transactions directly with useQuery
  const {
    data,
    isLoading: apiLoading,
    refetch,
  } = api.transactions.getTransactions.useQuery(
    {
      page: 1,
      limit: 10,
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  // Determine if we're loading
  const isLoading = initialLoading || apiLoading;

  /**
   * Transform API transaction data to the format expected by the DataTable
   * component
   *
   * @returns {ColumnSchema[]} Formatted transaction data
   */
  const transactions = useMemo(() => {
    return (
      (data?.transactions.map((transaction) => ({
        ...transaction,
        currency: transaction.isoCurrencyCode || 'USD', // Add required currency field
        bankAccountName: transaction.bankAccount?.name,
        // Map any other required fields
      })) as ColumnSchema[]) || []
    );
  }, [data]);

  return (
    <Card className="rounded-xl border-0 bg-white shadow-md dark:bg-black">
      <CardHeader className="border-b border-gray-100 pb-3 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-medium tracking-tight text-black dark:text-white">
            Recent Transactions
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <DataTable
          columns={columns}
          data={transactions}
          isLoading={isLoading}
          refetch={refetch}
          showFilterSidebar={false}
          defaultColumnVisibility={{
            name: true,
            amount: true,
            date: true,
            category: true,
            pending: true,
            merchantName: true,
            // Hide other columns for a simplified view
            paymentMethod: false,
            transactionType: false,
            isRecurring: false,
            bankAccountName: false,
            description: false,
            isVerified: false,
            taxDeductible: false,
            isManual: false,
            excludeFromBudget: false,
          }}
        />
      </CardContent>
    </Card>
  );
}
