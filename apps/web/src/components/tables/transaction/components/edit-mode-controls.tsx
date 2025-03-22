import { Edit2, Save, X } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/registry/default/potion-ui/button';
import { cn } from '@/lib/utils';
import { useTransactionContext } from './transaction-context';

/**
 * EditModeControls component - Renders the edit/save/cancel buttons for
 * transaction editing with a modern, animated design.
 */
export function EditModeControls() {
  const { isEditMode, toggleEditMode, handleSave, transaction } =
    useTransactionContext();

  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <div className="mb-6 mt-2 flex items-center justify-end px-4">
      {isEditMode ? (
        <div className="flex items-center gap-3 transition-all duration-200">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleEditMode}
            className={cn(
              "relative overflow-hidden group flex h-9 items-center gap-1.5 px-4 rounded-lg",
              "text-gray-600 dark:text-gray-300 border border-transparent",
              "transition-all duration-200 ease-in-out",
              "hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400",
              "focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-800 focus:ring-opacity-50"
            )}
            disabled={isSaving}
          >
            <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-rose-50/0 to-rose-50/0 dark:from-rose-900/0 dark:to-rose-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
            <X className="h-4 w-4 transition-all duration-200 group-hover:scale-110" />
            <span className="font-medium">Cancel</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSaveWithState}
            disabled={isSaving}
            className={cn(
              "relative h-9 group flex items-center gap-1.5 px-5 rounded-lg",
              "bg-gradient-to-br from-violet-500 to-indigo-600 dark:from-violet-600 dark:to-indigo-700",
              "text-white dark:text-white font-medium",
              "shadow-md hover:shadow-lg transition-all duration-200 ease-in-out",
              "hover:scale-[1.02] active:scale-[0.98]",
              "focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-700 focus:ring-opacity-50",
              "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-200 before:hover:opacity-100"
            )}
          >
            <Save className={cn(
              "h-4 w-4 transition-all duration-200 group-hover:scale-110",
              isSaving ? "animate-spin" : ""
            )} />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          className={cn(
            "relative overflow-hidden group flex h-9 items-center gap-1.5 px-4 rounded-lg",
            "bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40",
            "text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/30",
            "shadow-sm hover:shadow transition-all duration-200 ease-in-out",
            "hover:border-violet-300 dark:hover:border-violet-700/50 hover:bg-gradient-to-br hover:from-violet-100 hover:to-indigo-100 dark:hover:from-violet-900/30 dark:hover:to-indigo-900/30",
            "focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-800 focus:ring-opacity-50"
          )}
          onClick={toggleEditMode}
        >
          <Edit2 className="h-4 w-4 transition-all duration-200 group-hover:scale-110 text-violet-600 dark:text-violet-400" />
          <span className="font-medium">Edit Transaction</span>
        </Button>
      )}
    </div>
  );
}
