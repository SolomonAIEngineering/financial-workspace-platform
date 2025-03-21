import * as React from 'react';

import { PropertyItem } from './property-item';
import { fieldDescriptions } from './field-descriptions';

/**
 * Interface for the PropertiesGrid component props.
 * 
 * @interface PropertiesGridProps
 * @property {boolean} [isRecurring] - Whether the transaction recurs on a schedule
 * @property {boolean} [isManual] - Whether the transaction was manually entered
 * @property {boolean} [isVerified] - Whether the transaction has been verified
 * @property {boolean} [isModified] - Whether the transaction has been modified
 * @property {boolean} [isFlagged] - Whether the transaction has been flagged for attention
 * @property {boolean} [isHidden] - Whether the transaction is hidden from normal views
 * @property {boolean} [isLocked] - Whether the transaction is locked from editing
 * @property {boolean} [isReconciled] - Whether the transaction has been reconciled
 * @property {boolean} [isSplit] - Whether the transaction is split across categories/accounts
 * @property {boolean} [internal] - Whether the transaction is internal (between owned accounts)
 * @property {boolean} [notified] - Whether the user has been notified about this transaction
 * @property {boolean} [needsAttention] - Whether the transaction needs attention
 * @property {boolean} [taxDeductible] - Whether the transaction is tax deductible
 * @property {boolean} [taxExempt] - Whether the transaction is exempt from taxes
 * @property {boolean} [excludeFromBudget] - Whether to exclude this transaction from budget calculations
 * @property {boolean} [reimbursable] - Whether the transaction is reimbursable
 * @property {boolean} [plannedExpense] - Whether the transaction was planned in advance
 * @property {boolean} [discretionary] - Whether the transaction is discretionary spending
 */
interface PropertiesGridProps {
    // Transaction flags
    isRecurring?: boolean;
    isManual?: boolean;
    isVerified?: boolean;
    isModified?: boolean;
    isFlagged?: boolean;
    isHidden?: boolean;
    isLocked?: boolean;
    isReconciled?: boolean;
    isSplit?: boolean;
    internal?: boolean;
    notified?: boolean;
    needsAttention?: boolean;

    // Financial flags
    taxDeductible?: boolean;
    taxExempt?: boolean;
    excludeFromBudget?: boolean;
    reimbursable?: boolean;
    plannedExpense?: boolean;
    discretionary?: boolean;
}

/**
 * PropertiesGrid component - Displays a grid of transaction properties and flags.
 * 
 * This component provides a visual representation of boolean properties associated with
 * a transaction, grouped into logical sections. Each property is displayed as a
 * pill/chip with an appropriate color scheme based on its meaning.
 * 
 * Properties are organized into transaction flags (properties of the transaction record itself)
 * and financial flags (properties related to financial classification).
 * 
 * The component uses tooltips to provide context about what each property means, helping
 * users understand the significance of each flag.
 *
 * @component
 * @example
 * ```tsx
 * <PropertiesGrid
 *   isRecurring={transaction.isRecurring}
 *   isManual={transaction.isManual}
 *   taxDeductible={transaction.taxDeductible}
 *   excludeFromBudget={transaction.excludeFromBudget}
 * />
 * ```
 *
 * @param {PropertiesGridProps} props - Component props
 * @returns {JSX.Element} The rendered properties grid
 */
export function PropertiesGrid({
    // Transaction flags
    isRecurring = false,
    isManual = false,
    isVerified = false,
    isModified = false,
    isFlagged = false,
    isHidden = false,
    isLocked = false,
    isReconciled = false,
    isSplit = false,
    internal = false,
    notified = false,
    needsAttention = false,

    // Financial flags
    taxDeductible = false,
    taxExempt = false,
    excludeFromBudget = false,
    reimbursable = false,
    plannedExpense = false,
    discretionary = false,
}: PropertiesGridProps) {
    const displayedProperties = [
        { label: "Recurring", value: isRecurring, tooltip: fieldDescriptions.isRecurring },
        { label: "Manual Entry", value: isManual, tooltip: fieldDescriptions.isManual },
        { label: "Verified", value: isVerified, colorScheme: 'success' as const, tooltip: fieldDescriptions.isVerified },
        { label: "Modified", value: isModified, tooltip: fieldDescriptions.isModified },
        { label: "Flagged", value: isFlagged, colorScheme: 'warning' as const, tooltip: fieldDescriptions.isFlagged },
        { label: "Hidden", value: isHidden, tooltip: fieldDescriptions.isHidden },
        { label: "Locked", value: isLocked, colorScheme: 'info' as const, tooltip: fieldDescriptions.isLocked },
        { label: "Reconciled", value: isReconciled, colorScheme: 'success' as const, tooltip: fieldDescriptions.isReconciled },
        { label: "Split", value: isSplit, tooltip: fieldDescriptions.isSplit },
        { label: "Internal", value: !!internal, tooltip: fieldDescriptions.internal },
        { label: "Notified", value: !!notified, tooltip: fieldDescriptions.notified },
        { label: "Needs Attention", value: needsAttention, colorScheme: 'warning' as const, tooltip: fieldDescriptions.needsAttention },
        { label: "Tax Deductible", value: taxDeductible, colorScheme: 'info' as const, tooltip: fieldDescriptions.taxDeductible },
        { label: "Tax Exempt", value: taxExempt, colorScheme: 'info' as const, tooltip: fieldDescriptions.taxExempt },
        { label: "Exclude Budget", value: excludeFromBudget, tooltip: fieldDescriptions.excludeFromBudget },
        { label: "Reimbursable", value: reimbursable, colorScheme: 'info' as const, tooltip: fieldDescriptions.reimbursable },
        { label: "Planned", value: plannedExpense, tooltip: fieldDescriptions.plannedExpense },
        { label: "Discretionary", value: discretionary, tooltip: fieldDescriptions.discretionary }
    ];

    // Filter to only show true values or a maximum of 8 properties
    const filteredProperties = displayedProperties
        .filter(prop => prop.value || displayedProperties.filter(p => p.value).length < 4);

    return (
        <div className="grid grid-cols-2 gap-2 text-sm">
            {filteredProperties.map((prop, index) => (
                <PropertyItem
                    key={index}
                    label={prop.label}
                    value={prop.value}
                    tooltip={prop.tooltip}
                    colorScheme={prop.colorScheme}
                />
            ))}
        </div>
    );
} 