'use client';

import * as React from 'react';

import { AlertCircle } from 'lucide-react';
import type { ColumnSchema } from './schema';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TransactionDetails } from './components/transaction-details';
import { useDataTable } from '@/components/data-table/data-table-provider';

/**
 * TransactionSheetDetails component
 * 
 * This component serves as the main container for displaying detailed transaction information
 * in a slide-out sheet. It handles the following responsibilities:
 * 
 * 1. Retrieves the currently selected transaction from the data table context
 * 2. Displays an error state if no transaction is selected
 * 3. Provides a scrollable container for the transaction details
 * 4. Renders the comprehensive TransactionDetails component with all transaction information
 * 
 * The component is designed to work with the data table selection mechanism, showing details
 * for whichever transaction row is currently selected. It provides a rich, detailed view
 * of transaction information with tooltips and organized sections.
 *
 * @component
 * @example
 * ```tsx
 * // Used inside a sheet or dialog component
 * <Sheet>
 *   <SheetContent>
 *     <TransactionSheetDetails />
 *   </SheetContent>
 * </Sheet>
 * ```
 * 
 * @returns {JSX.Element} The rendered transaction details sheet
 */
export function TransactionSheetDetails() {
    const { rowSelection, table } = useDataTable();

    // Get the selected transaction
    const selectedRowKey = Object.keys(rowSelection)[0];
    const selectedRow = selectedRowKey ? table.getRow(selectedRowKey) : null;
    const transaction = selectedRow?.original as ColumnSchema | undefined;

    // Error state if no transaction selected
    if (!transaction) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Transaction Selected</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Select a transaction from the table to view its details.
                </p>
            </div>
        );
    }

    return (
        <ScrollArea className="scrollbar-hide h-full">
            <div className="flex flex-col space-y-4 p-6">
                <TransactionDetails transaction={transaction as any} />
            </div>
        </ScrollArea>
    );
}