import * as React from 'react';

import { DetailRow } from './detail-row';
import { FieldRenderer } from './field-renderer';
import { SubheadingWithTooltip } from './subheading-with-tooltip';
import { Tag } from 'lucide-react';
import { TagsField } from './tags-field';
import { TransactionCategory } from '@solomonai/prisma/client';
import { TransactionSection } from './transaction-section';
import { sectionDescriptions } from './section-descriptions';
import { useTransactionContext } from './transaction-context';

/**
 * CategorizationSection - Displays transaction categorization details
 * 
 * This component handles the display and editing of transaction categorization 
 * information, including categories, tags, and fiscal period details.
 */
export function CategorizationSection() {
    const { transaction } = useTransactionContext();

    // Create selectable options from TransactionCategory enum
    const categoryOptions = Object.values(TransactionCategory).map(category => ({
        label: category,
        value: category
    }));

    return (
        <TransactionSection
            title="Categorization"
            icon={<Tag className="h-4 w-4" />}
            defaultOpen={!!transaction.category || !!transaction.customCategory}
            tooltip={sectionDescriptions.categorization}
        >
            <div className="space-y-1">
                <FieldRenderer
                    field="category"
                    label="Category"
                    isSelect={true}
                    selectOptions={categoryOptions}
                    isBadge={!!transaction.category}
                />

                <FieldRenderer field="subCategory" label="Subcategory" />

                <FieldRenderer
                    field="customCategory"
                    label="Custom Category"
                    isBadge={true}
                    badgeType="info"
                />

                {/* Budget related fields */}
                <FieldRenderer field="budgetCategory" label="Budget Category" />
                <FieldRenderer field="budgetSubcategory" label="Budget Subcategory" />
                <FieldRenderer field="needsWantsCategory" label="Needs/Wants" />

                {/* Fiscal information */}
                {(transaction.fiscalYear ||
                    transaction.fiscalMonth ||
                    transaction.fiscalQuarter) && (
                        <div className="mt-2 border-t border-border/20 pt-2">
                            <SubheadingWithTooltip
                                label="Fiscal Period"
                                tooltip="Financial period to which this transaction belongs"
                            />
                            {transaction.fiscalYear && (
                                <DetailRow
                                    label="Fiscal Year"
                                    value={transaction.fiscalYear}
                                />
                            )}
                            {transaction.fiscalMonth && (
                                <DetailRow
                                    label="Fiscal Month"
                                    value={transaction.fiscalMonth}
                                />
                            )}
                            {transaction.fiscalQuarter && (
                                <DetailRow
                                    label="Fiscal Quarter"
                                    value={transaction.fiscalQuarter}
                                />
                            )}
                        </div>
                    )}

                {/* Tags */}
                <div className="mt-2 border-t border-border/20 pt-2">
                    <TagsField />
                </div>

                {/* Insight tags */}
                {transaction.insightTags && transaction.insightTags.length > 0 && (
                    <DetailRow
                        label="Insight Tags"
                        value={transaction.insightTags.join(', ')}
                    />
                )}

                {/* Labels */}
                {transaction.labels && transaction.labels.length > 0 && (
                    <DetailRow
                        label="Labels"
                        value={transaction.labels.join(', ')}
                    />
                )}
            </div>
        </TransactionSection>
    );
} 