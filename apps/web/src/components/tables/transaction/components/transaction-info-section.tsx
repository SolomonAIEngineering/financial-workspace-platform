import { Info, Loader2 } from 'lucide-react';
import {
  TransactionStatus,
  TransactionStatusMetadata,
  getStatusBadgeType,
  getTransactionStatusOptions,
  isStatusTransitionAllowed,
} from '@/constants/transaction-status';
import {
  useCompleteTransaction,
  useUpdateTransactionStatus,
} from '@/trpc/hooks/transaction-hooks';

import { CurrencyInput } from '@/components/ui/currency-input';
import { DatePicker } from '@/components/ui/date-picker';
import { DetailRow } from './detail-row';
import { EditableDetailRow } from './editable-detail-row';
import { FieldRenderer } from './field-renderer';
import React from 'react';
import { TransactionSection } from './transaction-section';
import { fieldDescriptions } from './field-descriptions';
import { sectionDescriptions } from './section-descriptions';
import { useTransactionContext } from './transaction-context';

/**
 * TransactionAmountField Component
 *
 * Responsible for rendering and managing the transaction amount field. The
 * component handles both view and edit modes, providing appropriate UI for
 * each.
 *
 * In view mode:
 *
 * - Displays formatted amount with currency
 * - Shows positive/negative styling based on amount value
 *
 * In edit mode:
 *
 * - Renders a currency input control
 * - Handles amount changes and updates the transaction context
 *
 * @example
 *   <TransactionAmountField />;
 *
 * @returns {JSX.Element} The rendered transaction amount field component
 * @component
 */
function TransactionAmountField() {
  const {
    transaction,
    formatAmount,
    isEditMode,
    handleFieldChange,
    editedValues,
  } = useTransactionContext();

  /**
   * Gets the current amount value, either from edited values or original
   * transaction
   *
   * @returns {number} The current transaction amount value
   */
  const getAmountValue = () => {
    return 'amount' in editedValues ? editedValues.amount : transaction.amount;
  };

  /**
   * Handles changes to the transaction amount
   *
   * @param {number} newAmount - The new amount value
   */
  const handleAmountChange = (newAmount: number) => {
    handleFieldChange('amount', newAmount);
  };

  if (isEditMode) {
    return (
      <EditableDetailRow label="Amount" tooltip={fieldDescriptions.amount}>
        <CurrencyInput
          value={getAmountValue()}
          onChange={handleAmountChange}
          currency={transaction.isoCurrencyCode || 'USD'}
          className="w-full"
          placeholder="Enter transaction amount"
        />
      </EditableDetailRow>
    );
  }

  return (
    <DetailRow
      label="Amount"
      value={formatAmount(transaction.amount, transaction.isoCurrencyCode)}
      tooltip={fieldDescriptions.amount}
      isAmount
      amountType={transaction.amount > 0 ? 'positive' : 'negative'}
    />
  );
}

/**
 * TransactionDateField Component
 *
 * Manages the display and editing of transaction dates. Handles date
 * formatting, conversion between string and Date objects, and provides
 * appropriate UI controls based on the current mode.
 *
 * In view mode:
 *
 * - Shows formatted date string
 *
 * In edit mode:
 *
 * - Renders a date picker control
 * - Handles date selections and updates
 *
 * @example
 *   <TransactionDateField />;
 *
 * @returns {JSX.Element} The rendered transaction date field component
 * @component
 */
function TransactionDateField() {
  const {
    transaction,
    formatDateTime,
    isEditMode,
    handleFieldChange,
    editedValues,
  } = useTransactionContext();

  /**
   * Converts and retrieves the current date value Handles different date
   * formats and prioritizes edited values
   *
   * @returns {Date | undefined} The current date as a Date object, or undefined
   *   if no date
   */
  const getDateValue = () => {
    // First check if we have an edited date value
    if ('date' in editedValues && editedValues.date) {
      return new Date(editedValues.date);
    }

    // Otherwise use the transaction date
    if (!transaction.date) return undefined;
    return transaction.date instanceof Date
      ? transaction.date
      : new Date(transaction.date);
  };

  /**
   * Handles changes to the transaction date
   *
   * @param {Date | undefined} newDate - The newly selected date
   */
  const handleDateChange = (newDate?: Date) => {
    if (newDate) {
      // Ensure we're passing a valid date object
      handleFieldChange('date', newDate);
    }
  };

  if (isEditMode) {
    return (
      <EditableDetailRow label="Date" tooltip={fieldDescriptions.date}>
        <DatePicker
          date={getDateValue()}
          onDateChange={handleDateChange}
          placeholder="Select transaction date"
          className="w-full"
        />
      </EditableDetailRow>
    );
  }

  return (
    <DetailRow
      label="Date"
      value={formatDateTime(transaction.date)}
      tooltip={fieldDescriptions.date}
    />
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
    const allowedStatuses = [
      currentStatus,
      ...TransactionStatusMetadata[currentStatus].canTransitionTo,
    ];

    return statusOptions.filter((option) =>
      allowedStatuses.includes(option.value as TransactionStatus)
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
 * The main container component for displaying transaction information.
 * Organizes and renders various transaction field components in a collapsible
 * section.
 *
 * Features:
 *
 * - Collapsible section with icon and tooltip
 * - Organized display of transaction details
 * - Default open state for immediate visibility
 * - Composition of specialized field components
 *
 * Field components include:
 *
 * - TransactionIdField: Displays the transaction ID
 * - FieldRenderer: Renders generic fields like name, description, notes
 * - TransactionAmountField: Handles transaction amount with currency
 * - TransactionDateField: Manages transaction date
 * - TransactionStatusField: Handles transaction status
 *
 * @example
 *   <TransactionInfoSection />;
 *
 * @returns {JSX.Element} The rendered transaction information section
 * @component
 */
export function TransactionInfoSection() {
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
        <FieldRenderer field="notes" label="Notes" isTextarea={true} />
      </div>
    </TransactionSection>
  );
}
