'use client';

import { useState } from 'react';

import {
  BookmarkIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@udecode/cn';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/registry/default/potion-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/default/potion-ui/dropdown-menu';
import { Input } from '@/registry/default/potion-ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/default/potion-ui/popover';
import { useDocumentQueryOptions } from '@/trpc/hooks/query-options';
import { api } from '@/trpc/react';

// Document status options for dropdown
const STATUS_OPTIONS = [
  {
    color:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    label: 'Draft',
    value: 'draft',
  },
  {
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    label: 'Review',
    value: 'review',
  },
  {
    color:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    label: 'Approved',
    value: 'approved',
  },
  {
    color:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    label: 'Published',
    value: 'published',
  },
  {
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
    label: 'Archived',
    value: 'archived',
  },
];

export function DocumentMetadata() {
  const queryClient = useQueryClient();
  const queryOptions = useDocumentQueryOptions();

  const { data, isLoading } = useQuery({
    ...queryOptions,
  });

  const [tagInput, setTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const document = data?.document;
  const documentId = document?.id;
  const tags = document?.tags || [];
  const status = document?.status || 'draft';
  const isTemplate = document?.isTemplate || false;
  const isPinned = document?.pinned || false;

  const invalidateQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
  };

  // Mutations
  const updateTagsMutation = api.document.updateTags.useMutation({
    onSuccess: async () => {
      await invalidateQueries();
      toast.success('Tags updated');
    },
  });

  const updateStatusMutation = api.document.updateStatus.useMutation({
    onSuccess: async () => {
      await invalidateQueries();
      toast.success('Status updated');
    },
  });

  const toggleTemplateMutation = api.document.toggleTemplate.useMutation({
    onSuccess: async () => {
      await invalidateQueries();
      toast.success(
        `Document ${isTemplate ? 'removed from' : 'saved as'} template`
      );
    },
  });

  const togglePinMutation = api.document.togglePin.useMutation({
    onSuccess: async () => {
      await invalidateQueries();
      toast.success(`Document ${isPinned ? 'unpinned' : 'pinned'}`);
    },
  });

  // Handlers
  const handleAddTag = () => {
    if (!tagInput.trim() || !documentId) return;

    const newTag = tagInput.trim();
    const newTags = [...tags, newTag];

    updateTagsMutation.mutate({
      id: documentId,
      tags: newTags,
    });

    setTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!documentId) return;

    const newTags = tags.filter((tag) => tag !== tagToRemove);

    updateTagsMutation.mutate({
      id: documentId,
      tags: newTags,
    });
  };

  const handleStatusChange = (newStatus: string) => {
    if (!documentId) return;

    updateStatusMutation.mutate({
      id: documentId,
      status: newStatus as any,
    });
  };

  const handleToggleTemplate = () => {
    if (!documentId) return;

    toggleTemplateMutation.mutate({
      id: documentId,
    });
  };

  const handleTogglePin = () => {
    if (!documentId) return;

    togglePinMutation.mutate({
      id: documentId,
    });
  };

  if (!documentId || isLoading) {
    return null;
  }

  // Find the current status object
  const currentStatus =
    STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

  return (
    <div className="flex flex-wrap items-center gap-2 p-2">
      {/* Tags section */}
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="flex items-center gap-1 px-2 py-1 text-xs"
          >
            <TagIcon className="h-3 w-3" />
            <span>{tag}</span>
            <button
              className="ml-1 rounded-full hover:bg-muted/50"
              onClick={() => handleRemoveTag(tag)}
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        <Popover open={isAddingTag} onOpenChange={setIsAddingTag}>
          <PopoverTrigger asChild>
            <Button
              size="xs"
              variant="outline"
              className="h-6 gap-1 rounded-full px-2 text-xs"
            >
              <TagIcon className="h-3 w-3" />
              <PlusIcon className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-2" align="start">
            <div className="space-y-2">
              <p className="text-xs font-medium">Add Tag</p>
              <div className="flex gap-1">
                <Input
                  className="h-8 text-xs"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTag();
                    }
                  }}
                  placeholder="Enter tag name"
                />
                <Button size="xs" className="h-8" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Status dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="xs"
            variant="outline"
            className={cn(
              'h-6 gap-1 rounded-full px-2 text-xs',
              currentStatus.color
            )}
          >
            {currentStatus.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {STATUS_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className={cn(
                'flex cursor-pointer items-center gap-1 text-xs',
                option.value === status && 'font-medium'
              )}
              onClick={() => handleStatusChange(option.value)}
            >
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  option.color.split(' ')[0]
                )}
              />
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Template toggle */}
      <Button
        size="xs"
        variant="outline"
        className={cn(
          'h-6 gap-1 rounded-full px-2 text-xs',
          isTemplate &&
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        )}
        onClick={handleToggleTemplate}
      >
        <DocumentDuplicateIcon className="h-3 w-3" />
        {isTemplate ? 'Template' : 'Make Template'}
      </Button>

      {/* Pin toggle */}
      <Button
        size="xs"
        variant="outline"
        className="h-6 gap-1 rounded-full px-2 text-xs"
        onClick={handleTogglePin}
      >
        {isPinned ? (
          <BookmarkSolidIcon className="h-3 w-3 text-primary" />
        ) : (
          <BookmarkIcon className="h-3 w-3" />
        )}
        {isPinned ? 'Pinned' : 'Pin'}
      </Button>
    </div>
  );
}
