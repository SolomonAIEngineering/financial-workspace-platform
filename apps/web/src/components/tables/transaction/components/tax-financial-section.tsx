import * as React from 'react';

import { Check, Loader2, Receipt, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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

/** ToggleProperty - A simple property toggle component */
function ToggleProperty({
  label,
  field,
  value,
  onChange,
  isDisabled = false,
  tooltip,
}: {
  label: string;
  field: string;
  value: boolean;
  onChange: (value: boolean) => void;
  isDisabled?: boolean;
  tooltip?: string;
}) {
  return (
    <div className="flex flex-row items-center justify-between space-x-2 rounded-md border border-border/40 bg-background/60 px-3 py-2 shadow-sm transition-all hover:border-primary/20 hover:bg-background/80">
      <div className="flex items-center space-x-2">
        <Label
          htmlFor={`toggle-${field}`}
          className="cursor-pointer text-sm font-medium"
          title={tooltip}
        >
          {label}
          {isDisabled && (
            <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-primary" />
          )}
        </Label>
      </div>
      <Switch
        id={`toggle-${field}`}
        checked={value}
        onCheckedChange={onChange}
        disabled={isDisabled}
        className="data-[state=checked]:bg-primary"
      />
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
  const { transaction, isEditMode, updateTransactionData } =
    useTransactionContext();
  const updateTransaction = useUpdateTransaction();
  const [updatingField, setUpdatingField] = useState<string | null>(null);

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

  // Handle toggle changes
  const handleToggle = (field: string, value: boolean) => {
    if (!transaction.id || updatingField) return;

    // Set updating state
    setUpdatingField(field);

    // Create update object
    const updateData = {
      id: transaction.id,
      data: {
        [field]: value,
      },
    };


    // Update transaction
    updateTransaction.mutate(updateData, {
      onSuccess: (data) => {
        // Update local transaction state with the new value
        updateTransactionData({
          [field]: value,
        });

        toast.success(
          `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} updated`
        );
      },
      onError: (error) => {
        console.error(`[TaxFinancialSection] Update error:`, error);
        toast.error(`Failed to update: ${error.message}`);
      },
      onSettled: () => {
        setUpdatingField(null);
      },
    });
  };

  // Helper to render toggle fields
  const renderToggleField = (label: string, field: string) => (
    <ToggleProperty
      key={field}
      label={label}
      field={field}
      value={Boolean(transaction[field as keyof typeof transaction])}
      onChange={(value) => handleToggle(field, value)}
      isDisabled={updatingField === field}
      tooltip={fieldDescriptions[field as keyof typeof fieldDescriptions]}
    />
  );

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
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {renderToggleField('Tax Deductible', 'taxDeductible')}
            {renderToggleField('Tax Exempt', 'taxExempt')}
            {renderToggleField('Exclude from Budget', 'excludeFromBudget')}
            {renderToggleField('Reimbursable', 'reimbursable')}
            {renderToggleField('Planned Expense', 'plannedExpense')}
            {renderToggleField('Discretionary', 'discretionary')}
          </div>
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
