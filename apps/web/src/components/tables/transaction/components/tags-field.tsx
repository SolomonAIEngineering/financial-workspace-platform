import { Loader2, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { EditableDetailRow } from './editable-detail-row';
import { api } from '@/trpc/react';
import { fieldDescriptions } from './field-descriptions';
import { toast } from 'sonner';
import { useRemoveTransactionTag } from '@/trpc/hooks/transaction-hooks';
import { useState } from 'react';
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
    updateTransactionData,
  } = useTransactionContext();

  const [removingTag, setRemovingTag] = useState<string | null>(null);

  // Get current tags
  const tags =
    'tags' in editedValues
      ? editedValues.tags
      : (transaction.tags as string[]) || [];
  const hasTags = tags.length > 0;

  // Use the dedicated updateTags mutation when in edit mode
  const updateTagsMutation = api.transactions.updateTags.useMutation({
    onSuccess: (updatedTransaction) => {
      updateTransactionData({ tags: updatedTransaction.tags });
      toast.success('Tags updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update tags: ${error.message}`);
      console.error('Update tags error:', error);
    },
  });

  // Use the dedicated removeTag mutation for removing individual tags
  const removeTagMutation = useRemoveTransactionTag();

  const handleTagsUpdate = (value: string) => {
    // Parse comma-separated tags and clean them up
    const newTags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    // Remove duplicates (case-insensitive)
    const uniqueTags: string[] = [];
    newTags.forEach((tag) => {
      if (
        !uniqueTags.some(
          (existing) => existing.toLowerCase() === tag.toLowerCase()
        )
      ) {
        uniqueTags.push(tag);
      }
    });

    // Update local state
    handleFieldChange('tags', uniqueTags);

    // Update server if we have a transaction ID
    if (transaction.id) {
      updateTagsMutation.mutate({
        id: transaction.id,
        tags: uniqueTags,
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!transaction.id) return;

    setRemovingTag(tagToRemove);

    removeTagMutation.mutate(
      {
        id: transaction.id,
        tag: tagToRemove,
      },
      {
        onSuccess: (updatedTransaction) => {
          updateTransactionData({ tags: updatedTransaction.tags });
          setRemovingTag(null);
        },
        onError: (error) => {
          toast.error(`Failed to remove tag: ${error.message}`);
          console.error('Remove tag error:', error);
          setRemovingTag(null);
        },
      }
    );
  };

  if (isEditMode && isEditable('tags')) {
    return (
      <EditableDetailRow
        label="Tags"
        value={tags.join(', ')}
        onChange={handleTagsUpdate}
        tooltip={fieldDescriptions.tags}
        placeholder="Enter tags separated by commas"
      />
    );
  }

  if (hasTags) {
    return (
      <div className="space-y-1">
        <span className="text-sm font-medium text-foreground/70">Tags</span>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge
              key={tag}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium shadow-sm"
            >
              {tag}
              <button
                className="ml-1 opacity-70 transition-opacity hover:opacity-100"
                onClick={() => handleRemoveTag(tag)}
                disabled={removingTag === tag}
              >
                {removingTag === tag ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3 cursor-pointer" />
                )}
              </button>
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
