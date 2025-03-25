# Transaction "Add Note" Feature Implementation Plan

## Overview

This document outlines the implementation plan for adding a "Add Note" feature to transactions in the financial management platform. This feature will allow users to add and edit notes for a transaction through a modal dialog with a rich text editor, directly from the transaction details sheet.

## Current State Analysis

- The transaction detail sheet (TransactionSheetDetails) already displays transaction details when a user selects a transaction
- The application already has a field for notes in the TransactionInfoSection component displayed as `<FieldRenderer field="notes" label="Notes" isTextarea={true} />`
- The transaction schema already includes a `notes` field, which is listed in EDITABLE_FIELDS
- The system has existing TRPC procedures for updating transactions
- The application has UI components for modals and dialogs that can be leveraged
- The application has a rich text editor component (`@/registry/default/potion-ui/editor`) that can be used for notes editing
- The application has example editor templates in the `@/registry/default/example` directory

## Implementation Plan

### 1. Create Transaction Note Templates

First, we'll create 5 transaction note templates that users can choose from:

```typescript
// src/components/tables/transaction/components/transaction-note-templates.tsx
import type { Value } from '@udecode/plate';

// Template 1: Basic Transaction Note
export const basicNoteTemplate: Value = [
  {
    type: 'p',
    children: [{ text: 'Transaction Purpose: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Additional Details: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Follow-up Actions: ', bold: true }, { text: '' }],
  },
];

// Template 2: Business Expense Note
export const businessExpenseTemplate: Value = [
  {
    type: 'p',
    children: [{ text: 'Business Purpose: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Category: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Attendees: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Tax Deductible: ', bold: true }, { text: 'Yes/No' }],
  },
  {
    type: 'p',
    children: [
      { text: 'Receipt Status: ', bold: true },
      { text: 'Attached/Not Attached' },
    ],
  },
];

// Template 3: Customer/Client Transaction Note
export const clientTransactionTemplate: Value = [
  {
    type: 'p',
    children: [{ text: 'Client/Customer: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Project: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Invoice #: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Payment Status: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Notes: ', bold: true }, { text: '' }],
  },
];

// Template 4: Recurring Transaction Note
export const recurringTransactionTemplate: Value = [
  {
    type: 'p',
    children: [
      { text: 'Recurring Frequency: ', bold: true },
      { text: 'Monthly/Weekly/Annual' },
    ],
  },
  {
    type: 'p',
    children: [{ text: 'Subscription Name: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Next Payment Date: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [
      { text: 'Auto-Renewal Status: ', bold: true },
      { text: 'Active/Canceled' },
    ],
  },
  {
    type: 'p',
    children: [{ text: 'Renewal Notes: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Budget Category: ', bold: true }, { text: '' }],
  },
];

// Template 5: Dispute or Issue Documentation
export const disputeDocumentationTemplate: Value = [
  {
    type: 'p',
    children: [
      { text: 'Issue Type: ', bold: true },
      { text: 'Unauthorized Charge/Double Billing/Wrong Amount/Other' },
    ],
  },
  {
    type: 'p',
    children: [{ text: 'Date Reported: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Reported To: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Case/Reference Number: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Issue Description: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Resolution Steps Taken: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [
      { text: 'Expected Resolution Date: ', bold: true },
      { text: '' },
    ],
  },
  {
    type: 'p',
    children: [
      { text: 'Resolution Status: ', bold: true },
      { text: 'Pending/Resolved/Rejected' },
    ],
  },
];

// Template options for the dropdown
export const NOTE_TEMPLATES = [
  { label: 'Basic Note', value: 'basic', template: basicNoteTemplate },
  {
    label: 'Business Expense',
    value: 'business',
    template: businessExpenseTemplate,
  },
  {
    label: 'Client Transaction',
    value: 'client',
    template: clientTransactionTemplate,
  },
  {
    label: 'Recurring Transaction',
    value: 'recurring',
    template: recurringTransactionTemplate,
  },
  {
    label: 'Dispute Documentation',
    value: 'dispute',
    template: disputeDocumentationTemplate,
  },
];
```

