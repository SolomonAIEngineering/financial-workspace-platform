'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { DataTable } from '@/components/tables/transaction/data-table';
import { api } from '@/trpc/react';
import { columns } from '@/components/tables/transaction/columns';
import { filterFields } from '@/components/tables/transaction/constants';
import { data as sampleData } from '@/components/tables/transaction/constants';

// Define the props interface with initialData
interface ClientTransactionsTableProps {
  initialData?: any;
}

export function ClientTransactionsTable({
  initialData,
}: ClientTransactionsTableProps = {}) {
  // Add state for pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  // State to store the effective data that should be displayed
  const [effectiveData, setEffectiveData] = useState(initialData);
  // Track whether a refetch has occurred
  const [hasRefetched, setHasRefetched] = useState(false);

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
  const shouldSkipQuery = initialData && page === 1 && !hasRefetched;

  // Use the initialData for the query with TRPCQuery
  const {
    data: queryData,
    isPending,
    refetch,
  } = api.transactions.getTransactions.useQuery(
    {
      page,
      limit: pageSize,
    },
    {
      // Use initialData if available to avoid refetching
      initialData: initialData,
      // Skip the initial query if we're on page 1 and have initialData and no refetch has occurred
      enabled: !shouldSkipQuery,
      // Only refetch if the initial data is stale
      staleTime: 60 * 1000, // 1 minute
    }
  );

  // Update effectiveData when queryData changes or on initial load
  useEffect(() => {
    // If we've refetched, always use the fresh queryData
    if (hasRefetched) {
      setEffectiveData(queryData);
    }
    // On first page without refetch, use initialData if available
    else if (page === 1 && initialData) {
      setEffectiveData(initialData);
    }
    // Otherwise use queryData for all other cases
    else if (queryData) {
      setEffectiveData(queryData);
    }
  }, [queryData, initialData, page, hasRefetched]);

  // Function to handle refetching transactions data
  const handleRefetch = useCallback(() => {
    setHasRefetched(true);
    return refetch();
  }, [refetch]);

  // Extract transactions from data, ensuring we handle both array and object structures
  const transactions = (() => {
    // If no data at all, return empty array (or sample data in development)
    if (!effectiveData) {
      return process.env.NODE_ENV === 'development' ? sampleData : [];
    }

    // Handle case where data.transactions is an array (most likely case)
    if (
      effectiveData.transactions &&
      Array.isArray(effectiveData.transactions)
    ) {
      return effectiveData.transactions as any[];
    }

    // Handle case where data itself is an array
    if (Array.isArray(effectiveData)) {
      return effectiveData as any[];
    }

    // Fallback to empty array if we can't find transactions
    return [] as any[];
  })();

  const pagination = effectiveData?.pagination;

  // Log data in development to help with debugging
  if (process.env.NODE_ENV === 'development') {
    console.info('Regular Transactions:', {
      usingInitialData:
        page === 1 && initialData !== undefined && !hasRefetched,
      initialDataPresent: !!initialData,
      hasRefetched,
      initialTransactions: initialData?.transactions?.length,
      queryDataPresent: !!queryData,
      queryTransactions: queryData?.transactions?.length,
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

  // Determine which data to display based on available transactions
  const displayData =
    transactions.length > 0
      ? transactions
      : process.env.NODE_ENV === 'development'
        ? sampleData // Only use sample data in development
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
          <h3 className="mt-4 text-lg font-medium">No transactions found</h3>
          <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
            There are no transactions in your account yet. They will appear here
            once you have financial activity.
          </p>
        </div>
      )}

      {displayData.length > 0 && (
        <DataTable
          columns={columns}
          data={displayData}
          filterFields={filterFields}
          pagination={
            pagination
              ? {
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                pages: pagination.pages,
              }
              : undefined
          }
          onPaginationChange={{
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
          refetch={handleRefetch}
          isLoading={isPending}
        />
      )}
    </div>
  );
}
