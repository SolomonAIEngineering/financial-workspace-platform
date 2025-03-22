# Transaction Fields Update Feature Implementation Plan

## Overview

This document outlines the plan for implementing features that allow users to manually update transaction tags, payment methods, and team member assignments in the financial management platform. Users will be able to modify these fields directly from the transaction details sheet by interacting with the respective fields in their sections.

## Current State Analysis

- The application has a transaction detail sheet that displays transaction information in sections
- The backend likely has TRPC procedures for updating transaction fields
- The transaction interface presumably has fields for `tags`, `paymentMethod`, and `assignedTo`
- The `FieldRenderer` component supports editing for select fields in edit mode
- Similar to category updates, these fields are likely displayed as read-only when not in edit mode

## Implementation Plan

### 1. Tags Implementation

```typescript
// in src/components/tables/transaction/components/tags-section.tsx
// Inside TagsSection component:

<FieldRenderer
  field="tags"
  label="Tags"
  isMultiSelect={true}
  selectOptions={availableTags}
  isBadge={true}
  interactive={!isEditMode}
  onClick={() => {
    if (!isEditMode) {
      enterEditMode();
    }
  }}
  hoverText="Click to update tags"
/>

// Add a TagsInput component for creating/managing tags
const TagsInput = ({ value, onChange }: { value: string[], onChange: (tags: string[]) => void }) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {value.map(tag => (
          <Badge key={tag} className="px-2 py-1 flex items-center gap-1">
            {tag}
            <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add new tag"
          onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
        />
        <Button size="sm" onClick={handleAddTag}>Add</Button>
      </div>
    </div>
  );
};
```

### 2. Payment Method Implementation

```typescript
// in src/components/tables/transaction/components/payment-section.tsx
// Inside PaymentSection component:

const paymentMethodOptions = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'digital_wallet', label: 'Digital Wallet' },
  { value: 'check', label: 'Check' },
  { value: 'other', label: 'Other' },
];

<FieldRenderer
  field="paymentMethod"
  label="Payment Method"
  isSelect={true}
  selectOptions={paymentMethodOptions}
  isBadge={!!transaction.paymentMethod}
  interactive={!isEditMode}
  onClick={() => {
    if (!isEditMode) {
      enterEditMode();
    }
  }}
  hoverText="Click to update payment method"
/>
```

### 3. Assigned To (Team Members) Implementation

```typescript
// in src/components/tables/transaction/components/assignment-section.tsx
// Inside AssignmentSection component:

// Fetch team members from your auth system or team management API
const { data: teamMembers, isLoading } = api.team.getMembers.useQuery();

const teamMemberOptions = useMemo(() => {
  if (!teamMembers) return [];
  return teamMembers.map(member => ({
    value: member.id,
    label: member.name,
    avatar: member.avatar // If available
  }));
}, [teamMembers]);

<FieldRenderer
  field="assignedTo"
  label="Assigned To"
  isSelect={true}
  selectOptions={teamMemberOptions}
  isLoading={isLoading}
  isBadge={!!transaction.assignedTo}
  interactive={!isEditMode}
  avatarField="avatar"
  onClick={() => {
    if (!isEditMode) {
      enterEditMode();
    }
  }}
  hoverText="Click to assign transaction"
  renderSelected={(selectedValue) => {
    const member = teamMemberOptions.find(m => m.value === selectedValue);
    if (!member) return "Unassigned";

    return (
      <div className="flex items-center gap-2">
        {member.avatar && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={member.avatar} />
            <AvatarFallback>{member.label.substring(0, 2)}</AvatarFallback>
          </Avatar>
        )}
        <span>{member.label}</span>
      </div>
    );
  }}
/>
```

### 4. Update Transaction Context to Handle Field Updates

