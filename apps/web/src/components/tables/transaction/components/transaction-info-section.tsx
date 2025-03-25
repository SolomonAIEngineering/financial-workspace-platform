import { Edit2, Info, Loader2, Save, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
  TransactionStatus,
  TransactionStatusMetadata,
  getStatusBadgeType,
  getTransactionStatusOptions,
  isStatusTransitionAllowed,
} from '@/constants/transaction-status';
import {
  useCompleteTransaction,
  useUpdateTransaction,
  useUpdateTransactionStatus,
} from '@/trpc/hooks/transaction-hooks';

import { Button } from '@/registry/default/potion-ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { DatePicker } from '@/components/ui/date-picker';
import { DetailRow } from './detail-row';
import { EditableDetailRow } from './editable-detail-row';
import { FieldRenderer } from './field-renderer';
import { Input } from '@/registry/default/potion-ui/input';
import { Textarea } from '@/registry/default/potion-ui/textarea';
import { TransactionSection } from './transaction-section';
import { cn } from '@/lib/utils';
import { fieldDescriptions } from './field-descriptions';
import { sectionDescriptions } from './section-descriptions';
import { toast } from 'sonner';
import { useTransactionContext } from './transaction-context';

/** InlineEditableField component for editing transaction fields inline */
interface InlineEditableFieldProps {
  field: string;
  label: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  icon: React.ReactNode;
  placeholder: string;
  tooltip?: string;
  isTextarea?: boolean;
  onSave: (field: string, value: string) => Promise<void>;
  isSaving: boolean;
}

function InlineEditableField({
  field,
  label,
  value,
  setValue,
  isEditing,
  setIsEditing,
  inputRef,
  icon,
  placeholder,
  tooltip,
  isTextarea = false,
  onSave,
  isSaving,
}: InlineEditableFieldProps) {
  // Handle keydown events
  const handleKeyDown = async (
    e: React.KeyboardEvent,
    field: string,
    value: string
  ) => {
    if (e.key === 'Enter' && !isTextarea) {
      await onSave(field, value);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        'relative mb-2 flex flex-col rounded-xl transition-all duration-300',
        isEditing
          ? 'border border-violet-200/40 bg-gradient-to-br from-violet-50/80 to-indigo-50/50 shadow-sm'
          : 'hover:bg-violet-50/20'
      )}
    >
      <div className="flex items-center justify-between px-3 pt-2">
        <span
          className={cn(
            'text-xs font-medium transition-colors duration-200',
            isEditing ? 'text-violet-700' : 'text-foreground/70'
          )}
          title={tooltip || ''}
        >
          {label}
        </span>

        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-6 w-6 rounded-full bg-transparent text-muted-foreground/50 transition-all duration-200',
              'hover:scale-105 hover:bg-violet-100/70 hover:text-violet-700',
              'focus:ring-2 focus:ring-violet-200 focus:ring-offset-1 focus:outline-none'
            )}
            onClick={() => setIsEditing(true)}
            title="Edit"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="px-3 pt-1 pb-3">
          <div className="relative">
            {isTextarea ? (
              <Textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={cn(
                  'w-full rounded-lg border-violet-200/60 bg-white/80 text-sm shadow-sm backdrop-blur-sm',
                  'focus:border-violet-300 focus:ring-2 focus:ring-violet-200/50 focus:ring-offset-0',
                  'transition-all duration-200 placeholder:text-violet-300',
                  'min-h-[100px] resize-y'
                )}
                placeholder={placeholder}
                disabled={isSaving}
              />
            ) : (
              <Input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, field, value)}
                className={cn(
                  'h-9 w-full rounded-lg border-violet-200/60 bg-white/80 pr-16 pl-3 text-sm shadow-sm backdrop-blur-sm',
                  'focus:border-violet-300 focus:ring-2 focus:ring-violet-200/50 focus:ring-offset-0',
                  'transition-all duration-200 placeholder:text-violet-300'
                )}
                placeholder={placeholder}
                disabled={isSaving}
              />
            )}
            <div className="absolute top-1 right-1 flex items-center gap-1 rounded-lg bg-white/20 backdrop-blur-sm transition-opacity">
              <Button
                size="sm"
                className={cn(
                  'h-7 w-7 rounded-lg bg-transparent p-0',
                  'text-rose-500 hover:bg-rose-50 hover:text-rose-600',
                  'transition-all duration-200 hover:scale-105',
                  'focus:ring-2 focus:ring-rose-200 focus:outline-none'
                )}
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                title="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                className={cn(
                  'h-7 w-7 rounded-lg bg-transparent p-0',
                  'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600',
                  'transition-all duration-200 hover:scale-105',
                  'focus:ring-2 focus:ring-emerald-200 focus:outline-none'
                )}
                onClick={() => onSave(field, value)}
                disabled={isSaving}
                title="Save"
              >
                <Save
                  className={cn('h-3.5 w-3.5', isSaving && 'animate-spin')}
                />
              </Button>
            </div>
          </div>
          <p className="mt-1 text-xs text-violet-500/70 italic">
            {isTextarea
              ? 'Click Save when done'
              : 'Press Enter to save, Esc to cancel'}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            'group relative cursor-pointer rounded-lg px-3 py-2 text-sm',
            'transition-all duration-200 hover:bg-violet-50/80',
            'flex items-center justify-between'
          )}
          onClick={() => setIsEditing(true)}
        >
          <div className="flex items-center gap-2">
            {icon}
            <div className="truncate">
              {value ? (
                <span className="font-medium text-foreground/90">{value}</span>
              ) : (
                <span className="text-muted-foreground/60 italic">
                  No {label.toLowerCase()}
                </span>
              )}
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="mr-2 text-xs text-violet-500">Edit</span>
            <div className="flex h-full items-center rounded-l-full bg-violet-100/80 px-2">
              <Edit2 className="h-3 w-3 text-violet-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** InlineEditableTransaction Section component */
