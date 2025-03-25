import * as React from 'react';

import { Check, Loader2, Receipt, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { DetailRow } from './detail-row';
import { FieldRenderer } from './field-renderer';
import { Label } from '@/components/ui/label';
import { SubheadingWithTooltip } from './subheading-with-tooltip';
import { Switch } from '@/components/ui/switch';
import { TransactionSection } from './transaction-section';
import { cn } from '@/lib/utils';
import { fieldDescriptions } from './field-descriptions';
import { sectionDescriptions } from './section-descriptions';
import { toast } from 'sonner';
import { useTransactionContext } from './transaction-context';
import { useUpdateTransaction } from '@/trpc/hooks/transaction-hooks';

/**
 * ToggleableProperty - A switch toggle for a transaction property
 */
interface ToggleablePropertyProps {
  label: string;
  field: string;
  value: boolean;
  tooltip?: string;
  onToggle: (field: string, value: boolean) => void;
  isUpdating: boolean;
  updatingField: string | null;
}

function ToggleableProperty({
  label,
  field,
  value,
  tooltip,
  onToggle,
  isUpdating,
  updatingField
}: ToggleablePropertyProps) {
  const isCurrentlyUpdating = isUpdating && updatingField === field;

  return (
    <div className="flex flex-row items-center justify-between space-x-2 rounded-md border border-border/40 bg-background/60 px-3 py-2 shadow-sm transition-all hover:border-primary/20 hover:bg-background/80">
      <div className="flex items-center space-x-2">
        <Label
          htmlFor={`toggle-${field}`}
          className="text-sm font-medium cursor-pointer"
          title={tooltip}
        >
          {label}
        </Label>
        {isCurrentlyUpdating && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        )}
      </div>
      <Switch
        id={`toggle-${field}`}
        checked={value}
        onCheckedChange={(checked) => onToggle(field, checked)}
        disabled={isUpdating}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}

/**
 * FinancialToggles - A component for toggling financial properties
 */
function FinancialToggles() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const updateTransaction = useUpdateTransaction();
  const { transaction } = useTransactionContext();

  // Use a ref to store the transaction data to prevent unnecessary re-renders
  const transactionRef = useRef(transaction);

  // Store toggle states directly in state, initializing from transaction
  const [toggleStates, setToggleStates] = useState({
    taxDeductible: Boolean(transaction.taxDeductible),
    taxExempt: Boolean(transaction.taxExempt),
    excludeFromBudget: Boolean(transaction.excludeFromBudget),
    reimbursable: Boolean(transaction.reimbursable),
    plannedExpense: Boolean(transaction.plannedExpense),
    discretionary: Boolean(transaction.discretionary)
  });

  // Update the ref when transaction changes
  useEffect(() => {
    transactionRef.current = transaction;
  }, [transaction]);

  const handleToggle = (field: string, value: boolean) => {
    if (!transactionRef.current.id || isUpdating) return;

    // Update UI state immediately
    setToggleStates(prev => ({
      ...prev,
      [field]: value
    }));

    setIsUpdating(true);
    setUpdatingField(field);

    // Create update object
    const updateData = {
      id: transactionRef.current.id,
      data: {
        [field]: value,
      },
    };

    // Update the transaction in the database
    updateTransaction.mutate(updateData, {
      onSuccess: () => {
        toast.success(
          `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} ${value ? 'enabled' : 'disabled'}`
        );

        // No need to update context as we're bypassing it for UI state
      },
      onError: (error) => {
        // Revert UI state on error
        setToggleStates(prev => ({
          ...prev,
          [field]: !value
        }));

        toast.error(`Failed to update: ${error.message}`);
      },
      onSettled: () => {
        setIsUpdating(false);
        setUpdatingField(null);
      }
    });
  };

  // Map of properties to display
  const properties = [
    {
      label: 'Tax Deductible',
      field: 'taxDeductible',
      tooltip: fieldDescriptions.taxDeductible,
    },
    {
      label: 'Tax Exempt',
      field: 'taxExempt',
      tooltip: fieldDescriptions.taxExempt,
    },
    {
      label: 'Exclude from Budget',
      field: 'excludeFromBudget',
      tooltip: fieldDescriptions.excludeFromBudget,
    },
    {
      label: 'Reimbursable',
      field: 'reimbursable',
      tooltip: fieldDescriptions.reimbursable,
    },
    {
      label: 'Planned Expense',
      field: 'plannedExpense',
      tooltip: fieldDescriptions.plannedExpense,
    },
    {
      label: 'Discretionary',
      field: 'discretionary',
      tooltip: fieldDescriptions.discretionary,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {properties.map((prop) => (
        <ToggleableProperty
          key={prop.field}
          label={prop.label}
          field={prop.field}
          value={toggleStates[prop.field as keyof typeof toggleStates]}
          tooltip={prop.tooltip}
          onToggle={handleToggle}
          isUpdating={isUpdating}
          updatingField={updatingField}
        />
      ))}
    </div>
  );
}

/**
 * TaxFinancialSection - Displays transaction tax and financial details
 *
 * This component handles the display and editing of tax and financial
 * information, including tax status, amounts, rates, and business information.
 */
export function TaxFinancialSection() {
  const { transaction, isEditMode } = useTransactionContext();

  // Helper function to format currency amounts
  const formatAmount = (amount: number, currency?: string | null) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  // Always keep the section open by setting defaultOpen to true
  // This ensures the section stays open regardless of toggle changes
  const sectionDefaultOpen = true;

  return (
    <TransactionSection
      title="Tax & Financial"
      icon={<Receipt className="h-4 w-4" />}
      defaultOpen={sectionDefaultOpen}
      className="!border-violet-100"
      tooltip={sectionDescriptions.taxFinancial}
    >
      <div className="space-y-4">
        {/* Tax information toggles */}
        {isEditMode ? (
          <div className="mb-4 grid grid-cols-2 gap-2">
            <FieldRenderer
              field="taxDeductible"
              label="Tax Deductible"
              isBoolean={true}
            />
            <FieldRenderer
              field="taxExempt"
              label="Tax Exempt"
              isBoolean={true}
            />
            <FieldRenderer
              field="reimbursable"
              label="Reimbursable"
              isBoolean={true}
            />
            <FieldRenderer
              field="excludeFromBudget"
              label="Exclude From Budget"
              isBoolean={true}
            />
            <FieldRenderer
              field="plannedExpense"
              label="Planned Expense"
              isBoolean={true}
            />
            <FieldRenderer
              field="discretionary"
              label="Discretionary"
              isBoolean={true}
            />
          </div>
        ) : (
          <FinancialToggles />
        )}

        <div className="mt-2 border-t border-border/20 pt-2">
          {transaction.vatAmount && (
            <DetailRow
              label="VAT Amount"
              value={formatAmount(
                transaction.vatAmount,
                transaction.isoCurrencyCode
              )}
              isAmount
            />
          )}
          <FieldRenderer field="vatRate" label="VAT Rate" suffix="%" />

          {transaction.taxAmount && (
            <DetailRow
              label="Tax Amount"
              value={formatAmount(
                transaction.taxAmount,
                transaction.isoCurrencyCode
              )}
              isAmount
            />
          )}
          <FieldRenderer field="taxRate" label="Tax Rate" suffix="%" />
          <FieldRenderer field="taxCategory" label="Tax Category" />
          <FieldRenderer
            field="businessPurpose"
            label="Business Purpose"
            isTextarea={true}
          />
          <FieldRenderer field="costCenter" label="Cost Center" />
          <FieldRenderer field="projectCode" label="Project Code" />
        </div>

        {/* Cash flow */}
        {(transaction.cashFlowCategory || transaction.cashFlowType) && (
          <div className="mt-2 border-t border-border/20 pt-2">
            <SubheadingWithTooltip
              label="Cash Flow"
              tooltip="Cash flow information and classification"
            />
            <FieldRenderer
              field="cashFlowCategory"
              label="Cash Flow Category"
            />
            <FieldRenderer field="cashFlowType" label="Cash Flow Type" />
          </div>
        )}

        {/* Currency conversion if applicable */}
        {transaction.baseAmount &&
          transaction.baseCurrency &&
          transaction.baseCurrency !== transaction.isoCurrencyCode && (
            <div className="mt-2 border-t border-border/20 pt-2">
              <SubheadingWithTooltip
                label="Currency Conversion"
                tooltip="Information about currency conversion for this transaction"
              />
              <DetailRow
                label="Base Amount"
                value={formatAmount(
                  transaction.baseAmount,
                  transaction.baseCurrency
                )}
                isAmount
              />
              <DetailRow
                label="Base Currency"
                value={transaction.baseCurrency}
              />
            </div>
          )}
      </div>
    </TransactionSection>
  );
}
