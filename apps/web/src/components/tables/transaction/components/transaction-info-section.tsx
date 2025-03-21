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
        editedValues
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

        // Also update the status in the database through the API
        updateTransactionStatus.mutate(
            {
                id: transaction.id,
                status: targetStatus,
            },
            {
                onSuccess: () => {
                    console.log("Transaction status updated successfully to:", targetStatus);
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

        // Update both via completeTransaction and updateTransactionStatus for consistency
        completeTransaction.mutate(
            { id },
            {
                onSuccess: () => {
                    // The transaction will be updated automatically through 
                    // the optimistic updates in the useCompleteTransaction hook
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
                                // Update local state
                                handleFieldChange('status', TransactionStatus.COMPLETED);
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

    if (isEditMode) {
        return (
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
        );
    }

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