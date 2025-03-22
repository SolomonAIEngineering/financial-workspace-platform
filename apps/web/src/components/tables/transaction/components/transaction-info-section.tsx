import { Edit, FileText, Info, Loader2, Plus } from 'lucide-react';
import React, { useState } from 'react';
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

import { Button } from '@/registry/default/potion-ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { DatePicker } from '@/components/ui/date-picker';
import { DetailRow } from './detail-row';
import { EditableDetailRow } from './editable-detail-row';
import { FieldRenderer } from './field-renderer';
import { TransactionNoteModal } from './transaction-note-modal';
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
     * @returns {Date | undefined} The current date as a Date object, or
     *   undefined if no date
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
 * TransactionNotesField Component
 * 
 * Manages the display and editing of transaction notes with rich text support.
 * Provides a button to open the notes editor modal and displays the current notes.
 * 
 * Features:
 * - Displays formatted notes or a placeholder if no notes exist
 * - Provides context-aware Edit/Add button to manage notes
 * - Opens a rich text editor in a modal for complex formatting
 * - Maintains state consistency with transaction context using handleFieldChange
 * - Supports both plain text and rich text content formats
 * - Handles JSON serialization/deserialization of rich content
 * 
 * This component follows the field component pattern used throughout the 
 * transaction details interface, accessing and updating values through
 * the transaction context.
 * 
 * @example
 *   <TransactionNotesField />
 * 
 * @returns {JSX.Element} The rendered transaction notes field component
 * @component
 */
