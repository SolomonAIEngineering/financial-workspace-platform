import * as React from 'react';

import { TransactionCategory } from '@solomonai/prisma/client';
import { Transaction as TransactionData } from '@solomonai/prisma/client';
import { api } from '@/trpc/react';
import { formatDate } from './utils';
import { useUpdateTransaction } from '@/trpc/hooks/transaction-hooks';

// List of editable fields
export const EDITABLE_FIELDS = [
    // Basic transaction info
    'name',
    'description',
    'notes',
    'date',
    'amount',
    'status',
    'pending',

    // Merchant details
    'merchantName',
    'merchantCategory',
    'merchantWebsite',
    'merchantPhone',
    'merchantAddress',
    'merchantCity',
    'merchantState',
    'merchantZip',
    'merchantCountry',

    // Categorization
    'category',
    'subCategory',
    'customCategory',
    'tags',
    'budgetCategory',
    'budgetSubcategory',
    'needsWantsCategory',

    // Payment details
    'paymentMethod',
    'paymentChannel',
    'paymentProcessor',
    'paymentGateway',
    'cardType',
    'cardNetwork',
    'cardLastFour',
    'transactionReference',
    'authorizationCode',
    'checkNumber',
    'wireReference',
    'accountNumber',

    // Tax and financial info
    'taxDeductible',
    'taxExempt',
    'taxCategory',
    'taxAmount',
    'taxRate',
    'vatAmount',
    'vatRate',
    'businessPurpose',
    'costCenter',
    'projectCode',
    'reimbursable',
    'cashFlowCategory',
    'cashFlowType',

    // Status and flags
    'userNotes',
    'reviewStatus',
    'excludeFromBudget',
    'plannedExpense',
    'discretionary',
    'isFlagged',
    'isHidden',
];

// Context type definition
interface TransactionContextType {
    transaction: TransactionData;
    editedValues: Record<string, any>;
    isEditMode: boolean;
    setIsEditMode: (value: boolean) => void;
    setEditedValues: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    handleFieldChange: (field: string, value: any) => void;
    isEditable: (field: string) => boolean;
    handleSave: () => void;
    toggleEditMode: () => void;
    formatAmount: (amount: number, currency?: string | null) => string;
    formatDateTime: (date: Date | string | null) => string;
}

// Create the context with a default value
const TransactionContext = React.createContext<TransactionContextType | undefined>(undefined);

