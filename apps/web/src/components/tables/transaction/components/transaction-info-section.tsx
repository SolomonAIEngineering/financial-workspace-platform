import { Info, Loader2 } from 'lucide-react';
import { TransactionStatus, TransactionStatusMetadata, getStatusBadgeType, getTransactionStatusOptions, isStatusTransitionAllowed } from '@/constants/transaction-status';
import { useCompleteTransaction, useUpdateTransactionStatus } from '@/trpc/hooks/transaction-hooks';

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
 * TransactionAmountField component handles displaying and editing the transaction amount
 */
function TransactionAmountField() {
    const {
        transaction,
        formatAmount,
        isEditMode,
        handleFieldChange,
        editedValues
    } = useTransactionContext();

    // Get the current amount value (original or edited)
    const getAmountValue = () => {
        return 'amount' in editedValues
            ? editedValues.amount
            : transaction.amount;
    };

    // Update transaction amount
    const handleAmountChange = (newAmount: number) => {
        console.log("Transaction amount changing to:", newAmount);
        handleFieldChange('amount', newAmount);
    };

    if (isEditMode) {
        return (
            <EditableDetailRow
                label="Amount"
                tooltip={fieldDescriptions.amount}
            >
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
            value={formatAmount(
                transaction.amount,
                transaction.isoCurrencyCode
            )}
            tooltip={fieldDescriptions.amount}
            isAmount
            amountType={transaction.amount > 0 ? 'positive' : 'negative'}
        />
    );
}

/**
 * TransactionDateField component handles displaying and editing the transaction date
 */
function TransactionDateField() {
    const {
        transaction,
        formatDateTime,
        isEditMode,
        handleFieldChange,
        editedValues
    } = useTransactionContext();

    // Convert string date to Date object if needed
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

    // Update transaction date
    const handleDateChange = (newDate?: Date) => {
        console.log("Transaction date changing to:", newDate);
        if (newDate) {
            // Ensure we're passing a valid date object
            handleFieldChange('date', newDate);
        }
    };

    if (isEditMode) {
        return (
            <EditableDetailRow
                label="Date"
                tooltip={fieldDescriptions.date}
            >
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
 * TransactionStatusField component handles displaying and editing the transaction status
 */
function TransactionStatusField() {
    const {
        transaction,
        isEditMode,
        handleFieldChange,
        editedValues,
        handleSave
    } = useTransactionContext();

    const completeTransaction = useCompleteTransaction();
    const updateTransactionStatus = useUpdateTransactionStatus();

    // Local state for a tooltip showing invalid status transitions
    const [statusErrorMessage, setStatusErrorMessage] = React.useState<string | null>(null);
    const [isStatusUpdating, setIsStatusUpdating] = React.useState(false);

    // Get the current status value (original or edited)
    const getStatusValue = (): TransactionStatus => {
        // First check editedValues
        if ('status' in editedValues && editedValues.status) {
            return editedValues.status as TransactionStatus;
        }

        // If we have a pending field in editedValues, use that to determine legacy status
        if ('pending' in editedValues) {
            return editedValues.pending ? TransactionStatus.PENDING : TransactionStatus.COMPLETED;
        }

        // If transaction has a status field, use it
        if (transaction.status) {
            // Check if it's a valid TransactionStatus value
            if (Object.values(TransactionStatus).includes(transaction.status as TransactionStatus)) {
                return transaction.status as TransactionStatus;
            }
        }

        // Fallback to legacy pending boolean
        return transaction.pending ? TransactionStatus.PENDING : TransactionStatus.COMPLETED;
    };

    // Get status description for tooltips
    const getStatusDescription = (status: TransactionStatus): string => {
        return TransactionStatusMetadata[status]?.description ||
            'Current transaction status';
    };

    // Update transaction status
    const handleStatusChange = (newStatus: string) => {
        const currentStatus = getStatusValue();
        const targetStatus = newStatus as TransactionStatus;

        console.log("Status change attempt:", currentStatus, "→", targetStatus);

        // Check if this transition is allowed
        if (!isStatusTransitionAllowed(currentStatus, targetStatus)) {
            const allowedTransitions = TransactionStatusMetadata[currentStatus].canTransitionTo
                .map(status => TransactionStatusMetadata[status].label)
                .join(', ');

            const errorMsg = `Cannot change status from ${TransactionStatusMetadata[currentStatus].label} to ${TransactionStatusMetadata[targetStatus].label}. Allowed transitions: ${allowedTransitions}`;
            console.warn(errorMsg);
            setStatusErrorMessage(errorMsg);

            // Set a timeout to clear the error message
            setTimeout(() => setStatusErrorMessage(null), 5000);
            return;
        }

        // Clear any previous error messages
        setStatusErrorMessage(null);

        // Update both legacy pending field and new status field in the local state
        const isPending = targetStatus === TransactionStatus.PENDING;
        handleFieldChange('pending', isPending);
        handleFieldChange('status', targetStatus);

        // Set loading state and update the status in the database
        setIsStatusUpdating(true);

        // Always update the status in the database immediately, regardless of edit mode
        updateTransactionStatus.mutate(
            {
                id: transaction.id,
                status: targetStatus,
            },
            {
                onSuccess: () => {
                    console.log("Transaction status updated successfully to:", targetStatus);

                    // Update the transaction object directly
                    transaction.status = targetStatus;
                    transaction.pending = isPending;

                    // Still update local state for form consistency
                    handleFieldChange('status', targetStatus);
                    handleFieldChange('pending', isPending);

                    setIsStatusUpdating(false);
                },
                onError: (error) => {
                    console.error("Failed to update transaction status:", error);
                    // Display error in UI
                    setStatusErrorMessage(`Failed to update status: ${error.message}`);
                    setTimeout(() => setStatusErrorMessage(null), 5000);
                    setIsStatusUpdating(false);
                }
            }
        );

        console.log("Transaction status changing to:", targetStatus, "isPending:", isPending);
    };

    // Handler for marking transaction as complete
    const handleMarkAsComplete = (id: string) => {
        if (!id) return;

        // Show loading state
        setIsStatusUpdating(true);

        // First update the pending status using the dedicated API
        completeTransaction.mutate(
            { id },
            {
                onSuccess: () => {
                    console.log("Transaction marked as complete successfully");

                    // Also update the status field for consistency
                    updateTransactionStatus.mutate(
                        {
                            id: id,
                            status: TransactionStatus.COMPLETED,
                        },
                        {
                            onSuccess: () => {
                                console.log("Status field updated to COMPLETED");

                                // Update local state for the form
                                handleFieldChange('status', TransactionStatus.COMPLETED);
                                handleFieldChange('pending', false);

                                // Also update the transaction object directly since we're in view mode
                                // This ensures the UI stays in sync
                                transaction.status = TransactionStatus.COMPLETED;
                                transaction.pending = false;

                                setIsStatusUpdating(false);
                            },
                            onError: (error) => {
                                console.error("Failed to update status field:", error);
                                setIsStatusUpdating(false);
                            }
                        }
                    );
                },
                onError: (error) => {
                    console.error('Mark transaction as complete error:', error);
                    setStatusErrorMessage(`Failed to mark as complete: ${error.message}`);
                    setTimeout(() => setStatusErrorMessage(null), 5000);
                    setIsStatusUpdating(false);
                },
            }
        );
    };

    // Get badge type for status
    const getStatusBadgeTypeForDisplay = (status: string) => {
        return getStatusBadgeType(status);
    };

    // Get all available status options for the dropdown
    const statusOptions = getTransactionStatusOptions();

    // Only show valid transitions when in edit mode
    const getFilteredStatusOptions = () => {
        const currentStatus = getStatusValue();

        // Always include current status
        const allowedStatuses = [currentStatus, ...TransactionStatusMetadata[currentStatus].canTransitionTo];

        return statusOptions.filter(option =>
            allowedStatuses.includes(option.value as TransactionStatus)
        );
    };

    // For displaying status info
    const currentStatus = getStatusValue();
    const statusMetadata = TransactionStatusMetadata[currentStatus];

    // Check if this status needs review or attention
    const needsReview = [
        TransactionStatus.AWAITING_REVIEW,
        TransactionStatus.UNDER_REVIEW,
        TransactionStatus.FLAGGED,
        TransactionStatus.DISPUTED,
        TransactionStatus.NEEDS_DOCUMENTATION,
        TransactionStatus.REQUIRES_APPROVAL,
        TransactionStatus.UNVERIFIED
    ].includes(currentStatus);

    // Render the status field in edit mode
    if (isEditMode) {
        return (
            <>
                <EditableDetailRow
                    label={isStatusUpdating ? "Status (Updating...)" : "Status"}
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

                {/* Show review notice even in edit mode if needed */}
                {needsReview && (
                    <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                        <h4 className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-400">
                            Review Required
                        </h4>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            This transaction is marked as <strong className="font-medium">{statusMetadata.label}</strong> and
                            needs additional attention. {statusMetadata.description}
                        </p>
                        {statusMetadata.requiresApproval && (
                            <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                                <strong className="font-medium">Note:</strong> This status requires approval by an authorized team member.
                            </p>
                        )}
                    </div>
                )}
            </>
        );
    }

    // Render the status field in view mode
    return (
        <>
            <DetailRow
                label={isStatusUpdating ? "Status (Updating...)" : "Status"}
                value={isStatusUpdating
                    ? statusMetadata?.label + " (Updating...)"
                    : statusMetadata?.label || currentStatus}
                tooltip={getStatusDescription(currentStatus)}
                isBadge
                badgeType={getStatusBadgeTypeForDisplay(currentStatus)}
                interactive={currentStatus === TransactionStatus.PENDING && !isStatusUpdating}
                onClick={currentStatus === TransactionStatus.PENDING && !isStatusUpdating ?
                    () => handleMarkAsComplete(transaction.id) : undefined}
                hoverText={currentStatus === TransactionStatus.PENDING ?
                    "Click to mark as complete" : undefined}
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

            {/* Review section for statuses that need attention */}
            {needsReview && (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                    <h4 className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-400">
                        Review Required
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                        This transaction is marked as <strong className="font-medium">{statusMetadata.label}</strong> and
                        needs additional attention. {statusMetadata.description}
                    </p>
                    {statusMetadata.requiresApproval && (
                        <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                            <strong className="font-medium">Note:</strong> This status requires approval by an authorized team member.
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
 * TransactionIdField component displays the transaction ID
 */
function TransactionIdField() {
    const { transaction } = useTransactionContext();

    return (
        <DetailRow
            label="ID"
            value={transaction.id}
            tooltip={fieldDescriptions.id}
            monospace
        />
    );
}

/**
 * TransactionInfoSection component displays the basic information about a transaction.
 * Now refactored into smaller, focused components.
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
                <TransactionIdField />
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