function InlineEditableTransaction() {
  const { transaction, updateTransactionData } = useTransactionContext();
  const updateTransaction = useUpdateTransaction();

  // State for transaction name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [transactionName, setTransactionName] = useState(
    transaction.name || ''
  );
  const nameInputRef = useRef<HTMLInputElement>(null);

  // State for transaction description editing
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [transactionDescription, setTransactionDescription] = useState(
    transaction.description || ''
  );
  const descriptionInputRef = useRef<HTMLInputElement>(null);

  // State for transaction notes editing
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [transactionNotes, setTransactionNotes] = useState(
    transaction.notes || ''
  );
  const notesInputRef = useRef<HTMLTextAreaElement>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Update local state when transaction changes
  useEffect(() => {
    setTransactionName(transaction.name || '');
    setTransactionDescription(transaction.description || '');
    setTransactionNotes(transaction.notes || '');
  }, [transaction.name, transaction.description, transaction.notes]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [isEditingDescription]);

  useEffect(() => {
    if (isEditingNotes && notesInputRef.current) {
      notesInputRef.current.focus();
    }
  }, [isEditingNotes]);

  // Save handler for transaction fields
  const handleSaveField = async (field: string, value: string) => {
    if (!transaction.id) return;

    setIsSaving(true);
    try {
      // Create update object
      const updateData = {
        id: transaction.id,
        data: {
          [field]: value,
        },
      };

      // Update the transaction
      updateTransaction.mutate(updateData, {
        onSuccess: () => {
          // Update the transaction data via context to reflect the changes locally
          updateTransactionData({
            [field]: value,
          });

          toast.success(
            `Transaction ${field.toLowerCase()} updated successfully`
          );
        },
        onError: (error) => {
          console.error(`Failed to update transaction ${field}:`, error);
          toast.error(`Failed to update transaction ${field}`);
        },
        onSettled: () => {
          setIsSaving(false);

          // Reset all editing states
          setIsEditingName(false);
          setIsEditingDescription(false);
          setIsEditingNotes(false);
        },
      });
    } catch (error) {
      console.error(`Failed to update transaction ${field}:`, error);
      toast.error(`Failed to update transaction ${field}`);
      setIsSaving(false);
    }
  };

  return (
    <>
      <InlineEditableField
        field="name"
        label="Name"
        value={transactionName}
        setValue={setTransactionName}
        isEditing={isEditingName}
        setIsEditing={setIsEditingName}
        inputRef={nameInputRef as React.RefObject<HTMLInputElement | HTMLTextAreaElement>}
        icon={<Info className="h-3.5 w-3.5 text-violet-500/70" />}
        placeholder="Enter transaction name"
        tooltip={fieldDescriptions.name}
        onSave={handleSaveField}
        isSaving={isSaving}
      />

      <TransactionAmountField />
      <TransactionDateField />
      <TransactionStatusField />

      <InlineEditableField
        field="description"
        label="Description"
        value={transactionDescription}
        setValue={setTransactionDescription}
        isEditing={isEditingDescription}
        setIsEditing={setIsEditingDescription}
        inputRef={descriptionInputRef as React.RefObject<HTMLInputElement | HTMLTextAreaElement>}
        icon={<Info className="h-3.5 w-3.5 text-violet-500/70" />}
        placeholder="Enter transaction description"
        tooltip={fieldDescriptions.description}
        onSave={handleSaveField}
        isSaving={isSaving}
      />

      <InlineEditableField
        field="notes"
        label="Notes"
        value={transactionNotes}
        setValue={setTransactionNotes}
        isEditing={isEditingNotes}
        setIsEditing={setIsEditingNotes}
        inputRef={notesInputRef as React.RefObject<HTMLTextAreaElement>}
        icon={<Info className="h-3.5 w-3.5 text-violet-500/70" />}
        placeholder="Enter transaction notes"
        tooltip={fieldDescriptions.notes}
        isTextarea
        onSave={handleSaveField}
        isSaving={isSaving}
      />
    </>
  );
}

