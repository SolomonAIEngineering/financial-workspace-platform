import { DetailRow } from './detail-row';
import { FieldRenderer } from './field-renderer';
import React from 'react';
import { SubheadingWithTooltip } from './subheading-with-tooltip';
import { TransactionSection } from './transaction-section';
import { User } from 'lucide-react';
import { fieldDescriptions } from './field-descriptions';
import { sectionDescriptions } from './section-descriptions';
import { useTransactionContext } from './transaction-context';

/**
 * MerchantSection component displays merchant information about a transaction.
 */
export function MerchantSection() {
    const { transaction } = useTransactionContext();

    // Prepare merchant website URL
    const getMerchantWebsiteUrl = (website: string) => {
        return website.startsWith('http') ? website : `https://${website}`;
    };

    return (
        <TransactionSection
            title="Merchant Details"
            icon={<User className="h-4 w-4" />}
            defaultOpen={!!transaction.merchantName}
            tooltip={sectionDescriptions.merchantDetails}
        >
            <div className="space-y-1">
                <FieldRenderer field="merchantName" label="Merchant Name" />
                <DetailRow
                    label="Merchant ID"
                    value={transaction.merchantId || '-'}
                    tooltip={fieldDescriptions.merchantId}
                    monospace
                />
                <FieldRenderer field="merchantCategory" label="Merchant Category" />
                <FieldRenderer
                    field="merchantWebsite"
                    label="Website"
                    href={transaction.merchantWebsite ?
                        getMerchantWebsiteUrl(transaction.merchantWebsite) : undefined}
                />
                <FieldRenderer field="merchantPhone" label="Phone" />

                {/* Address information */}
                {(transaction.merchantAddress ||
                    transaction.merchantCity ||
                    transaction.merchantState ||
                    transaction.merchantZip ||
                    transaction.merchantCountry) && (
                        <div className="mt-2 border-t border-border/20 pt-2">
                            <SubheadingWithTooltip
                                label="Merchant Address"
                                tooltip="Physical address of the merchant or business"
                            />
                            <FieldRenderer field="merchantAddress" label="Street" />
                            <FieldRenderer field="merchantCity" label="City" />
                            <FieldRenderer field="merchantState" label="State" />
                            <FieldRenderer field="merchantZip" label="ZIP" />
                            {transaction.merchantCountry && (
                                <DetailRow
                                    label="Country"
                                    value={transaction.merchantCountry}
                                    tooltip={fieldDescriptions.merchantCountry}
                                />
                            )}
                        </div>
                    )}
            </div>
        </TransactionSection>
    );
} 