# Transaction Category Update Feature Implementation Plan

## Overview

This document outlines the plan for implementing a feature that allows users to manually update transaction categories in the financial management platform. Users will be able to change a transaction's category directly from the transaction details sheet by interacting with the category field in the Categorization section.

## Current State Analysis

- The application has a transaction detail sheet that displays transaction information in sections, including a Categorization section
- The Categorization section already shows the transaction category as a read-only badge when not in edit mode
- The backend has a TRPC procedure `updateCategory` in the transactions router
- There is an existing React hook `useUpdateTransactionCategory()` for frontend use
- The transaction interface already has fields for `category`, `subCategory`, and `customCategory`
- The `FieldRenderer` component supports editing for select fields in edit mode

## Implementation Plan

### 1. Enhance the Category Field in the Categorization Section

The existing implementation already allows editing the category field in edit mode. We'll improve the user experience by:

```typescript
// in src/components/tables/transaction/components/categorization-section.tsx
// Inside CategorizationSection component:
// Update the FieldRenderer for category to show a visual indicator that it's editable

<FieldRenderer
  field="category"
  label="Category"
  isSelect={true}
  selectOptions={categoryOptions}
  isBadge={!!transaction.category}
  interactive={!isEditMode} // Make it interactive when not in edit mode
  onClick={() => {
    // Toggle edit mode when clicked outside of edit mode
    if (!isEditMode) {
      enterEditMode();
    }
  }}
  hoverText="Click to update category"
/>
```

### 2. Update the Transaction Context to Handle Direct Category Updates

```typescript
// in src/components/tables/transaction/components/transaction-context.tsx

// Add a specific method for handling category updates
const updateCategory = useUpdateTransactionCategory();

// Inside TransactionProvider component:
const enterEditModeForCategory = () => {
  setEditedValues((prev) => ({
    ...prev,
    category: transaction.category || '',
  }));
  setIsEditMode(true);
  // Optionally scroll to the categorization section
};

// Expose the method in the context value
const contextValue = {
  // ... existing context values
  enterEditModeForCategory,
};
```

### 3. Add a Quick Category Update Button

Add a dedicated button in the Transaction actions to quickly update the category:

```typescript
// in src/components/tables/transaction/components/transaction-actions.tsx

// Add a new button to the actions
<Button
  variant="outline"
  size="sm"
  onClick={() => enterEditModeForCategory()}
>
  <Tag className="mr-2 h-4 w-4" />
  Update Category
</Button>
```

### 4. Implement Direct Category Update from DataTable

To allow users to update categories without opening the transaction details:

```typescript
// in src/components/tables/transaction/columns.tsx

// Add a context menu to the category cell
{
  accessorKey: 'category',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Category" />
  ),
  cell: ({ row }) => {
    const category = row.getValue('category') as keyof typeof categoryColors | null;
    const customCategory = row.original.customCategory;
    const updateCategory = useUpdateTransactionCategory();

    const handleCategoryUpdate = (newCategory: string) => {
      if (!row.original.id) return;

      updateCategory.mutate(
        {
          id: row.original.id,
          category: newCategory as TransactionCategory
        },
        {
          onSuccess: () => {
            // The transaction will be updated automatically
            // due to the optimistic updates in the hook
          },
          onError: (error) => {
            console.error('Update category error:', error);
          },
        }
      );
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="flex items-center justify-center p-0.5">
              {category && categoryColors[category].icon}
            </div>
            <Badge
              className={`${category ? categoryColors[category].badge : ''} rounded-md px-2 py-1 text-xs font-medium shadow-sm transition-all duration-200`}
            >
              {category ? category.replaceAll(/_/g, ' ') : customCategory || 'Uncategorized'}
            </Badge>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Update Category</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.values(TransactionCategory).map((cat) => (
            <DropdownMenuItem
              key={cat}
              onClick={() => handleCategoryUpdate(cat)}
              className="flex items-center gap-2"
            >
              <div className="flex items-center justify-center p-0.5">
                {categoryColors[cat as keyof typeof categoryColors].icon}
              </div>
              <span>{cat.replaceAll(/_/g, ' ')}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
```

### 5. Add Bulk Category Update

Allow users to update categories for multiple transactions at once:

```typescript
// in src/components/tables/transaction/data-table-toolbar.tsx

// Add a bulk action button to the toolbar when rows are selected
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm">
      <Tag className="mr-2 h-4 w-4" />
      Categorize Selected
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Update Categories</DropdownMenuLabel>
    <DropdownMenuSeparator />
    {Object.values(TransactionCategory).map((cat) => (
      <DropdownMenuItem
        key={cat}
        onClick={() => handleBulkCategoryUpdate(cat)}
        className="flex items-center gap-2"
      >
        <div className="flex items-center justify-center p-0.5">
          {categoryColors[cat as keyof typeof categoryColors].icon}
        </div>
        <span>{cat.replaceAll(/_/g, ' ')}</span>
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>

// Add the handler function
const handleBulkCategoryUpdate = (category: string) => {
  const selectedTransactionIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id);

  if (selectedTransactionIds.length === 0) return;

  // Use the manualCategorization procedure
  api.transactions.manualCategorization.mutate(
    {
      transactionIds: selectedTransactionIds,
      category: category as TransactionCategory,
    },
    {
      onSuccess: () => {
        // Clear selection after update
        table.resetRowSelection();
        // Refresh the table data
        refetch();
      },
      onError: (error) => {
        console.error('Bulk update error:', error);
      },
    }
  );
};
```

## Testing Plan

1. **Manual Testing:**

   - Test updating a transaction's category in the details sheet
   - Verify the category change is reflected in the UI immediately (optimistic updates)
   - Test the category dropdown functionality in the data table
   - Test bulk category updates with multiple selected transactions
   - Verify proper error handling when updates fail

2. **Edge Cases to Test:**
   - Updating category for transactions with existing subcategories
   - Network failures during category updates
   - Permissions issues (if a user tries to update a transaction they don't own)

## Future Enhancements

1. Add ability to create and manage custom categories
2. Implement AI-suggested categories based on transaction patterns
3. Add category rules to automatically categorize transactions based on criteria
4. Create a dedicated category management page for users to organize their categories
5. Add visual indicators of category changes in the transaction history
6. Implement category-based reporting and analytics features