/** TransactionAmountField Component - with inline editing support */
function TransactionAmountField() {
  const {
    transaction,
    formatAmount,
    isEditMode,
    handleFieldChange,
    editedValues,
    updateTransactionData,
  } = useTransactionContext();
  const updateTransaction = useUpdateTransaction();

  const [isEditing, setIsEditing] = useState(false);
  const [amountValue, setAmountValue] = useState<number>(transaction.amount);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAmountValue(transaction.amount);
  }, [transaction.amount]);

  // Handle keydown events for saving when Enter is pressed
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setAmountValue(transaction.amount);
      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    if (!transaction.id) return;

    setIsSaving(true);
    try {
      // Create update object
      const updateData = {
        id: transaction.id,
        data: {
          amount: amountValue,
        },
      };

      // Update the transaction
      updateTransaction.mutate(updateData, {
        onSuccess: () => {
          // Update the transaction data via context to reflect the changes locally
          updateTransactionData({
            amount: amountValue,
          });

          toast.success('Transaction amount updated successfully');
        },
        onError: (error) => {
          console.error('Failed to update transaction amount:', error);
          toast.error('Failed to update transaction amount');
        },
        onSettled: () => {
          setIsSaving(false);
          setIsEditing(false);
        },
      });
    } catch (error) {
      console.error('Failed to update transaction amount:', error);
      toast.error('Failed to update transaction amount');
      setIsSaving(false);
    }
  };

  // If we're in the standard edit mode, use the original component
  if (isEditMode) {
    return (
      <EditableDetailRow label="Amount" tooltip={fieldDescriptions.amount}>
        <CurrencyInput
          value={amountValue}
          onChange={(value) => {
            setAmountValue(value);
            handleFieldChange('amount', value);
          }}
          currency={transaction.isoCurrencyCode || 'USD'}
          className="w-full"
          placeholder="Enter transaction amount"
        />
      </EditableDetailRow>
    );
  }

  // For inline editing
  if (isEditing) {
    return (
      <div className="relative mb-2 flex flex-col rounded-xl border border-violet-200/40 bg-gradient-to-br from-violet-50/80 to-indigo-50/50 shadow-sm">
        <div className="flex items-center justify-between px-3 pt-2">
          <span
            className="text-xs font-medium text-violet-700"
            title={fieldDescriptions.amount}
          >
            Amount
          </span>
        </div>
        <div className="px-3 pt-1 pb-3">
          <div className="relative">
            <CurrencyInput
              value={amountValue}
              onChange={setAmountValue}
              onKeyDown={handleKeyDown}
              currency={transaction.isoCurrencyCode || 'USD'}
              className="h-9 w-full rounded-lg border-violet-200/60 bg-white/80 pr-16 pl-3 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 placeholder:text-violet-300 focus:border-violet-300 focus:ring-2 focus:ring-violet-200/50 focus:ring-offset-0"
              placeholder="Enter transaction amount"
              disabled={isSaving}
            />
            <div className="absolute top-1 right-1 flex items-center gap-1 rounded-lg bg-white/20 backdrop-blur-sm transition-opacity">
              <Button
                size="sm"
                className={cn(
                  'h-7 w-7 rounded-lg bg-transparent p-0',
                  'text-rose-500 hover:bg-rose-50 hover:text-rose-600',
                  'transition-all duration-200 hover:scale-105',
                  'focus:ring-2 focus:ring-rose-200 focus:outline-none'
                )}
                onClick={() => {
                  setAmountValue(transaction.amount);
                  setIsEditing(false);
                }}
                disabled={isSaving}
                title="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                className={cn(
                  'h-7 w-7 rounded-lg bg-transparent p-0',
                  'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600',
                  'transition-all duration-200 hover:scale-105',
                  'focus:ring-2 focus:ring-emerald-200 focus:outline-none'
                )}
                onClick={handleSave}
                disabled={isSaving}
                title="Save"
              >
                <Save
                  className={cn('h-3.5 w-3.5', isSaving && 'animate-spin')}
                />
              </Button>
            </div>
          </div>
          <p className="mt-1 text-xs text-violet-500/70 italic">
            Press Enter to save, Esc to cancel
          </p>
        </div>
      </div>
    );
  }

  // Normal display mode
  return (
    <div className="relative mb-2 flex flex-col rounded-xl transition-all duration-300 hover:bg-violet-50/20">
      <div className="flex items-center justify-between px-3 pt-2">
        <span
          className="text-xs font-medium text-foreground/70"
          title={fieldDescriptions.amount}
        >
          Amount
        </span>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-6 w-6 rounded-full bg-transparent text-muted-foreground/50 transition-all duration-200',
            'hover:scale-105 hover:bg-violet-100/70 hover:text-violet-700',
            'focus:ring-2 focus:ring-violet-200 focus:ring-offset-1 focus:outline-none'
          )}
          onClick={() => setIsEditing(true)}
          title="Edit"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>
      <div
        className={cn(
          'group relative cursor-pointer rounded-lg px-3 py-2 text-sm',
          'transition-all duration-200 hover:bg-violet-50/80',
          'flex items-center justify-between'
        )}
        onClick={() => setIsEditing(true)}
      >
        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-violet-500/70" />
          <div
            className={`truncate font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-500'}`}
          >
            {formatAmount(transaction.amount, transaction.isoCurrencyCode)}
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center opacity-0 transition-opacity group-hover:opacity-100">
          <span className="mr-2 text-xs text-violet-500">Edit</span>
          <div className="flex h-full items-center rounded-l-full bg-violet-100/80 px-2">
            <Edit2 className="h-3 w-3 text-violet-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** TransactionDateField Component - with inline editing support */
