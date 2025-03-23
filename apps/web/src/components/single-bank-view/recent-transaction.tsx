import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCallback, useMemo } from 'react';

import { ColumnSchema } from '../tables/transaction/schema';
import { DataTable } from '@/components/tables/transaction/data-table';
import { api } from '@/trpc/react';
import { columns } from '../tables/transaction/columns';

/**
 * Props interface for the RecentTransactions component
 * 
 * @interface RecentTransactionsProps
 * @property {boolean} [isLoading] - Optional flag indicating if parent component is in loading state
 */
interface RecentTransactionsProps {
    isLoading?: boolean;
}

/**
 * RecentTransactions component displays a table of most recent financial transactions
 * with filtering and sorting capabilities
 * 
 * @component
 * @param {RecentTransactionsProps} props - Component props
 * @returns {JSX.Element} Card containing transaction data table
 */
export function RecentTransactions({ isLoading: initialLoading }: RecentTransactionsProps) {
    // Fetch transactions directly with useQuery
    const { data, isLoading: apiLoading, refetch } = api.transactions.getTransactions.useQuery({
        page: 1,
        limit: 10,
    }, {
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Determine if we're loading
    const isLoading = initialLoading || apiLoading;

    /**
     * Transform API transaction data to the format expected by the DataTable component
     * 
     * @returns {ColumnSchema[]} Formatted transaction data
     */
    const transactions = useMemo(() => {
        return data?.transactions.map(transaction => ({
            ...transaction,
            currency: transaction.isoCurrencyCode || 'USD', // Add required currency field
            bankAccountName: transaction.bankAccount?.name,
            // Map any other required fields
        })) as ColumnSchema[] || [];
    }, [data]);

    return (
        <Card className="border-0 bg-white dark:bg-black shadow-md rounded-xl">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-medium text-black dark:text-white tracking-tight">
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
                        excludeFromBudget: false
                    }}
                />
            </CardContent>
        </Card>
    );
} 