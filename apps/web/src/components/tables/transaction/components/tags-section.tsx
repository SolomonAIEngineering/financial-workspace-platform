import * as React from 'react';

import { Loader2, Plus, Tag, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/registry/default/potion-ui/button';
import { Input } from '@/registry/default/potion-ui/input';
import { TransactionSection } from './transaction-section';
import { api } from '@/trpc/react';
import { sectionDescriptions } from './section-descriptions';
import { toast } from 'sonner';
import { useRemoveTransactionTag } from '@/trpc/hooks/transaction-hooks';
import { useTransactionContext } from './transaction-context';

/**
 * TagsSection component - Renders the transaction tags section with editing
 * capability
 *
 * This component provides a dedicated section for viewing and managing
 * transaction tags. It enables users to add, view, and remove tags associated
 * with a transaction.
 */
export function TagsSection() {
  const { transaction, updateTransactionData } = useTransactionContext();

  const [inputValue, setInputValue] = React.useState('');
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [removingTag, setRemovingTag] = React.useState<string | null>(null);

  // Get current tags from transaction
  const tags = (transaction.tags as string[]) || [];
  const hasTags = tags.length > 0;

  // Use the dedicated updateTags mutation for adding tags
  const updateTagsMutation = api.transactions.updateTags.useMutation({
    onSuccess: (updatedTransaction) => {
      updateTransactionData({ tags: updatedTransaction.tags });
      toast.success('Tags updated successfully');
      setIsUpdating(false);
    },
    onError: (error) => {
      toast.error(`Failed to update tags: ${error.message}`);
      console.error('Update tags error:', error);
      setIsUpdating(false);
    },
  });

  // Use the dedicated removeTag mutation for removing tags
  const removeTagMutation = useRemoveTransactionTag();

  const handleAddTag = () => {
    if (!transaction.id) return;

    // Clean up the input value and check if it's empty
    const tagValue = inputValue.trim();
    if (!tagValue) {
      setInputValue('');
      return;
    }

    // Check for duplicates (case-insensitive)
    if (tags.some((tag) => tag.toLowerCase() === tagValue.toLowerCase())) {
      toast.info('This tag already exists');
      setInputValue('');
      return;
    }

    setIsUpdating(true);
    const newTags = [...tags, tagValue];

    updateTagsMutation.mutate({
      id: transaction.id,
      tags: newTags,
    });

    setInputValue('');
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
          toast.success(`Tag "${tagToRemove}" removed`);
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

  return (
    <TransactionSection
      title="Tags"
      icon={<Tag className="h-4 w-4" />}
      defaultOpen={hasTags}
      tooltip={
        sectionDescriptions.tags || 'Tags associated with this transaction'
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {hasTags ? (
              tags.map((tag) => (
                <Badge
                  key={tag}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all duration-200 hover:shadow hover:brightness-105"
                >
                  {tag}
                  <button
                    className="opacity-70 transition-opacity hover:opacity-100"
                    onClick={() => handleRemoveTag(tag)}
                    disabled={isUpdating || removingTag === tag}
                  >
                    {removingTag === tag ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3 cursor-pointer" />
                    )}
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No tags</span>
            )}
          </div>

          <div className="relative mt-1 flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add new tag"
              className="h-9 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              disabled={isUpdating}
            />
            <Button
              size="sm"
              onClick={handleAddTag}
              variant="outline"
              className="flex h-9 items-center gap-2 rounded-md px-6 font-medium transition-all hover:shadow-sm"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Adding...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Add Tag</span>
                </div>
              )}
            </Button>
          </div>

          {isUpdating && (
            <p className="text-xs text-muted-foreground">Updating tags...</p>
          )}
        </div>
      </div>
    </TransactionSection>
  );
}
