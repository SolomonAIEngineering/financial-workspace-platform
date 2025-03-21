import { DatePicker } from '@/components/ui/date-picker';
import { DetailRow } from './detail-row';
import { EditableDetailRow } from './editable-detail-row';
import { FieldRenderer } from './field-renderer';
import { Info } from 'lucide-react';
import React from 'react';
import { TransactionSection } from './transaction-section';
import { fieldDescriptions } from './field-descriptions';
import { sectionDescriptions } from './section-descriptions';
import { useTransactionContext } from './transaction-context';

/**
 * TransactionInfoSection component displays the basic information about a transaction.
 */
export function TransactionInfoSection() {
    const {
        transaction,
        formatAmount,
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

    return (
        <TransactionSection
            title="Transaction Information"
            icon={<Info className="h-4 w-4" />}
            defaultOpen={true}
            tooltip={sectionDescriptions.transactionInformation}
        >
            <div className="space-y-1">
                <DetailRow
                    label="ID"
                    value={transaction.id}
                    tooltip={fieldDescriptions.id}
                    monospace
                />
                <FieldRenderer field="name" label="Name" />
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

                {isEditMode ? (
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
                ) : (
                    <DetailRow
                        label="Date"
                        value={formatDateTime(transaction.date)}
                        tooltip={fieldDescriptions.date}
                    />
                )}

                <DetailRow
                    label="Status"
                    value={transaction.pending ? 'Pending' : 'Completed'}
                    tooltip={fieldDescriptions.status}
                    isBadge
                    badgeType={transaction.pending ? 'warning' : 'success'}
                />
                <FieldRenderer field="description" label="Description" />
                <FieldRenderer field="notes" label="Notes" isTextarea={true} />
            </div>
        </TransactionSection>
    );
} 