function TransactionDateField() {
  const {
    transaction,
    formatDateTime,
    isEditMode,
    handleFieldChange,
    editedValues,
    updateTransactionData,
  } = useTransactionContext();
  const updateTransaction = useUpdateTransaction();

  const [isEditing, setIsEditing] = useState(false);
  const [dateValue, setDateValue] = useState<Date | undefined>(
    transaction.date ? new Date(transaction.date) : undefined
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (transaction.date) {
      setDateValue(new Date(transaction.date));
    }
  }, [transaction.date]);

  const handleSave = async () => {
    if (!transaction.id || !dateValue) return;

    setIsSaving(true);
    try {
      // Create update object - convert Date to ISO string for the API
      const updateData = {
        id: transaction.id,
        data: {
          date: dateValue.toISOString(), // Convert Date to ISO string format
        },
      };

      // Update the transaction
      updateTransaction.mutate(updateData, {
        onSuccess: () => {
          // Update the transaction data via context to reflect the changes locally
          // The context can handle the Date object directly
          updateTransactionData({
            date: dateValue,
          });

          toast.success('Transaction date updated successfully');
        },
        onError: (error) => {
          console.error('Failed to update transaction date:', error);
          toast.error(`Failed to update transaction date: ${error.message}`);
        },
        onSettled: () => {
          setIsSaving(false);
          setIsEditing(false);
        },
      });
    } catch (error) {
      console.error('Failed to update transaction date:', error);
      toast.error(
        `Failed to update transaction date: ${error instanceof Error ? error.message : String(error)}`
      );
      setIsSaving(false);
    }
  };

  // If we're in the standard edit mode, use the original component
  if (isEditMode) {
    return (
      <EditableDetailRow label="Date" tooltip={fieldDescriptions.date}>
        <DatePicker
          date={dateValue}
          onDateChange={(date) => {
            setDateValue(date);
            if (date) {
              handleFieldChange('date', date);
            }
          }}
          placeholder="Select transaction date"
          className="w-full"
        />
      </EditableDetailRow>
    );
  }

  // For inline editing
  if (isEditing) {
    return (
      <div className="relative mb-2 flex flex-col rounded-xl border border-violet-200/40 bg-gradient-to-br from-violet-50/80 to-indigo-50/50 shadow-sm">
        <div className="flex items-center justify-between px-3 pt-2">
          <span
            className="text-xs font-medium text-violet-700"
            title={fieldDescriptions.date}
          >
            Date
          </span>
        </div>
        <div className="px-3 pt-1 pb-3">
          <div className="relative">
            <div className="mb-2">
              <DatePicker
                date={dateValue}
                onDateChange={setDateValue}
                placeholder="Select transaction date"
                className="w-full"
              />
            </div>
            <div className="mt-2 flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  'h-8 rounded-md px-3 text-xs',
                  'border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600',
                  'transition-all duration-200'
                )}
                onClick={() => {
                  setDateValue(
                    transaction.date ? new Date(transaction.date) : undefined
                  );
                  setIsEditing(false);
                }}
                disabled={isSaving}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  'h-8 rounded-md px-3 text-xs',
                  'border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700',
                  'transition-all duration-200'
                )}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="mr-1 h-3.5 w-3.5" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal display mode
  return (
    <div className="relative mb-2 flex flex-col rounded-xl transition-all duration-300 hover:bg-violet-50/20">
      <div className="flex items-center justify-between px-3 pt-2">
        <span
          className="text-xs font-medium text-foreground/70"
          title={fieldDescriptions.date}
        >
          Date
        </span>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-6 w-6 rounded-full bg-transparent text-muted-foreground/50 transition-all duration-200',
            'hover:scale-105 hover:bg-violet-100/70 hover:text-violet-700',
            'focus:ring-2 focus:ring-violet-200 focus:ring-offset-1 focus:outline-none'
          )}
          onClick={() => setIsEditing(true)}
          title="Edit"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>
      <div
        className={cn(
          'group relative cursor-pointer rounded-lg px-3 py-2 text-sm',
          'transition-all duration-200 hover:bg-violet-50/80',
          'flex items-center justify-between'
        )}
        onClick={() => setIsEditing(true)}
      >
        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-violet-500/70" />
          <div className="truncate font-medium text-foreground/90">
            {formatDateTime(transaction.date)}
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center opacity-0 transition-opacity group-hover:opacity-100">
          <span className="mr-2 text-xs text-violet-500">Edit</span>
          <div className="flex h-full items-center rounded-l-full bg-violet-100/80 px-2">
            <Edit2 className="h-3 w-3 text-violet-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * TransactionStatusField Component
 *
 * Manages the transaction status display and editing functionality. Provides
 * different UI based on view/edit mode and current status value. Handles status
 * transitions, validation, and database updates.
 *
 * Features:
 *
 * - Immediate status updates that persist to the database
 * - Status transition validation based on business rules
 * - Visual indicators for status updates in progress
 * - Special handling for review states and approval requirements
 * - Contextual UI elements based on status type
 *
 * @example
 *   <TransactionStatusField />;
 *
 * @returns {JSX.Element} The rendered transaction status field component
 * @component
 */