// Provider component that wraps parts of the app that need access to the context
export function TransactionProvider({
    transaction,
    onUpdate,
    children,
}: {
    children: React.ReactNode;
    transaction: TransactionData;
    onUpdate?: (updatedData: any) => void;
}) {
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [editedValues, setEditedValues] = React.useState<Record<string, any>>({});
    const updateTransaction = useUpdateTransaction();
    const trpc = api.useUtils();

    // Reset edited values when the transaction changes
    React.useEffect(() => {
        if (isEditMode) {
            // If we're in edit mode and the transaction changes,
            // exit edit mode and clear any pending edits
            setIsEditMode(false);
            setEditedValues({});
        }
    }, [transaction.id, transaction.updatedAt]);

    // Format helpers
    const formatAmount = (amount: number, currency?: string | null) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
        }).format(amount);
    };

    const formatDateTime = (date: Date | string | null) => {
        if (!date) return '-';
        return formatDate(date);
    };

    // Helper to get current value (edited or original)
    const getValue = (field: keyof TransactionData) => {
        return field in editedValues
            ? editedValues[field]
            : transaction[field];
    };

    // Determine if field is editable
    const isEditable = (field: string) => {
        return EDITABLE_FIELDS.includes(field) && !!onUpdate && !transaction.isLocked;
    };

    // Centralized field value handler with type safety
    const handleFieldChange = (field: string, value: any) => {
        console.log(`Field changed: ${field} = `, value);

        // Type-specific conversions
        let processedValue: any;

        if (field === 'tags') {
            // Handle tags special case
            processedValue = typeof value === 'string'
                ? value.split(',').map(tag => tag.trim()).filter(Boolean)
                : [];
        } else if (field === 'date') {
            // Handle date values specially
            if (value instanceof Date) {
                // Keep Date objects as is for the UI
                processedValue = value;
                console.log("Storing date object:", value);
            } else if (typeof value === 'string') {
                // Convert string dates to Date objects
                processedValue = new Date(value);
                console.log("Converting string date to Date object:", processedValue);
            } else {
                // Fallback
                processedValue = value;
            }
        } else if (field === 'amount') {
            // Handle amount values specially
            if (typeof value === 'number') {
                // Ensure it's a properly formatted number with 2 decimal places
                processedValue = parseFloat(value.toFixed(2));
                console.log("Storing amount value:", processedValue);
            } else if (typeof value === 'string') {
                // Try to convert string to number
                const parsedValue = parseFloat(value);
                if (!isNaN(parsedValue)) {
                    processedValue = parseFloat(parsedValue.toFixed(2));
                    console.log("Converting string amount to number:", processedValue);
                } else {
                    console.warn("Invalid amount value:", value);
                    return; // Don't update if invalid
                }
            } else {
                console.warn("Unexpected amount value type:", typeof value);
                return; // Don't update if invalid
            }
        } else if (typeof value === 'boolean') {
            // Handle boolean values
            processedValue = value;
        } else if (value === '') {
            // Empty strings become null
            processedValue = null;
        } else {
            // All other values
            processedValue = value;
        }

        setEditedValues(prev => ({
            ...prev,
            [field]: processedValue
        }));
    };

    // Toggle edit mode
    const toggleEditMode = () => {
        console.log('Toggling edit mode. Current:', isEditMode);
        setIsEditMode(!isEditMode);
        if (isEditMode) {
            // If leaving edit mode, clear edits
            setEditedValues({});
        }
    };

    // Handle save of edits with trpc
    const handleSave = () => {
        if (Object.keys(editedValues).length > 0) {
            console.log('Saving edited values:', editedValues);

            // Create clean object with only changed values
            const cleanUpdates = Object.entries(editedValues).reduce((acc, [key, value]) => {
                // Only include values that actually changed
                if (value !== transaction[key as keyof typeof transaction]) {
                    // Handle Date objects for the API
                    if (value instanceof Date) {
                        // Convert Date objects to ISO strings for the API
                        acc[key] = value.toISOString();
                        console.log(`Converting Date to ISO for ${key}:`, acc[key]);
                    } else {
                        acc[key] = value;
                    }
                }
                return acc;
            }, {} as Record<string, any>);

            console.log('Clean updates to send:', cleanUpdates);

            if (Object.keys(cleanUpdates).length > 0) {
                // Use trpc directly for the update
                updateTransaction.mutate(
                    {
                        id: transaction.id,
                        data: cleanUpdates
                    },
                    {
                        onSuccess: (data) => {
                            console.log('Transaction updated successfully, response:', data);
                            // Invalidate queries to refetch data
                            void trpc.transactions.getTransactions.invalidate();
                            void trpc.transactions.getTransaction.invalidate({ id: transaction.id });

                            // Also call the onUpdate callback if provided for compatibility
                            if (onUpdate) {
                                onUpdate(cleanUpdates);
                            }
                        },
                        onError: (error) => {
                            console.error('Update transaction error:', error);
                        },
                    }
                );
            }
        }
        toggleEditMode();
    };

    const contextValue = {
        transaction,
        editedValues,
        isEditMode,
        setIsEditMode,
        setEditedValues,
        handleFieldChange,
        isEditable,
        handleSave,
        toggleEditMode,
        formatAmount,
        formatDateTime,
    };

    return (
        <TransactionContext.Provider value={contextValue}>
            {children}
        </TransactionContext.Provider>
    );
}

// Custom hook to use the transaction context
export function useTransactionContext() {
    const context = React.useContext(TransactionContext);
    if (context === undefined) {
        throw new Error('useTransactionContext must be used within a TransactionProvider');
    }
    return context;
} 