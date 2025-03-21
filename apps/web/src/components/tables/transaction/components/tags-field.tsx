import { DetailRow } from './detail-row';
import { EditableDetailRow } from './editable-detail-row';
import React from 'react';
import { fieldDescriptions } from './field-descriptions';
import { useTransactionContext } from './transaction-context';

/**
 * TagsField component - Specialized renderer for the tags field that handles
 * the comma-separated format and array conversion.
 */
export function TagsField() {
  const {
    isEditMode,
    isEditable,
    transaction,
    editedValues,
    handleFieldChange,
  } = useTransactionContext();

  // Get current tags
  const tags =
    'tags' in editedValues
      ? editedValues.tags
      : (transaction.tags as string[]) || [];
  const hasTags = tags.length > 0;

  if (isEditMode && isEditable('tags')) {
    return (
      <EditableDetailRow
        label="Tags"
        value={tags.join(', ')}
        onChange={(value) => {
          handleFieldChange('tags', value);
        }}
        tooltip={fieldDescriptions.tags}
        placeholder="Enter tags separated by commas"
      />
    );
  }

  if (hasTags) {
    return (
      <DetailRow
        label="Tags"
        value={tags.join(', ')}
        tooltip={fieldDescriptions.tags}
      />
    );
  }

  return null;
}
