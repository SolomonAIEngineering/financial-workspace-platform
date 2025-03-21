import * as React from 'react';

import { CreditCard } from 'lucide-react';
import { DetailRow } from './detail-row';
import { FieldRenderer } from './field-renderer';
import { SubheadingWithTooltip } from './subheading-with-tooltip';
import { TransactionSection } from './transaction-section';
import { sectionDescriptions } from './section-descriptions';
import { useTransactionContext } from './transaction-context';

/**
 * PaymentDetailsSection - Displays transaction payment details
 * 
 * This component handles the display and editing of payment-related information,
 * including payment method, channels, card details, and reference numbers.
 */
export function PaymentDetailsSection() {
    const { transaction } = useTransactionContext();

    return (
        <TransactionSection
            title="Payment Details"
            icon={<CreditCard className="h-4 w-4" />}
            defaultOpen={
                !!(
                    transaction.paymentMethod ||
                    transaction.paymentChannel ||
                    transaction.cardType
                )
            }
            tooltip={sectionDescriptions.paymentDetails}
        >
            <div className="space-y-1">
                <FieldRenderer field="paymentMethod" label="Payment Method" />
                <FieldRenderer field="paymentChannel" label="Payment Channel" />
                <FieldRenderer field="paymentProcessor" label="Payment Processor" />
                <FieldRenderer field="paymentGateway" label="Payment Gateway" />

                {/* Card details */}
                {(transaction.cardType ||
                    transaction.cardNetwork ||
                    transaction.cardLastFour) && (
                        <div className="mt-2 border-t border-border/20 pt-2">
                            <SubheadingWithTooltip
                                label="Card Information"
                                tooltip="Details about the card used for this transaction"
                            />
                            <FieldRenderer field="cardType" label="Card Type" />
                            <FieldRenderer field="cardNetwork" label="Card Network" />
                            <FieldRenderer field="cardLastFour" label="Last Four" />
                        </div>
                    )}

                {/* Reference numbers */}
                {(transaction.transactionReference ||
                    transaction.authorizationCode ||
                    transaction.checkNumber ||
                    transaction.wireReference ||
                    transaction.accountNumber) && (
                        <div className="mt-2 border-t border-border/20 pt-2">
                            <SubheadingWithTooltip
                                label="Reference Information"
                                tooltip="Reference numbers and identifiers associated with this transaction"
                            />
                            <FieldRenderer
                                field="transactionReference"
                                label="Transaction Reference"
                                monospace
                            />
                            <FieldRenderer
                                field="authorizationCode"
                                label="Authorization Code"
                                monospace
                            />
                            <FieldRenderer
                                field="checkNumber"
                                label="Check Number"
                                monospace
                            />
                            <FieldRenderer
                                field="wireReference"
                                label="Wire Reference"
                                monospace
                            />
                            <FieldRenderer
                                field="accountNumber"
                                label="Account Number"
                                monospace
                            />
                        </div>
                    )}
            </div>
        </TransactionSection>
    );
} 