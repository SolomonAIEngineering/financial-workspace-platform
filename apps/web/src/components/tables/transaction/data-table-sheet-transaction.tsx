'use client';

import * as React from 'react';

import { AlertCircle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Button } from '@/registry/default/potion-ui/button';
import type { ColumnSchema } from './schema';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TransactionDetails } from './components/transaction-details';
import { useDataTable } from '@/components/data-table/data-table-provider';
import { useDeleteTransaction } from '@/trpc/hooks/transaction-hooks';

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
}: TransactionSheetDetailsProps = {}) {
  const { rowSelection, table } = useDataTable();
  const deleteTransaction = useDeleteTransaction();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Get the selected transaction
  const selectedRowKey = Object.keys(rowSelection)[0];
  const selectedRow = selectedRowKey ? table.getRow(selectedRowKey) : null;
  const transaction = selectedRow?.original as ColumnSchema | undefined;

  // Handle transaction deletion
  const handleDeleteTransaction = () => {
    if (!transaction?.id) return;

    // Close the confirmation dialog first
    setIsDeleteDialogOpen(false);

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
          <TransactionDetails transaction={transaction as any} />
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
