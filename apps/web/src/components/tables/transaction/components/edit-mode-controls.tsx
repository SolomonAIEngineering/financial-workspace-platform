import { Edit2, Save, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/registry/default/potion-ui/button';
import { DeleteModal } from '@/components/ui/delete-modal';
import { cn } from '@/lib/utils';
import { useTransactionContext } from './transaction-context';

interface EditModeControlsProps {
  onDelete?: () => void;
}

/**
 * EditModeControls component - Renders the edit/save/cancel buttons for
 * transaction editing with a modern, animated design.
 */
export function EditModeControls({ onDelete }: EditModeControlsProps = {}) {
  const { isEditMode, toggleEditMode, handleSave, transaction } =
    useTransactionContext();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Don't render controls if the transaction is locked or no update callback was provided
  if (transaction.isLocked) {
    return null;
  }

  // Wrapper for handleSave that manages the saving state
  const handleSaveWithState = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await handleSave();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="mt-2 mb-6 flex items-center justify-end gap-3 px-4">
        {/* Delete button - always visible */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDeleteClick}
          className={cn(
            'group relative flex h-9 items-center gap-1.5 overflow-hidden rounded-lg px-4',
            'border border-transparent text-rose-600 dark:text-rose-400',
            'transition-all duration-200 ease-in-out',
            'hover:bg-rose-50 dark:hover:bg-rose-950/20',
            'focus:ring-opacity-50 focus:ring-2 focus:ring-rose-200 focus:outline-none dark:focus:ring-rose-800'
          )}
          disabled={isSaving}
        >
          <Trash2 className="h-4 w-4 transition-all duration-200 group-hover:scale-110" />
          <span className="font-medium">Delete</span>
        </Button>

        {/* Edit mode controls */}
        {isEditMode ? (
          <div className="flex items-center gap-3 transition-all duration-200">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleEditMode}
              className={cn(
                'group relative flex h-9 items-center gap-1.5 overflow-hidden rounded-lg px-4',
                'border border-transparent text-gray-600 dark:text-gray-300',
                'transition-all duration-200 ease-in-out',
                'hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400',
                'focus:ring-opacity-50 focus:ring-2 focus:ring-rose-200 focus:outline-none dark:focus:ring-rose-800'
              )}
              disabled={isSaving}
            >
              <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-rose-50/0 to-rose-50/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:from-rose-900/0 dark:to-rose-900/0"></span>
              <X className="h-4 w-4 transition-all duration-200 group-hover:scale-110" />
              <span className="font-medium">Cancel</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSaveWithState}
              disabled={isSaving}
              className={cn(
                'group relative flex h-9 items-center gap-1.5 rounded-lg px-5',
                'bg-gradient-to-br from-violet-500 to-indigo-600 dark:from-violet-600 dark:to-indigo-700',
                'font-medium text-white dark:text-white',
                'shadow-md transition-all duration-200 ease-in-out hover:shadow-lg',
                'hover:scale-[1.02] active:scale-[0.98]',
                'focus:ring-opacity-50 focus:ring-2 focus:ring-violet-400 focus:outline-none dark:focus:ring-violet-700',
                'before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-200 before:hover:opacity-100'
              )}
            >
              <Save
                className={cn(
                  'h-4 w-4 transition-all duration-200 group-hover:scale-110',
                  isSaving ? 'animate-spin' : ''
                )}
              />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className={cn(
              'group relative flex h-9 items-center gap-1.5 overflow-hidden rounded-lg px-4',
              'bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40',
              'border border-violet-200/60 text-violet-700 dark:border-violet-800/30 dark:text-violet-300',
              'shadow-sm transition-all duration-200 ease-in-out hover:shadow',
              'hover:border-violet-300 hover:bg-gradient-to-br hover:from-violet-100 hover:to-indigo-100 dark:hover:border-violet-700/50 dark:hover:from-violet-900/30 dark:hover:to-indigo-900/30',
              'focus:ring-opacity-50 focus:ring-2 focus:ring-violet-400 focus:outline-none dark:focus:ring-violet-800'
            )}
            onClick={toggleEditMode}
          >
            <Edit2 className="h-4 w-4 text-violet-600 transition-all duration-200 group-hover:scale-110 dark:text-violet-400" />
            <span className="font-medium">Edit Transaction</span>
          </Button>
        )}
      </div>

      {/* Delete confirmation modal */}
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
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
