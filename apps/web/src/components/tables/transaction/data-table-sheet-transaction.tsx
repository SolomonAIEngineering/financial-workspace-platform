'use client';

import * as React from 'react';

import { AlertCircle, Trash2 } from 'lucide-react';
import { useDeleteTransaction, useUpdateTransaction } from '@/trpc/hooks/transaction-hooks';

import { Button } from '@/registry/default/potion-ui/button';
import type { ColumnSchema } from './schema';
import { DeleteModal } from '@/components/ui/delete-modal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TransactionDetails } from './components/transaction-details';
import { api } from '@/trpc/react';
import { useDataTable } from '@/components/data-table/data-table-provider';

interface TransactionSheetDetailsProps {
    /**
     * Optional callback function that will be called after a transaction is
     * successfully deleted Can be used by parent components to refresh data or
     * perform other actions
     */
    onDeleteSuccess?: () => void;
    /**
     * Optional callback function that will be called after a transaction is
     * successfully created
     */
    onCreateSuccess?: () => void;
    /**
     * Optional callback function that will be called after a transaction is
     * successfully updated
     */
    onUpdateSuccess?: () => void;
}

/**
 * TransactionSheetDetails component
 *
 * This component serves as the main container for displaying detailed
 * transaction information in a slide-out sheet. It handles the following
 * responsibilities:
 *
 * 1. Retrieves the currently selected transaction from the data table context
 * 2. Displays an error state if no transaction is selected
 * 3. Provides a scrollable container for the transaction details
 * 4. Renders the comprehensive TransactionDetails component with all transaction
 *    information
 * 5. Allows editing and deleting transactions
 *
 * The component is designed to work with the data table selection mechanism,
 * showing details for whichever transaction row is currently selected. It
 * provides a rich, detailed view of transaction information with tooltips and
 * organized sections.
 *
 * @example
 *   ```tsx
 *   // Used inside a sheet or dialog component
 *   <Sheet>
 *     <SheetContent>
 *       <TransactionSheetDetails
 *         onDeleteSuccess={() => refetchTransactions()}
 *         onCreateSuccess={() => refetchTransactions()}
 *         onUpdateSuccess={() => refetchTransactions()}
 *       />
 *     </SheetContent>
 *   </Sheet>
 *   ```;
 *
 * @returns {JSX.Element} The rendered transaction details sheet
 * @component
 */
export function TransactionSheetDetails({
    onDeleteSuccess,
    onCreateSuccess,
    onUpdateSuccess,
}: TransactionSheetDetailsProps = {}) {
    const { rowSelection, table } = useDataTable();
    const deleteTransaction = useDeleteTransaction();
    const updateTransaction = useUpdateTransaction();
    const trpc = api.useUtils();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [updateCounter, setUpdateCounter] = React.useState(0);

    // Get the selected transaction
    const selectedRowKey = Object.keys(rowSelection)[0];
    const selectedRow = selectedRowKey ? table.getRow(selectedRowKey) : null;
    const transaction = selectedRow?.original as ColumnSchema | undefined;

    // Handle transaction deletion
    const handleDeleteTransaction = () => {
        if (!transaction?.id) return;

        deleteTransaction.mutate(
            { id: transaction.id },
            {
                onSuccess: () => {
                    // Reset row selection to close the sheet
                    table.resetRowSelection();

                    // Call the onDeleteSuccess callback if provided
                    if (onDeleteSuccess) {
                        onDeleteSuccess();
                    }
                },
                onError: (error) => {
                    // The hook already shows an error toast
                    // Just log the detailed error for debugging
                    console.error('Delete transaction error:', error);
                },
            }
        );
    };

    // Handle transaction update
    const handleUpdateTransaction = (updatedData: any) => {
        if (!transaction?.id) return;

        console.log('Raw updated data:', updatedData);

        // Format the data properly for the API
        const apiData = { ...updatedData };

        // Log the formatted data and the full request
        const updateRequest = {
            id: transaction.id,
            data: apiData
        };
        console.log('Sending update request:', JSON.stringify(updateRequest));

        updateTransaction.mutate(
            updateRequest,
            {
                onSuccess: (data) => {
                    console.log('Transaction updated successfully, response:', data);

                    // Invalidate queries to refetch data
                    void trpc.transactions.getTransactions.invalidate();
                    void trpc.transactions.getTransaction.invalidate({ id: transaction.id });

                    // Increment update counter to force re-render
                    setUpdateCounter(prev => prev + 1);

                    // Call the onUpdateSuccess callback if provided
                    if (onUpdateSuccess) {
                        onUpdateSuccess();
                    }
                },
                onError: (error) => {
                    // Log the error for debugging
                    console.error('Update transaction error:', error);
                },
            }
        );
    };

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
        <>
            <ScrollArea className="scrollbar-hide h-full">
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-end px-4">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="flex items-center gap-1"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                    <TransactionDetails
                        transaction={transaction as any}
                        onUpdate={handleUpdateTransaction}
                        key={`${transaction.id}-${updateCounter}`}
                    />
                </div>
            </ScrollArea>

            {/* Enhanced DeleteModal with double confirmation */}
            <DeleteModal
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Transaction"
                description="Are you sure you want to delete this transaction? This action cannot be undone."
                secondStageTitle="Confirm Transaction Deletion"
                secondStageDescription={`This will permanently delete the transaction "${transaction.name || 'Unknown'}" with an amount of ${transaction.amount ? `$${transaction.amount}` : 'unknown amount'}. This action cannot be reversed.`}
                confirmText="Proceed"
                finalConfirmText="Permanently Delete"
                confirmationWord="DELETE"
                onConfirm={handleDeleteTransaction}
            />
        </>
    );
}