### 2. Create a Note Editor Modal Component with Template Selection

Now, we'll create a modal component for editing transaction notes with template selection:

```typescript
// src/components/tables/transaction/components/transaction-note-modal.tsx
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { Value } from '@udecode/plate';
import { Plate } from '@udecode/plate/react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/registry/default/potion-ui/dialog';
import { Button } from '@/registry/default/potion-ui/button';
import { Editor, EditorContainer } from '@/registry/default/potion-ui/editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useUpdateTransaction } from '@/trpc/hooks/transaction-hooks';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import { NOTE_TEMPLATES } from './transaction-note-templates';
import { toast } from 'sonner';

interface TransactionNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  initialNotes: string | null | undefined;
  onSuccess?: () => void;
}

export function TransactionNoteModal({
  isOpen,
  onClose,
  transactionId,
  initialNotes,
  onSuccess,
}: TransactionNoteModalProps) {
  // Convert notes string to initial Plate editor value
  const initialValue = initialNotes
    ? [{ type: 'p', children: [{ text: initialNotes }] }]
    : [{ type: 'p', children: [{ text: '' }] }];

  const [currentValue, setCurrentValue] = useState<Value>(initialValue);
  const updateTransaction = useUpdateTransaction();

  // Create editor instance with the current value
  const editor = useCreateEditor({
    id: `transaction-notes-${transactionId}`,
    value: currentValue,
  });

  // Reset editor value when modal opens with new transaction
  useEffect(() => {
    if (isOpen) {
      const newValue = initialNotes
        ? [{ type: 'p', children: [{ text: initialNotes }] }]
        : [{ type: 'p', children: [{ text: '' }] }];

      setCurrentValue(newValue);
    }
  }, [isOpen, initialNotes]);

  // Apply selected template
  const applyTemplate = (templateId: string) => {
    const template = NOTE_TEMPLATES.find(t => t.value === templateId);
    if (template) {
      setCurrentValue(template.template);
      // Need to reset the editor with the new value
      if (editor) {
        editor.resetDOM(template.template);
      }
    }
  };

  // Convert editor value to plain text for storage
  const getPlainTextFromValue = (value: Value): string => {
    return value
      .map(node =>
        'children' in node
          ? node.children
              .map(child => 'text' in child ? child.text : '')
              .join('')
          : ''
      )
      .join('\n')
      .trim();
  };

  const handleSave = () => {
    if (!transactionId) return;

    // Convert rich text value to plain text for storage
    const plainTextNotes = getPlainTextFromValue(currentValue);

    updateTransaction.mutate(
      {
        id: transactionId,
        data: { notes: plainTextNotes },
      },
      {
        onSuccess: () => {
          toast.success('Transaction notes updated');
          onClose();
          if (onSuccess) {
            onSuccess();
          }
        },
        onError: (error) => {
          toast.error(`Failed to update notes: ${error.message}`);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Transaction Notes</DialogTitle>
          <DialogDescription>
            Add or edit notes for this transaction. Notes can include details about purpose, context, or follow-up actions.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Template selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Template:</span>
            <Select onValueChange={applyTemplate}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {NOTE_TEMPLATES.map(template => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Editor */}
          <Plate
            editor={editor}
            onValueChange={({ value }) => {
              setCurrentValue(value);
            }}
          >
            <EditorContainer className="min-h-[200px] border border-input rounded-md">
              <Editor
                variant="comment"
                placeholder="Enter notes about this transaction..."
              />
            </EditorContainer>
          </Plate>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={updateTransaction.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateTransaction.isPending}
          >
            {updateTransaction.isPending ? 'Saving...' : 'Save Notes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 3. Modify the TransactionInfoSection Component

Update the TransactionInfoSection component to include the modal and replace the notes FieldRenderer with a custom implementation that shows an edit button:

```typescript
// in src/components/tables/transaction/components/transaction-info-section.tsx

