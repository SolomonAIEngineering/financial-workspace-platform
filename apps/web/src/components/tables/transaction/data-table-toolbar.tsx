import * as React from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/registry/default/potion-ui/avatar';
import { CreditCard, Tag, Users, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/default/potion-ui/dropdown-menu';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/registry/default/potion-ui/button';
import { Input } from '@/registry/default/potion-ui/input';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import { useDataTable } from '@/components/data-table/data-table-provider';
import { useState } from 'react';

const paymentMethodOptions = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'digital_wallet', label: 'Digital Wallet' },
  { value: 'check', label: 'Check' },
  { value: 'wire_transfer', label: 'Wire Transfer' },
  { value: 'ach', label: 'ACH' },
  { value: 'mobile_payment', label: 'Mobile Payment' },
  { value: 'other', label: 'Other' },
];

export function DataTableToolbar() {
  const { rowSelection, table } = useDataTable();
  const [tagsInput, setTagsInput] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const utils = api.useUtils();

  // Team members query
  const { data: teamMembers, isLoading: isLoadingTeamMembers } =
    api.team.getMembers.useQuery();

  // Mutations
  const bulkUpdateTags = api.transactions.bulkUpdateTags.useMutation();
  const bulkUpdatePaymentMethod =
    api.transactions.updatePaymentMethod.useMutation();
  const bulkUpdateAssignedTo =
    api.transactions.bulkUpdateAssignedTo.useMutation();

  const selectedRowCount = Object.keys(rowSelection).length;
  const hasRowsSelected = selectedRowCount > 0;

  // Get selected transaction IDs
  const getSelectedTransactionIds = () => {
    return Object.keys(rowSelection).map((key) => {
      const row = table.getRow(key);
      return (row.original as { id: string }).id;
    });
  };

  // Tag management handlers
  const handleAddTags = (tags: string[]) => {
    if (!hasRowsSelected) return;

    const transactionIds = getSelectedTransactionIds();
    setLoadingAction('add-tags');

    bulkUpdateTags.mutate(
      {
        transactionIds,
        tags,
        operation: 'add',
      },
      {
        onSuccess: () => {
          toast.success(
            `Added tags to ${transactionIds.length} transaction${transactionIds.length > 1 ? 's' : ''}`
          );
          void utils.transactions.getTransactions.invalidate();
        },
        onError: (error) => {
          toast.error('Error adding tags', {
            description: error.message,
          });
        },
        onSettled: () => {
          setLoadingAction(null);
          table.resetRowSelection();
        },
      }
    );
  };

  // Payment method handler
  const handleUpdatePaymentMethod = (paymentMethod: string) => {
    if (!hasRowsSelected) return;

    const transactionIds = getSelectedTransactionIds();
    setLoadingAction('update-payment');

    // In a real implementation, we'd use the bulk update endpoint
    // For now, we'll update one by one
    const updatePromises = transactionIds.map((id) =>
      bulkUpdatePaymentMethod.mutateAsync({
        id,
        paymentMethod,
      })
    );

    Promise.all(updatePromises)
      .then(() => {
        toast.success(
          `Updated payment method for ${transactionIds.length} transaction${transactionIds.length > 1 ? 's' : ''}`
        );
        void utils.transactions.getTransactions.invalidate();
        table.resetRowSelection();
      })
      .catch((error) => {
        toast.error('Error updating payment method', {
          description: error.message,
        });
      })
      .finally(() => {
        setLoadingAction(null);
      });
  };

  // Assignment handler
  const handleAssignTransaction = (assignedTo: string) => {
    if (!hasRowsSelected) return;

    const transactionIds = getSelectedTransactionIds();
    setLoadingAction('assign');

    bulkUpdateAssignedTo.mutate(
      {
        transactionIds,
        assignedTo,
      },
      {
        onSuccess: () => {
          toast.success(
            `Assigned ${transactionIds.length} transaction${transactionIds.length > 1 ? 's' : ''}`
          );
          void utils.transactions.getTransactions.invalidate();
        },
        onError: (error) => {
          toast.error('Error assigning transactions', {
            description: error.message,
          });
        },
        onSettled: () => {
          setLoadingAction(null);
          table.resetRowSelection();
        },
      }
    );
  };

  // Tags handler component
  const TagsManager = () => {
    const [tags, setTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');

    const handleAddTag = () => {
      if (inputValue.trim() && !tags.includes(inputValue.trim())) {
        setTags([...tags, inputValue.trim()]);
        setInputValue('');
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      }
    };

    return (
      <div className="p-2">
        <div className="mb-2 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} className="flex items-center gap-1 px-2 py-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setTags(tags.filter((t) => t !== tag))}
              />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add tag"
            onKeyDown={handleKeyDown}
          />
          <Button
            size="sm"
            onClick={handleAddTag}
            disabled={!inputValue.trim()}
          >
            Add
          </Button>
        </div>
        <Button
          className="mt-2 w-full"
          disabled={tags.length === 0}
          onClick={() => handleAddTags(tags)}
        >
          Apply Tags
        </Button>
      </div>
    );
  };

  if (!hasRowsSelected) return null;

  return (
    <div className="flex items-center gap-2 p-1">
      <p className="text-sm text-muted-foreground">
        {selectedRowCount} row{selectedRowCount > 1 ? 's' : ''} selected
      </p>

      {/* Tags dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            disabled={loadingAction !== null}
          >
            <Tag className="h-4 w-4" />
            Update Tags
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel>Manage Tags</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <TagsManager />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Payment Method dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            disabled={loadingAction !== null}
          >
            <CreditCard className="h-4 w-4" />
            Set Payment Method
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Update Payment Method</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {paymentMethodOptions.map((method) => (
            <DropdownMenuItem
              key={method.value}
              onClick={() => handleUpdatePaymentMethod(method.value)}
            >
              {method.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Assignment dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            disabled={loadingAction !== null || isLoadingTeamMembers}
          >
            <Users className="h-4 w-4" />
            Assign To
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Assign Transactions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isLoadingTeamMembers ? (
            <div className="flex items-center justify-center py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span className="ml-2 text-sm">Loading...</span>
            </div>
          ) : teamMembers?.length ? (
            teamMembers.map((member) => (
              <DropdownMenuItem
                key={member.id}
                onClick={() => handleAssignTransaction(member.id)}
                className="flex items-center gap-2"
              >
                {member.avatar && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>
                      {member.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span>{member.name}</span>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No team members found</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