```typescript
// in src/components/tables/transaction/components/transaction-context.tsx

// Add specific hooks for each field update
const updateTags = api.transactions.updateTags.useMutation();
const updatePaymentMethod = api.transactions.updatePaymentMethod.useMutation();
const updateAssignedTo = api.transactions.updateAssignedTo.useMutation();

// Inside TransactionProvider component:
const enterEditModeForField = (field: string) => {
  setEditedValues((prev) => ({
    ...prev,
    [field]: transaction[field] || (field === 'tags' ? [] : ''),
  }));
  setIsEditMode(true);
  // Optionally scroll to the relevant section
};

// Add specific update functions for each field
const handleSaveChanges = async () => {
  if (!transaction.id) return;

  setIsSaving(true);
  const promises = [];

  if (editedValues.category !== transaction.category) {
    promises.push(
      updateCategory.mutateAsync({
        id: transaction.id,
        category: editedValues.category as TransactionCategory,
      })
    );
  }

  if (editedValues.tags && !arraysEqual(editedValues.tags, transaction.tags)) {
    promises.push(
      updateTags.mutateAsync({
        id: transaction.id,
        tags: editedValues.tags,
      })
    );
  }

  if (editedValues.paymentMethod !== transaction.paymentMethod) {
    promises.push(
      updatePaymentMethod.mutateAsync({
        id: transaction.id,
        paymentMethod: editedValues.paymentMethod,
      })
    );
  }

  if (editedValues.assignedTo !== transaction.assignedTo) {
    promises.push(
      updateAssignedTo.mutateAsync({
        id: transaction.id,
        assignedTo: editedValues.assignedTo,
      })
    );
  }

  try {
    await Promise.all(promises);
    setIsEditMode(false);
    refetch(); // Refresh transaction data
  } catch (error) {
    console.error('Error saving changes:', error);
    // Handle error, show toast, etc.
  } finally {
    setIsSaving(false);
  }
};

// Expose the methods in the context value
const contextValue = {
  // ... existing context values
  enterEditModeForField,
};

// Helper function to compare arrays
const arraysEqual = (a: any[], b: any[]) => {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
};
```

### 5. Add Quick Update Buttons

```typescript
// in src/components/tables/transaction/components/transaction-actions.tsx

// Add buttons for each field
<Button
  variant="outline"
  size="sm"
  onClick={() => enterEditModeForField('tags')}
>
  <Tag className="mr-2 h-4 w-4" />
  Update Tags
</Button>

<Button
  variant="outline"
  size="sm"
  onClick={() => enterEditModeForField('paymentMethod')}
>
  <CreditCard className="mr-2 h-4 w-4" />
  Update Payment Method
</Button>

<Button
  variant="outline"
  size="sm"
  onClick={() => enterEditModeForField('assignedTo')}
>
  <Users className="mr-2 h-4 w-4" />
  Assign Transaction
</Button>
```

### 6. Implement Direct Field Updates from DataTable

```typescript
// in src/components/tables/transaction/columns.tsx

// Add context menus to each field cell
// Example for Tags column:
{
  accessorKey: 'tags',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Tags" />
  ),
  cell: ({ row }) => {
    const tags = row.getValue('tags') as string[] || [];
    const updateTags = api.transactions.updateTags.useMutation();

    return (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {tags.length > 0 ? (
          tags.map(tag => (
            <Badge key={tag} className="rounded-md px-2 py-1 text-xs">
              {tag}
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-xs">No tags</span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Manage Tags</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <TagsEditor
              value={tags}
              onChange={(newTags) => {
                if (!row.original.id) return;
                updateTags.mutate({
                  id: row.original.id,
                  tags: newTags
                });
              }}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
}

// Similarly implement for other fields
```

### 7. Add Bulk Updates for Each Field

```typescript
// in src/components/tables/transaction/data-table-toolbar.tsx

// Add dropdown buttons for each field type
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm">
      <Tag className="mr-2 h-4 w-4" />
      Update Tags
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Manage Tags</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <TagsEditor
      value={[]}
      onChange={(tags) => handleBulkTagsUpdate(tags)}
      placeholder="Add tags to selected transactions"
    />
  </DropdownMenuContent>
</DropdownMenu>

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm">
      <CreditCard className="mr-2 h-4 w-4" />
      Set Payment Method
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Update Payment Method</DropdownMenuLabel>
    <DropdownMenuSeparator />
    {paymentMethodOptions.map((method) => (
      <DropdownMenuItem
        key={method.value}
        onClick={() => handleBulkPaymentMethodUpdate(method.value)}
      >
        {method.label}
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm">
      <Users className="mr-2 h-4 w-4" />
      Assign To
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Assign Transactions</DropdownMenuLabel>
    <DropdownMenuSeparator />
    {teamMemberOptions.map((member) => (
      <DropdownMenuItem
        key={member.value}
        onClick={() => handleBulkAssignmentUpdate(member.value)}
        className="flex items-center gap-2"
      >
        {member.avatar && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={member.avatar} />
            <AvatarFallback>{member.label.substring(0, 2)}</AvatarFallback>
          </Avatar>
        )}
        <span>{member.label}</span>
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>

// Implement bulk update handlers
const handleBulkTagsUpdate = (tags: string[]) => {
  const selectedTransactionIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id);

  if (selectedTransactionIds.length === 0) return;

  api.transactions.bulkUpdateTags.mutate(
    {
      transactionIds: selectedTransactionIds,
      tags,
      operation: 'add', // Could be 'add', 'remove', or 'replace'
    },
    {
      onSuccess: () => {
        table.resetRowSelection();
        refetch();
      },
      onError: (error) => {
        console.error('Bulk update error:', error);
      },
    }
  );
};

// Similar implementations for other bulk updates
```