function TransactionNotesField() {
    const { transaction, handleFieldChange, editedValues } = useTransactionContext();
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    /**
     * Gets the current notes value prioritizing edited values over original transaction
     * Ensures the component always displays the most up-to-date content, even before saving
     * 
     * @returns {string | null | undefined} The current notes text content
     */
    const getNotes = () => {
        return 'notes' in editedValues ? editedValues.notes : transaction.notes;
    };

    /**
     * Gets the current read-only state for notes, prioritizing edited values
     * 
     * @returns {boolean} Whether the notes are set to read-only
     */
    const getIsNoteReadOnly = () => {
        return 'isNoteReadOnly' in editedValues
            ? Boolean(editedValues.isNoteReadOnly)
            : Boolean((transaction as any).isNoteReadOnly);
    };

    /**
     * Safely retrieves and parses rich notes content
     * Handles various edge cases including:
     * - Edited values vs original transaction data
     * - String JSON vs object values
     * - JSON parsing errors
     * 
     * @returns {object | null} The parsed rich notes content or null if unavailable/invalid
     */
    const getRichNotes = () => {
        try {
            // Check if we have rich notes in edited values first
            if ('notesRichContent' in editedValues && editedValues.notesRichContent) {
                const content = typeof editedValues.notesRichContent === 'string'
                    ? JSON.parse(editedValues.notesRichContent)
                    : editedValues.notesRichContent;
                return content;
            }

            // Fall back to transaction rich notes
            if ((transaction as any).notesRichContent) {
                return JSON.parse((transaction as any).notesRichContent);
            }
        } catch (error) {
            console.error('Error parsing rich notes:', error);
        }

        // Return null if no valid rich content found
        return null;
    };

    /**
     * Opens the note modal for editing
     * Sets the isNoteModalOpen state to true which triggers the modal to display
     */
    const handleOpenNoteModal = () => {
        setIsNoteModalOpen(true);
    };

    /**
     * Handler for when notes are updated through the modal editor
     * Updates both plain text and rich content in the transaction context
     * 
     * @param {object} updatedData - The data returned from the notes modal
     * @param {string} updatedData.notes - Plain text version of the notes
     * @param {object | string} updatedData.notesRichContent - Rich content structure or JSON string
     * @param {boolean} updatedData.isNoteReadOnly - Whether the note is set to read-only
     */
    const handleNotesUpdated = (updatedData: any) => {
        // Use the standard field change handler for consistency
        handleFieldChange('notes', updatedData.notes);
        // If rich content is available, update that as well
        if (updatedData.notesRichContent) {
            handleFieldChange('notesRichContent',
                typeof updatedData.notesRichContent === 'string'
                    ? updatedData.notesRichContent
                    : JSON.stringify(updatedData.notesRichContent)
            );
        }
        // Update the read-only state if provided
        if (updatedData.isNoteReadOnly !== undefined) {
            handleFieldChange('isNoteReadOnly', updatedData.isNoteReadOnly);
        }
    };

    // Determine if we should display the read-only indicator
    const isReadOnly = getIsNoteReadOnly();

    return (
        <>
            {/* Custom Notes field with enhanced UI */}
            <div className="mb-2 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-primary/70" />
                        <label className="text-xs font-medium text-foreground/90">Notes</label>
                        {isReadOnly && (
                            <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                                Read-only
                            </span>
                        )}
                    </div>
                    <Button
                        variant={getNotes() ? "outline" : "default"}
                        size="sm"
                        className={`h-7 py-0 px-2.5 text-xs rounded-md transition-all ${getNotes()
                            ? "border-primary/20 text-primary hover:bg-primary/5 hover:text-primary/90 shadow-sm"
                            : "bg-primary/90 text-primary-foreground hover:bg-primary shadow-sm"
                            }`}
                        onClick={handleOpenNoteModal}
                    >
                        {getNotes() ? (
                            <>
                                <Edit className="mr-1.5 h-3 w-3" />
                                <span className="font-medium">Edit Notes</span>
                            </>
                        ) : (
                            <>
                                <Plus className="mr-1.5 h-3 w-3" />
                                <span className="font-medium">Add Notes</span>
                            </>
                        )}
                    </Button>
                </div>

                {getNotes() ? (
                    <div className="whitespace-pre-wrap rounded-lg bg-muted/30 border border-border/20 p-3 text-sm hover:border-border/30 transition-colors shadow-sm">
                        {getNotes()}
                    </div>
                ) : (
                    <div className="flex items-center justify-center p-4 rounded-lg border border-dashed border-border/40 bg-background/50 text-sm text-muted-foreground/80 hover:border-border/60 transition-colors">
                        <div className="flex flex-col items-center gap-1">
                            <FileText className="h-4 w-4 text-muted-foreground/60" />
                            <span className="text-center text-xs">No notes available for this transaction</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Note Modal */}
            <TransactionNoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                transactionId={transaction.id}
                initialNotes={transaction.notes}
                initialRichNotes={getRichNotes()}
                initialReadOnly={isReadOnly}
                onSuccess={handleNotesUpdated}
            />
        </>
    );
}

/**
 * TransactionInfoSection Component
 *
 * The main container component for displaying transaction information.
 * Organizes and renders various transaction field components in a collapsible
 * section, providing a structured view of essential transaction data.
 *
 * Features:
 *
 * - Collapsible section with information icon and tooltip explanation
 * - Organized display of transaction details in a consistent format
 * - Default open state for immediate visibility upon transaction selection
 * - Composition of specialized field components for different data types
 * - Consistent layout and styling for all transaction fields
 * - Integration with the transaction context for state management
 *
 * Field components include:
 *
 * - TransactionIdField: Displays the transaction ID with copy functionality
 * - FieldRenderer: Renders generic fields like name, description
 * - TransactionAmountField: Handles transaction amount with currency formatting and color-coding
 * - TransactionDateField: Manages transaction date with proper date picker and formatting
 * - TransactionStatusField: Handles transaction status with status transitions and badges
 * - TransactionNotesField: Provides rich text editing capability for transaction notes
 *
 * This component serves as the primary information display for transaction details,
 * following design patterns established throughout the financial management platform.
 *
 * @example
 *   <TransactionInfoSection />;
 *
 * @returns {JSX.Element} The rendered transaction information section with all field components
 * @component
 */
export function TransactionInfoSection() {
    const { transaction } = useTransactionContext();

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
                <TransactionNotesField />
            </div>
        </TransactionSection>
    );
}
