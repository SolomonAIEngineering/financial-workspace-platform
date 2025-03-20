'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { RecurringTransactionsView } from '@/components/tables/recurring-transaction/recurring-transactions-view';
import { api } from '@/trpc/react';
import { sampleRecurringTransactions } from '@/components/tables/recurring-transaction/constants';

// Define the props interface with initialData
interface ClientTransactionsTableProps {
  initialData?: any;
}

export function ClientTransactionsTable({
  initialData,
}: ClientTransactionsTableProps) {
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

  // Only query if we're not on the first page or if initialData wasn't provided
  const shouldSkipQuery = initialData && page === 1;

  // Use the initialData for the query with TRPCQuery
  const { data, isPending } =
    api.recurringTransactions.getRecurringTransactions.useQuery(
      {
        page,
        limit: pageSize,
      },
      {
        // Use initialData if available to avoid refetching on first load
        initialData: initialData,
        // Skip the query on the first page if we have initialData
        enabled: !shouldSkipQuery,
        // Only refetch if the initial data is stale
        staleTime: 60 * 1000, // 1 minute
      }
    );

  // Prioritize initialData for the first page, otherwise use query data
  const effectiveData = page === 1 && initialData ? initialData : data;

  // Extract transactions from data
  const transactions = effectiveData?.recurringTransactions || [];
  const pagination = effectiveData?.pagination;

  // Add debugging info in development
  if (process.env.NODE_ENV === 'development') {
    console.info('Recurring Transactions:', {
      usingInitialData: page === 1 && initialData !== undefined,
      initialDataPresent: !!initialData,
      initialTransactions: initialData?.recurringTransactions?.length,
      queryDataPresent: !!data,
      queryTransactions: data?.recurringTransactions?.length,
      displayedTransactions: transactions.length,
      page,
      pagination,
    });
  }

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

  // Determine which data to display
  const displayData =
    transactions.length > 0
      ? transactions
      : process.env.NODE_ENV === 'development'
        ? sampleRecurringTransactions // Only use sample data in development
        : [];

  return (
    <div>
      {isPending && (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      )}

      {!isPending && displayData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <path d="M12 2v8"></path>
              <path d="m16 6-4 4-4-4"></path>
              <path d="M8 14h8"></path>
              <rect width="16" height="16" x="4" y="4" rx="2"></rect>
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium">
            No recurring transactions found
          </h3>
          <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
            There are no recurring transactions in your account yet. They will
            appear here once you have set up recurring bills, subscriptions, or
            income.
          </p>
        </div>
      )}

      {displayData.length > 0 && (
        <RecurringTransactionsView
          data={displayData}
          currentPage={page}
          pageSize={pageSize}
          totalItems={pagination?.total || displayData.length}
          totalPages={pagination?.pages || 1}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