import { useState } from 'react';
import { Edit, Plus } from 'lucide-react';
import { TransactionNoteModal } from './transaction-note-modal';

// Inside the TransactionInfoSection component:
export function TransactionInfoSection() {
  const { transaction, onUpdate } = useTransactionContext();
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Handler to open the note modal
  const handleOpenNoteModal = () => {
    setIsNoteModalOpen(true);
  };

  return (
    <TransactionSection
      title="Transaction Information"
      icon={<Info className="h-4 w-4" />}
      defaultOpen={true}
      tooltip={sectionDescriptions.transactionInformation}
    >
      <div className="space-y-1">
        <FieldRenderer field="name" label="Name" />
        <TransactionAmountField />
        <TransactionDateField />
        <TransactionStatusField />
        <FieldRenderer field="description" label="Description" />

        {/* Custom Notes field with edit button */}
        <div className="mb-1 flex flex-col space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Notes</label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 py-0 px-2 text-xs"
              onClick={handleOpenNoteModal}
            >
              {transaction.notes ? (
                <>
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </>
              ) : (
                <>
                  <Plus className="mr-1 h-3 w-3" />
                  Add
                </>
              )}
            </Button>
          </div>

          {transaction.notes ? (
            <div className="whitespace-pre-wrap rounded-md bg-muted/50 p-2 text-sm">
              {transaction.notes}
            </div>
          ) : (
            <div className="italic text-sm text-muted-foreground">No notes</div>
          )}
        </div>

        {/* Note Modal */}
        <TransactionNoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          transactionId={transaction.id}
          initialNotes={transaction.notes}
          onSuccess={onUpdate}
        />
      </div>
    </TransactionSection>
  );
}
```

### 4. Ensure Transaction Context Includes onUpdate Handler

Make sure the `TransactionContext` properly passes the `onUpdate` callback to child components:

```typescript
// in src/components/tables/transaction/components/transaction-context.tsx

// Inside TransactionProvider component:
export function TransactionProvider({
  transaction,
  onUpdate,
  children,
}: {
  transaction: TransactionData;
  onUpdate?: (updatedData: any) => void;
  children: React.ReactNode;
}) {
  // ... existing code

  // Make sure the context includes the onUpdate callback
  const contextValue = {
    transaction,
    editedValues,
    isEditMode,
    setIsEditMode,
    handleFieldChange,
    formatAmount,
    isEditable,
    onUpdate, // Pass this down to child components
  };

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  );
}
```

### 5. Update the Transaction Schema (if necessary)

Verify that the transaction schema includes the notes field and it's properly defined:

```typescript
// Check in src/components/tables/transaction/schema.ts or relevant file

export const transactionSchema = z.object({
  // ... other fields
  notes: z.string().nullable().optional(),
  // ... other fields
});
```

## Testing Plan

1. **Manual Testing:**
   - Test opening the note modal from both empty and existing note states
   - Verify the rich text editor loads properly and allows formatting
   - Test saving notes with various formatting and verify the UI displays them properly
   - Test each template to ensure they load properly into the editor
   - Test switching between templates in the same editing session
   - Verify line breaks and other formatting are preserved when editing existing notes
   - Test cancellation functionality
   - Verify error handling when updates fail
   - Ensure modals close properly after saving

## Future Enhancements

1. Implement more rich text formatting options in the transaction notes editor
2. Add support for attaching images or documents to transaction notes
3. Allow users to create and save their own custom note templates
4. Add category-specific templates that are suggested based on transaction type
5. Add version history for transaction notes
6. Implement note collaboration features for team accounts
7. Add support for tagging users in notes for team accounts
8. Implement note categorization or tagging system
9. Add note search functionality