### 8. Backend TRPC Procedures

```typescript
// in src/server/api/routers/transactions.ts

export const transactionsRouter = createTRPCRouter({
  // Existing procedures...

  updateTags: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        tags: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user has access to this transaction
      await verifyTransactionAccess(ctx, input.id);

      return ctx.db.transaction.update({
        where: { id: input.id },
        data: { tags: input.tags },
      });
    }),

  updatePaymentMethod: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        paymentMethod: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await verifyTransactionAccess(ctx, input.id);

      return ctx.db.transaction.update({
        where: { id: input.id },
        data: { paymentMethod: input.paymentMethod },
      });
    }),

  updateAssignedTo: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        assignedTo: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await verifyTransactionAccess(ctx, input.id);

      // Verify the assignee is a team member
      if (input.assignedTo) {
        const teamMember = await ctx.db.teamMember.findFirst({
          where: {
            id: input.assignedTo,
            teamId: { in: ctx.user.teams.map((t) => t.id) },
          },
        });

        if (!teamMember) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid team member',
          });
        }
      }

      return ctx.db.transaction.update({
        where: { id: input.id },
        data: { assignedTo: input.assignedTo },
      });
    }),

  // Bulk update procedures
  bulkUpdateTags: protectedProcedure
    .input(
      z.object({
        transactionIds: z.array(z.string()),
        tags: z.array(z.string()),
        operation: z.enum(['add', 'remove', 'replace']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user has access to all transactions
      await verifyBulkTransactionAccess(ctx, input.transactionIds);

      // Get current tags for each transaction if needed
      const updates = [];

      if (input.operation === 'replace') {
        // Simply replace tags
        for (const id of input.transactionIds) {
          updates.push(
            ctx.db.transaction.update({
              where: { id },
              data: { tags: input.tags },
            })
          );
        }
      } else {
        // Get current tags for add/remove operations
        const transactions = await ctx.db.transaction.findMany({
          where: { id: { in: input.transactionIds } },
          select: { id: true, tags: true },
        });

        for (const tx of transactions) {
          const currentTags = tx.tags || [];
          let newTags;

          if (input.operation === 'add') {
            // Add tags without duplicates
            newTags = [...new Set([...currentTags, ...input.tags])];
          } else {
            // Remove specified tags
            newTags = currentTags.filter((tag) => !input.tags.includes(tag));
          }

          updates.push(
            ctx.db.transaction.update({
              where: { id: tx.id },
              data: { tags: newTags },
            })
          );
        }
      }

      await Promise.all(updates);
      return { count: updates.length };
    }),

  // Similar implementations for other bulk updates
});
```

## Testing Plan

1. **Manual Testing:**

   - Test updating each field in the transaction details sheet
   - Verify changes are reflected in the UI immediately
   - Test the dropdown functionality in the data table
   - Test bulk updates with multiple selected transactions
   - Verify proper error handling when updates fail

2. **Edge Cases to Test:**

   - Adding/removing multiple tags at once
   - Assigning to team members with different permission levels
   - Network failures during updates
   - Concurrent updates from multiple users

3. **Integration Testing:**
   - Test that changes persist after page refreshes
   - Test filters based on updated fields
   - Test reporting features using these fields
   - Test notification systems related to assignments

## Future Enhancements

1. Implement tag suggestions based on transaction data
2. Create team workflows based on assignments
3. Add task assignments when transactions are assigned to team members
4. Implement webhooks for field changes to integrate with external systems
5. Add audit logging for field changes to track who changed what and when
6. Create advanced filtering based on combinations of these fields
7. Implement batch operations for common tag combinations
8. Develop reports and analytics based on these transaction attributes
9. Add automation rules that change fields based on transaction properties