function TransactionStatusField() {
  const { transaction, isEditMode, handleFieldChange, editedValues } =
    useTransactionContext();

  const completeTransaction = useCompleteTransaction();
  const updateTransactionStatus = useUpdateTransactionStatus();

  // UI state management
  const [statusErrorMessage, setStatusErrorMessage] = React.useState<
    string | null
  >(null);
  const [isStatusUpdating, setIsStatusUpdating] = React.useState(false);

  /**
   * Get the current effective status value, prioritizing edited values
   *
   * @returns {TransactionStatus} The current transaction status
   */
  const getStatusValue = (): TransactionStatus => {
    // First check editedValues
    if ('status' in editedValues && editedValues.status) {
      return editedValues.status as TransactionStatus;
    }

    // If transaction has a status field, use it
    if (transaction.status) {
      // Check if it's a valid TransactionStatus value
      if (
        Object.values(TransactionStatus).includes(
          transaction.status as TransactionStatus
        )
      ) {
        return transaction.status as TransactionStatus;
      }
    }

    // Fallback to legacy pending boolean
    return transaction.pending
      ? TransactionStatus.PENDING
      : TransactionStatus.COMPLETED;
  };

  /**
   * Get the description for a given status for tooltips and UI display
   *
   * @param {TransactionStatus} status - The status to get description for
   * @returns {string} The status description
   */
  const getStatusDescription = (status: TransactionStatus): string => {
    return (
      TransactionStatusMetadata[status]?.description ||
      'Current transaction status'
    );
  };

  /**
   * Handle a status change, validate transition, and update database
   *
   * @param {string} newStatus - The new status value
   */
  const handleStatusChange = (newStatus: string) => {
    const currentStatus = getStatusValue();
    const targetStatus = newStatus as TransactionStatus;

    // Check if this transition is allowed
    if (!isStatusTransitionAllowed(currentStatus, targetStatus)) {
      const allowedTransitions = TransactionStatusMetadata[
        currentStatus
      ].canTransitionTo
        .map((status) => TransactionStatusMetadata[status].label)
        .join(', ');

      const errorMsg = `Cannot change status from ${TransactionStatusMetadata[currentStatus].label} to ${TransactionStatusMetadata[targetStatus].label}. Allowed transitions: ${allowedTransitions}`;
      console.warn(errorMsg);
      setStatusErrorMessage(errorMsg);
      setTimeout(() => setStatusErrorMessage(null), 5000);
      return;
    }

    // Clear any previous error messages
    setStatusErrorMessage(null);

    // Update local state
    handleFieldChange('status', targetStatus);

    // Set loading state
    setIsStatusUpdating(true);

    // Update database
    updateTransactionStatus.mutate(
      { id: transaction.id, status: targetStatus },
      {
        onSuccess: () => {
          // Update UI state
          transaction.status = targetStatus;
          handleFieldChange('status', targetStatus);
          setIsStatusUpdating(false);
        },
        onError: (error) => {
          // Handle errors
          setStatusErrorMessage(`Failed to update status: ${error.message}`);
          setTimeout(() => setStatusErrorMessage(null), 5000);
          setIsStatusUpdating(false);
        },
      }
    );
  };

  /**
   * Mark a transaction as complete (dedicated handler for the quick action)
   *
   * @param {string} id - Transaction ID
   */
  const handleMarkAsComplete = (id: string) => {
    if (!id) return;

    setIsStatusUpdating(true);

    completeTransaction.mutate(
      { id },
      {
        onSuccess: () => {
          // Update status field for consistency
          updateTransactionStatus.mutate(
            { id, status: TransactionStatus.COMPLETED },
            {
              onSuccess: () => {
                // Update UI state
                handleFieldChange('status', TransactionStatus.COMPLETED);
                transaction.status = TransactionStatus.COMPLETED;
                setIsStatusUpdating(false);
              },
              onError: (error) => {
                console.error('Failed to update status field:', error);
                setIsStatusUpdating(false);
              },
            }
          );
        },
        onError: (error) => {
          setStatusErrorMessage(`Failed to mark as complete: ${error.message}`);
          setTimeout(() => setStatusErrorMessage(null), 5000);
          setIsStatusUpdating(false);
        },
      }
    );
  };

  // Current status data
  const currentStatus = getStatusValue();
  const statusMetadata = TransactionStatusMetadata[currentStatus];

  // Status options for dropdown
  const statusOptions = getTransactionStatusOptions();

  /**
   * Get filtered status options based on allowed transitions
   *
   * @returns {{ label: string; value: string }[]} Filtered status options
   */
  const getFilteredStatusOptions = () => {
    const allowedStatuses: Set<TransactionStatus> = new Set([
      currentStatus,
      ...TransactionStatusMetadata[currentStatus].canTransitionTo,
    ]);

    return statusOptions.filter((option) =>
      allowedStatuses.has(option.value as TransactionStatus)
    );
  };

  // Check if status requires review
  const needsReview = [
    TransactionStatus.AWAITING_REVIEW,
    TransactionStatus.UNDER_REVIEW,
    TransactionStatus.FLAGGED,
    TransactionStatus.DISPUTED,
    TransactionStatus.NEEDS_DOCUMENTATION,
    TransactionStatus.REQUIRES_APPROVAL,
    TransactionStatus.UNVERIFIED,
  ].includes(currentStatus);

  // Render edit mode
  if (isEditMode) {
    return (
      <>
        <EditableDetailRow
          label={isStatusUpdating ? 'Status (Updating...)' : 'Status'}
          tooltip={`${getStatusDescription(currentStatus)}${statusErrorMessage ? ` - ERROR: ${statusErrorMessage}` : ''}`}
          isSelect={true}
          options={getFilteredStatusOptions()}
          value={getStatusValue()}
          onChange={handleStatusChange}
        >
          {isStatusUpdating && (
            <div className="ml-2 inline-flex items-center">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            </div>
          )}
        </EditableDetailRow>

        {/* Review notice */}
        {needsReview && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
            <h4 className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-400">
              Review Required
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              This transaction is marked as{' '}
              <strong className="font-medium">{statusMetadata.label}</strong>{' '}
              and needs additional attention. {statusMetadata.description}
            </p>
            {statusMetadata.requiresApproval && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                <strong className="font-medium">Note:</strong> This status
                requires approval by an authorized team member.
              </p>
            )}
          </div>
        )}
      </>
    );
  }

  // Render view mode
  return (
    <>
      <DetailRow
        label={isStatusUpdating ? 'Status (Updating...)' : 'Status'}
        value={
          isStatusUpdating
            ? statusMetadata?.label + ' (Updating...)'
            : statusMetadata?.label || currentStatus
        }
        tooltip={getStatusDescription(currentStatus)}
        isBadge
        badgeType={getStatusBadgeType(currentStatus)}
        interactive={
          currentStatus === TransactionStatus.PENDING && !isStatusUpdating
        }
        onClick={
          currentStatus === TransactionStatus.PENDING && !isStatusUpdating
            ? () => handleMarkAsComplete(transaction.id)
            : undefined
        }
        hoverText={
          currentStatus === TransactionStatus.PENDING
            ? 'Click to mark as complete'
            : undefined
        }
      />

      {statusMetadata?.requiresApproval && (
        <DetailRow
          label="Approval Required"
          value="Yes"
          tooltip="This transaction status requires approval by an authorized team member"
          isBadge
          badgeType="warning"
        />
      )}

      {/* Review section */}
      {needsReview && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
          <h4 className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-400">
            Review Required
          </h4>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            This transaction is marked as{' '}
            <strong className="font-medium">{statusMetadata.label}</strong> and
            needs additional attention. {statusMetadata.description}
          </p>
          {statusMetadata.requiresApproval && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
              <strong className="font-medium">Note:</strong> This status
              requires approval by an authorized team member.
            </p>
          )}
          {currentStatus === TransactionStatus.NEEDS_DOCUMENTATION && (
            <div className="mt-2 flex items-center gap-2">
              <button className="inline-flex h-8 items-center rounded-md border border-amber-700 bg-amber-50 px-3 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:border-amber-500 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/60">
                Add Documentation
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/**
 * TransactionInfoSection Component
 *
 * The main container component for displaying transaction information. Now with
 * inline editing capabilities.
 */
export function TransactionInfoSection() {
  const { isEditMode } = useTransactionContext();

  return (
    <TransactionSection
      title="Transaction Information"
      icon={<Info className="h-4 w-4" />}
      defaultOpen={true}
      tooltip={sectionDescriptions.transactionInformation}
    >
      <div className="space-y-1">
        {isEditMode ? (
          <>
            <FieldRenderer field="name" label="Name" />
            <TransactionAmountField />
            <TransactionDateField />
            <TransactionStatusField />
            <FieldRenderer field="description" label="Description" />
            <FieldRenderer field="notes" label="Notes" isTextarea={true} />
          </>
        ) : (
          <>
            <InlineEditableTransaction />
          </>
        )}
      </div>
    </TransactionSection>
  );
}
