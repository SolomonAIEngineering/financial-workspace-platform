# Transaction "Mark as Complete" Feature Implementation Plan

## Overview

This document outlines the plan for implementing a "Mark as Complete" feature for transactions in the financial management platform. This feature will allow users to mark transactions as completed directly from the transaction details sheet by interacting with the status field.

## Current State Analysis

- The application has a transaction detail sheet (TransactionSheetDetails) that displays when a user selects a transaction from the data table
- The existing transaction system already has a backend TRPC procedure `completeTransaction` in the transactions router
- There is also a React hook `useCompleteTransaction()` available for frontend use
- The transaction status is currently shown in the TransactionInfoSection as a read-only badge

## Implementation Plan

### 1. Make the Status DetailRow Interactive

Instead of adding a separate button, we'll enhance the existing Status DetailRow to be interactive:

```typescript
// in src/components/tables/transaction/components/transaction-info-section.tsx
import { useCompleteTransaction } from '@/trpc/hooks/transaction-hooks';

// Inside TransactionInfoSection component:
const completeTransaction = useCompleteTransaction();

// Replace the existing DetailRow for status with an interactive version:
{transaction.pending ? (
  <DetailRow
    label="Status"
    value="Pending"
    tooltip={fieldDescriptions.status}
    isBadge
    badgeType="warning"
    onClick={() => handleMarkAsComplete(transaction.id)}
    interactive={true}
    hoverText="Click to mark as complete"
  />
) : (
  <DetailRow
    label="Status"
    value="Completed"
    tooltip={fieldDescriptions.status}
    isBadge
    badgeType="success"
  />
)}

// Add the handler function:
const handleMarkAsComplete = (id: string) => {
  if (!id) return;

  completeTransaction.mutate(
    { id },
    {
      onSuccess: () => {
        // The transaction context will be updated automatically
        // due to the optimistic updates in the useCompleteTransaction hook
      },
      onError: (error) => {
        console.error('Mark transaction as complete error:', error);
      },
    }
  );
};
```

### 2. Enhance the DetailRow Component

Update the DetailRow component to support interactivity:

```typescript
// in src/components/tables/transaction/components/detail-row.tsx

// Update the DetailRow interface:
interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  tooltip?: string;
  monospace?: boolean;
  isAmount?: boolean;
  amountType?: 'positive' | 'negative' | 'neutral';
  isBadge?: boolean;
  badgeType?: 'default' | 'success' | 'warning' | 'error' | 'info';
  interactive?: boolean; // New prop
  onClick?: () => void; // New prop
  hoverText?: string; // New prop
}

// Modify the badge rendering to be clickable when interactive:
{isBadge && (
  <div
    className={cn(
      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
      badgeVariants[badgeType || 'default'],
      interactive && "cursor-pointer hover:opacity-80 transition-opacity",
      interactive && "relative group"
    )}
    onClick={interactive ? onClick : undefined}
    role={interactive ? "button" : undefined}
    tabIndex={interactive ? 0 : undefined}
    onKeyDown={interactive ? (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    } : undefined}
  >
    {value}
    {interactive && hoverText && (
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded">
        {hoverText}
      </span>
    )}
  </div>
)}
```

### 3. Update the TransactionDetails Component

Make sure the parent component can handle the status update:

```typescript
// in src/components/tables/transaction/components/transaction-details.tsx
// Pass transaction ID and onUpdate to the TransactionInfoSection

<TransactionInfoSection
  onUpdateStatus={onUpdate}
/>
```

### 4. Update the DataTable Component

The `DataTable` component already passes the `refetch` callback to `TransactionSheetDetails` as `onDeleteSuccess` and `onCreateSuccess`. We should add `onUpdateSuccess` to ensure the table refreshes when a transaction is marked as complete:

```typescript
<TransactionSheetDetails
  onDeleteSuccess={refetch}
  onCreateSuccess={refetch}
  onUpdateSuccess={refetch}
/>
```

## Testing Plan

1. **Manual Testing:**
   - Test clicking on the status badge to mark pending transactions as complete
   - Verify the status changes visually in the UI
   - Verify the transaction list updates properly after the status change
   - Test with different transaction types and states
   - Verify proper error handling when the operation fails

## Future Enhancements

1. Add ability to mark multiple transactions as complete in bulk from the table
