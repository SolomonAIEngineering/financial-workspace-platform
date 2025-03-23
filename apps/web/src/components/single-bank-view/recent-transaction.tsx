import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCallback, useMemo } from 'react';

import { ColumnSchema } from '../tables/transaction/schema';
import { DataTable } from '@/components/tables/transaction/data-table';
import { api } from '@/trpc/react';
import { columns } from '../tables/transaction/columns';

interface RecentTransactionsProps {
    isLoading?: boolean;
}

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

    // Get transactions from the response and map to expected format
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