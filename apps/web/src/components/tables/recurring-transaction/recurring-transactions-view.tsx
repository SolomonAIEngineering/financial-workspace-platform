'use client';

import * as React from 'react';

import { filterFields, sampleRecurringTransactions } from './constants';

import { DataTable } from './data-table';
import { columns } from './columns';

/**
 * Main view component for the recurring transactions feature. This component
 * serves as the entry point for displaying recurring transactions in a data
 * table with filtering and sorting capabilities.
 *
 * @file Recurring-transactions-view.tsx
 */

// Define interface for component props
interface RecurringTransactionsViewProps {
  data?: any[]; // Accept any transaction data format
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Recurring Transactions View component.
 *
 * Renders a complete data table view of recurring transactions with all the
 * necessary features including filtering, sorting, and row selection.
 *
 * @example
 *   ```tsx
 *   // Use in a page component
 *   export default function RecurringTransactionsPage() {
 *     return (
 *       <main>
 *         <h1>Recurring Transactions</h1>
 *         <RecurringTransactionsView
 *           data={recurringTransactions}
 *           currentPage={1}
 *           pageSize={20}
 *           totalItems={100}
 *           totalPages={5}
 *           onPageChange={(page) => fetchPage(page)}
 *           onPageSizeChange={(size) => setPageSize(size)}
 *         />
 *       </main>
 *     );
 *   }
 *   ```;
 *
 * @returns A React component that displays a full-featured recurring
 *   transactions table
 */
export function RecurringTransactionsView({
  data = sampleRecurringTransactions,
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: RecurringTransactionsViewProps = {}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      filterFields={filterFields}
      pagination={
        currentPage && pageSize && totalItems && totalPages
          ? {
              page: currentPage,
              limit: pageSize,
              total: totalItems,
              pages: totalPages,
            }
          : undefined
      }
      onPaginationChange={
        onPageChange && onPageSizeChange
          ? {
              onPageChange,
              onPageSizeChange,
            }
          : undefined
      }
    />
  );
}
