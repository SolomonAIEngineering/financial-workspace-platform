import * as React from 'react';

import { DetailRow } from './detail-row';
import { FieldRenderer } from './field-renderer';
import { PropertiesGrid } from './properties-grid';
import { Receipt } from 'lucide-react';
import { SubheadingWithTooltip } from './subheading-with-tooltip';
import { TransactionSection } from './transaction-section';
import { sectionDescriptions } from './section-descriptions';
import { useTransactionContext } from './transaction-context';

/**
 * TaxFinancialSection - Displays transaction tax and financial details
 * 
 * This component handles the display and editing of tax and financial information,
 * including tax status, amounts, rates, and business information.
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

    return (
        <TransactionSection
            title="Tax & Financial"
            icon={<Receipt className="h-4 w-4" />}
            defaultOpen={
                !!(
                    transaction.taxDeductible ||
                    transaction.vatAmount ||
                    transaction.taxAmount
                )
            }
            tooltip={sectionDescriptions.taxFinancial}
        >
            <div className="space-y-1">
                {/* Tax information */}
                {isEditMode ? (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <FieldRenderer field="taxDeductible" label="Tax Deductible" isBoolean={true} />
                        <FieldRenderer field="taxExempt" label="Tax Exempt" isBoolean={true} />
                        <FieldRenderer field="reimbursable" label="Reimbursable" isBoolean={true} />
                        <FieldRenderer field="excludeFromBudget" label="Exclude From Budget" isBoolean={true} />
                        <FieldRenderer field="plannedExpense" label="Planned Expense" isBoolean={true} />
                        <FieldRenderer field="discretionary" label="Discretionary" isBoolean={true} />
                    </div>
                ) : (
                    <PropertiesGrid
                        taxDeductible={transaction.taxDeductible}
                        taxExempt={transaction.taxExempt}
                        reimbursable={transaction.reimbursable}
                        excludeFromBudget={transaction.excludeFromBudget}
                        plannedExpense={transaction.plannedExpense}
                        discretionary={transaction.discretionary}
                    />
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
                    <FieldRenderer field="businessPurpose" label="Business Purpose" isTextarea={true} />
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
                        <FieldRenderer field="cashFlowCategory" label="Cash Flow Category" />
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