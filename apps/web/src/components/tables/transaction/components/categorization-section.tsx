import * as React from 'react';

import { Check, Loader2, Tag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/registry/default/potion-ui/dropdown-menu';

import { Badge } from '@/components/ui/badge';
import { DetailRow } from './detail-row';
import { FieldRenderer } from './field-renderer';
import { SubheadingWithTooltip } from './subheading-with-tooltip';
import { TransactionCategory } from '@solomonai/prisma/client';
import { TransactionSection } from './transaction-section';
import { categoryColors } from '../columns';
import { sectionDescriptions } from './section-descriptions';
import { toast } from 'sonner';
import { useTransactionContext } from './transaction-context';
import { useUpdateTransactionCategory } from '@/trpc/hooks/transaction-hooks';

/**
 * CategorizationSection - Displays transaction categorization details
 *
 * This component handles the display and editing of transaction categorization
 * information, including categories, tags, and fiscal period details.
 */
export function CategorizationSection() {
  const { transaction, isEditMode, toggleEditMode, updateTransactionData } =
    useTransactionContext();
  const updateCategory = useUpdateTransactionCategory();
  const [updatingCategory, setUpdatingCategory] = React.useState<string | null>(
    null
  );

  // Create selectable options from TransactionCategory enum
  const categoryOptions = Object.values(TransactionCategory).map(
    (category) => ({
      label: category,
      value: category,
    })
  );

  const handleCategoryUpdate = (newCategory: string) => {
    if (!transaction.id) return;

    setUpdatingCategory(newCategory);

    updateCategory.mutate(
      {
        id: transaction.id,
        category: newCategory as TransactionCategory,
      },
      {
        onSuccess: (updatedTransaction) => {
          // Update the transaction data in the context to reflect the changes immediately
          // Only pass the category field to avoid sending unwanted Date objects
          updateTransactionData({
            category: newCategory as TransactionCategory,
          });

          toast.success(
            `Category updated to ${newCategory.replaceAll(/_/g, ' ')}`
          );
          setUpdatingCategory(null);
        },
        onError: (error) => {
          toast.error(`Failed to update category: ${error.message}`);
          console.error('Update category error:', error.message);
          setUpdatingCategory(null);
        },
      }
    );
  };

  const renderCategoryField = () => {
    if (isEditMode) {
      // In edit mode, use the standard FieldRenderer with select options
      return (
        <FieldRenderer
          field="category"
          label="Category"
          isSelect={true}
          selectOptions={categoryOptions}
          isBadge={!!transaction.category}
        />
      );
    }

    // Outside of edit mode, use the enhanced dropdown
    const category = transaction.category as keyof typeof categoryColors | null;

    if (category && categoryColors[category]) {
      return (
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium text-foreground/70">
            Category
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="group flex w-fit cursor-pointer items-center gap-2 opacity-90 transition-opacity hover:opacity-100">
                <div className="flex items-center justify-center p-0.5 transition-transform group-hover:scale-105">
                  {categoryColors[category].icon}
                </div>
                <Badge
                  className={`${categoryColors[category].badge} rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all duration-200 group-hover:shadow group-hover:brightness-105`}
                >
                  {category.replaceAll(/_/g, ' ')}
                </Badge>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-72 overflow-hidden rounded-xl border border-border/50 bg-background/95 p-3 shadow-xl backdrop-blur-md"
              sideOffset={5}
            >
              <DropdownMenuLabel className="mb-2 flex items-center gap-2 border-b border-border/30 px-3 py-2 text-sm font-semibold text-foreground/90">
                <Tag className="h-4 w-4 text-primary/70" />
                <span>Update Category</span>
              </DropdownMenuLabel>
              <div className="scrollbar-hide max-h-[350px] overflow-y-auto px-1 py-1">
                {(() => {
                  // Group categories by first letter
                  const groups: Record<string, React.ReactNode[]> = {};

                  Object.entries(categoryColors).forEach(([cat, color]) => {
                    const firstLetter = cat.charAt(0).toUpperCase();
                    if (!groups[firstLetter]) {
                      groups[firstLetter] = [];
                    }

                    groups[firstLetter].push(
                      <DropdownMenuItem
                        key={cat}
                        onClick={() => handleCategoryUpdate(cat)}
                        disabled={updatingCategory !== null}
                        className={`mb-1 flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${cat === category ? 'bg-primary/10 font-medium text-primary-foreground/90' : 'hover:bg-accent/50 focus:bg-accent'}`}
                      >
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full border bg-background shadow-sm ${cat === category ? 'border-primary/30' : 'border-border/30'} ${updatingCategory === cat ? 'animate-pulse' : ''}`}
                        >
                          {updatingCategory === cat ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            categoryColors[cat as keyof typeof categoryColors]
                              .icon
                          )}
                        </div>
                        <span className="text-sm">
                          {cat.replaceAll(/_/g, ' ')}
                        </span>
                        {cat === category && (
                          <Check className="ml-auto h-4 w-4 text-primary" />
                        )}
                      </DropdownMenuItem>
                    );
                  });

                  // Convert groups to JSX
                  return Object.entries(groups).map(([letter, items]) => (
                    <div key={letter} className="mb-2">
                      <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {letter}
                      </div>
                      {items}
                    </div>
                  ));
                })()}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    // No category set - show dropdown with "Uncategorized" label
    return (
      <div className="flex flex-col space-y-1">
        <span className="text-sm font-medium text-foreground/70">Category</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="group flex w-fit cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground">
              <Badge
                variant="outline"
                className="rounded-md px-2.5 py-1.5 text-xs font-medium transition-all group-hover:border-border/50 group-hover:shadow-sm"
              >
                Uncategorized
              </Badge>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-72 overflow-hidden rounded-xl border border-border/50 bg-background/95 p-3 shadow-xl backdrop-blur-md"
            sideOffset={5}
          >
            <DropdownMenuLabel className="mb-2 flex items-center gap-2 border-b border-border/30 px-3 py-2 text-sm font-semibold text-foreground/90">
              <Tag className="h-4 w-4 text-primary/70" />
              <span>Set Category</span>
            </DropdownMenuLabel>
            <div className="scrollbar-hide max-h-[350px] overflow-y-auto px-1 py-1">
              {(() => {
                // Group categories by first letter
                const groups: Record<string, React.ReactNode[]> = {};

                Object.entries(categoryColors).forEach(([cat, color]) => {
                  const firstLetter = cat.charAt(0).toUpperCase();
                  if (!groups[firstLetter]) {
                    groups[firstLetter] = [];
                  }

                  groups[firstLetter].push(
                    <DropdownMenuItem
                      key={cat}
                      onClick={() => handleCategoryUpdate(cat)}
                      disabled={updatingCategory !== null}
                      className={`mb-1 flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-accent/50 focus:bg-accent`}
                    >
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full border border-border/30 bg-background shadow-sm ${updatingCategory === cat ? 'animate-pulse' : ''}`}
                      >
                        {updatingCategory === cat ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          categoryColors[cat as keyof typeof categoryColors]
                            .icon
                        )}
                      </div>
                      <span className="text-sm">
                        {cat.replaceAll(/_/g, ' ')}
                      </span>
                    </DropdownMenuItem>
                  );
                });

                // Convert groups to JSX
                return Object.entries(groups).map(([letter, items]) => (
                  <div key={letter} className="mb-2">
                    <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {letter}
                    </div>
                    {items}
                  </div>
                ));
              })()}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <TransactionSection
      title="Categorization"
      icon={<Tag className="h-4 w-4" />}
      defaultOpen={!!transaction.category || !!transaction.customCategory}
      tooltip={sectionDescriptions.categorization}
    >
      <div className="space-y-1">
        {renderCategoryField()}

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
              <DetailRow label="Fiscal Year" value={transaction.fiscalYear} />
            )}
            {transaction.fiscalMonth && (
              <DetailRow label="Fiscal Month" value={transaction.fiscalMonth} />
            )}
            {transaction.fiscalQuarter && (
              <DetailRow
                label="Fiscal Quarter"
                value={transaction.fiscalQuarter}
              />
            )}
          </div>
        )}

        {/* Insight tags */}
        {transaction.insightTags && transaction.insightTags.length > 0 && (
          <DetailRow
            label="Insight Tags"
            value={transaction.insightTags.join(', ')}
          />
        )}

        {/* Labels */}
        {transaction.labels && transaction.labels.length > 0 && (
          <DetailRow label="Labels" value={transaction.labels.join(', ')} />
        )}
      </div>
    </TransactionSection>
  );
}
