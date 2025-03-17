'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { RecurringTransactionsView } from '@/components/tables/recurring-transaction/recurring-transactions-view';
import { api } from '@/trpc/react';

// Define the props interface with initialData
interface ClientTransactionsTableProps {
    initialData?: any;
}

export function ClientTransactionsTable({ initialData }: ClientTransactionsTableProps) {
    // Add state for pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(100);

    // Use refs to handle pagination updates without causing render cycle issues
    const pageChangeRef = useRef<((page: number) => void) | null>(null);
    const pageSizeChangeRef = useRef<((pageSize: number) => void) | null>(null);

    // Update the refs with the latest callbacks
    useEffect(() => {
        pageChangeRef.current = (newPage: number) => {
            if (newPage !== page) {
                setPage(newPage);
            }
        };

        pageSizeChangeRef.current = (newPageSize: number) => {
            if (newPageSize !== pageSize) {
                setPageSize(newPageSize);
                setPage(1); // Reset to first page when changing page size
            }
        };
    }, [page, pageSize]);

    // Use the initialData for the query with TRPCQuery
    const { data, isPending } = api.recurringTransactions.getRecurringTransactions.useQuery(
        {
            page,
            limit: pageSize,
        },
        {
            // Use initialData if available to avoid refetching
            initialData: initialData,
            // Only refetch if the initial data is stale
            staleTime: 60 * 1000, // 1 minute
        }
    );

    // Extract transactions from data
    const transactions = data?.recurringTransactions || [];
    const pagination = data?.pagination;

    // Safe callback handlers that use the refs
    const handlePageChange = useCallback((newPage: number) => {
        if (pageChangeRef.current) {
            pageChangeRef.current(newPage);
        }
    }, []);

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        if (pageSizeChangeRef.current) {
            pageSizeChangeRef.current(newPageSize);
        }
    }, []);

    return (
        <div>
            {isPending && (
                <div className="flex justify-center py-6">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
            )}

            <RecurringTransactionsView
                data={transactions}
                currentPage={page}
                pageSize={pageSize}
                totalItems={pagination?.total || 0}
                totalPages={pagination?.pages || 1}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
            />
        </div>
    );
} 