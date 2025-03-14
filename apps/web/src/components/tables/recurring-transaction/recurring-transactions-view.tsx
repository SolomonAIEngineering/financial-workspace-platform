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

/**
 * Recurring Transactions View component.
 *
 * Renders a complete data table view of recurring transactions with all the
 * necessary features including filtering, sorting, and row selection. In a
 * production environment, this would fetch data from an API instead of using
 * sample data.
 *
 * @example
 *   ```tsx
 *   // Use in a page component
 *   export default function RecurringTransactionsPage() {
 *     return (
 *       <main>
 *         <h1>Recurring Transactions</h1>
 *         <RecurringTransactionsView />
 *       </main>
 *     );
 *   }
 *   ```;
 *
 * @returns A React component that displays a full-featured recurring
 *   transactions table
 */
export function RecurringTransactionsView() {
  return (
    <DataTable
      columns={columns}
      data={sampleRecurringTransactions}
      filterFields={filterFields}
    />
  );
}
