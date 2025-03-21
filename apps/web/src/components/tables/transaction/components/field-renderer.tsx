import * as React from 'react';

import { DetailRow } from './detail-row';
import { EditableDetailRow } from './editable-detail-row';
import { fieldDescriptions } from './field-descriptions';
import { useTransactionContext } from './transaction-context';

export interface FieldRendererProps {
    field: string;
    label: string;
    isTextarea?: boolean;
    isBoolean?: boolean;
    isSelect?: boolean;
    selectOptions?: { label: string; value: string }[];
    placeholder?: string;
    monospace?: boolean;
    isAmount?: boolean;
    amountType?: 'positive' | 'negative';
    isBadge?: boolean;
    badgeType?: string;
    href?: string;
    suffix?: string;
}

/**
 * FieldRenderer component - Renders editable or non-editable field based on conditions
 * 
 * This component centralizes the logic for rendering transaction fields, handling
 * both edit mode and view mode displays based on the current context and field properties.
 */
export function FieldRenderer({
    field,
    label,
    isTextarea = false,
    isBoolean = false,
    isSelect = false,
    selectOptions = [],
    placeholder,
    monospace = false,
    isAmount = false,
    amountType,
    isBadge = false,
    badgeType,
    href,
    suffix,
}: FieldRendererProps) {
    const { transaction, editedValues, isEditMode, handleFieldChange, isEditable } = useTransactionContext();

    // Get current value and check if it exists
    const value = field in editedValues
        ? editedValues[field]
        : transaction[field as keyof typeof transaction];

    const hasValue = value !== null && value !== undefined;
    const tooltip = fieldDescriptions[field as keyof typeof fieldDescriptions];

    // Format value with suffix if needed
    const formattedValue = (suffix && value !== null && value !== undefined)
        ? `${value}${suffix}`
        : value;

    // Display in edit mode
    if (isEditMode && isEditable(field)) {
        return (
            <EditableDetailRow
                key={`edit-${field}`}
                label={label}
                value={typeof value === 'boolean' ? value : (value as string) || ''}
                onChange={(newValue) => handleFieldChange(field, newValue)}
                tooltip={tooltip}
                isTextarea={isTextarea}
                isBoolean={isBoolean}
                isSelect={isSelect}
                options={selectOptions}
                placeholder={placeholder}
            />
        );
    }

    // Display in view mode (only if value exists, unless it's a required field)
    if (hasValue || field === 'name' || field === 'category' || isBoolean) {
        return (
            <DetailRow
                key={`view-${field}`}
                label={label}
                value={
                    isBoolean
                        ? value ? 'Yes' : 'No'
                        : (formattedValue as string) || '-'
                }
                tooltip={tooltip}
                monospace={monospace}
                isAmount={isAmount}
                amountType={amountType}
                isBadge={isBadge}
                badgeType={badgeType}
                href={href}
            />
        );
    }

    // If no value and not required, render nothing
    return null;
} 