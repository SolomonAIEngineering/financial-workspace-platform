import { Edit2, Save, X } from 'lucide-react';

import { Button } from '@/registry/default/potion-ui/button';
import React from 'react';
import { useTransactionContext } from './transaction-context';

/**
 * EditModeControls component - Renders the edit/save/cancel buttons for
 * transaction editing.
 */
export function EditModeControls() {
  const { isEditMode, toggleEditMode, handleSave, transaction } =
    useTransactionContext();

  // Don't render controls if the transaction is locked or no update callback was provided
  if (transaction.isLocked) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center justify-end px-4">
      {isEditMode ? (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={toggleEditMode}
            className="mr-2 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={toggleEditMode}
          className="flex items-center gap-1"
        >
          <Edit2 className="h-4 w-4" />
          Edit
        </Button>
      )}
    </div>
  );
}
