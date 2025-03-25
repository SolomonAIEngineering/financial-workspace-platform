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

/** CategorySelectionMenu - Component for the category dropdown menu */
interface CategorySelectionMenuProps {
  currentCategory: string | null;
  updatingCategory: string | null;
  onCategorySelect: (category: string) => void;
  menuLabel: string;
  options: Record<string, any>;
}

function CategorySelectionMenu({
  currentCategory,
  updatingCategory,
  onCategorySelect,
  menuLabel,
  options,
}: CategorySelectionMenuProps) {
  // Group options by first letter
  const groups: Record<string, React.ReactNode[]> = {};

  Object.entries(options).forEach(([category, data]) => {
    const firstLetter = category.charAt(0).toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }

    groups[firstLetter].push(
      <DropdownMenuItem
        key={category}
        onClick={() => onCategorySelect(category)}
        disabled={updatingCategory !== null}
        className={`mb-1 flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${
          category === currentCategory
            ? 'bg-primary/10 font-medium text-primary-foreground/90'
            : 'hover:bg-accent/50'
        }`}
      >
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full border bg-background shadow-sm ${
            category === currentCategory
              ? 'border-primary/30'
              : 'border-border/30'
          } ${updatingCategory === category ? 'animate-pulse' : ''}`}
        >
          {updatingCategory === category ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            data.icon || <Tag className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <span className="text-sm">{category.replaceAll(/_/g, ' ')}</span>
        {category === currentCategory && (
          <Check className="ml-auto h-4 w-4 text-primary" />
        )}
      </DropdownMenuItem>
    );
  });

  return (
    <div className="scrollbar-hide max-h-[350px] overflow-y-auto px-1 py-1">
      {Object.entries(groups).map(([letter, items]) => (
        <div key={letter} className="mb-2">
          <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">
            {letter}
          </div>
          {items}
        </div>
      ))}
    </div>
  );
}

/** CategoryField - Reusable component for category-related fields */
interface CategoryFieldProps {
  fieldName: string;
  label: string;
  value: string | null;
  updatingValue: string | null;
  onValueUpdate: (newValue: string) => void;
  options: Record<string, any>;
  isEditMode: boolean;
  selectOptions?: { label: string; value: string }[];
  badgeType?: string;
}

function CategoryField({
  fieldName,
  label,
  value,
  updatingValue,
  onValueUpdate,
  options,
  isEditMode,
  selectOptions,
  badgeType,
}: CategoryFieldProps) {
  if (isEditMode) {
    // In edit mode, use the standard FieldRenderer with select options
    return (
      <FieldRenderer
        field={fieldName}
        label={label}
        isSelect={!!selectOptions}
        selectOptions={selectOptions}
        isBadge={!!value}
        badgeType={badgeType}
      />
    );
  }

  // Outside of edit mode, use the enhanced dropdown
  if (value && options[value]) {
    const optionData = options[value];
    return (
      <div className="flex flex-col space-y-1">
        <span className="text-sm font-medium text-foreground/70">{label}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="group flex w-fit cursor-pointer items-center gap-2 opacity-90 transition-opacity hover:opacity-100">
              {optionData.icon && (
                <div className="flex items-center justify-center p-0.5 transition-transform group-hover:scale-105">
                  {optionData.icon}
                </div>
              )}
              <Badge
                className={`${optionData.badge || 'bg-primary/10 text-primary-foreground'} rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all duration-200 group-hover:shadow group-hover:brightness-105`}
              >
                {value.replaceAll(/_/g, ' ')}
              </Badge>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-72 overflow-hidden rounded-xl border border-border/50 bg-background/95 p-3 shadow-xl"
            sideOffset={5}
          >
            <DropdownMenuLabel className="mb-2 flex items-center gap-2 border-b border-border/30 px-3 py-2 text-sm font-semibold text-foreground/90">
              <Tag className="h-4 w-4 text-primary/70" />
              <span>Update {label}</span>
            </DropdownMenuLabel>
            <CategorySelectionMenu
              currentCategory={value}
              updatingCategory={updatingValue}
              onCategorySelect={onValueUpdate}
              menuLabel={`Update ${label}`}
              options={options}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // No value set - show dropdown with "Not set" label
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-sm font-medium text-foreground/70">{label}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="group flex w-fit cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground">
            <Badge
              variant="outline"
              className="rounded-md px-2.5 py-1.5 text-xs font-medium transition-all group-hover:border-border/50 group-hover:shadow-sm"
            >
              Not set
            </Badge>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-72 overflow-hidden rounded-xl border border-border/50 bg-background/95 p-3 shadow-xl"
          sideOffset={5}
        >
          <DropdownMenuLabel className="mb-2 flex items-center gap-2 border-b border-border/30 px-3 py-2 text-sm font-semibold text-foreground/90">
            <Tag className="h-4 w-4 text-primary/70" />
            <span>Set {label}</span>
          </DropdownMenuLabel>
          <CategorySelectionMenu
            currentCategory={value}
            updatingCategory={updatingValue}
            onCategorySelect={onValueUpdate}
            menuLabel={`Set ${label}`}
            options={options}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * CategorySelector - Component for selecting and displaying the main
 * transaction category
 */
interface CategorySelectorProps {
  category: keyof typeof categoryColors | null;
  updatingCategory: string | null;
  onCategoryUpdate: (category: string) => void;
  isEditMode: boolean;
  categoryOptions: { label: string; value: string }[];
}

function CategorySelector({
  category,
  updatingCategory,
  onCategoryUpdate,
  isEditMode,
  categoryOptions,
}: CategorySelectorProps) {
  return (
    <CategoryField
      fieldName="category"
      label="Category"
      value={category}
      updatingValue={updatingCategory}
      onValueUpdate={onCategoryUpdate}
      options={categoryColors}
      isEditMode={isEditMode}
      selectOptions={categoryOptions}
    />
  );
}

/** BudgetCategoryFields - Component for budget-related category fields */
function BudgetCategoryFields() {
  return (
    <>
      <FieldRenderer field="budgetCategory" label="Budget Category" />
      <FieldRenderer field="budgetSubcategory" label="Budget Subcategory" />
      <FieldRenderer field="needsWantsCategory" label="Needs/Wants" />
    </>
  );
}

/** FiscalPeriodSection - Component for fiscal period information */
interface FiscalPeriodSectionProps {
  fiscalYear?: string | number | null;
  fiscalMonth?: string | number | null;
  fiscalQuarter?: string | number | null;
}

function FiscalPeriodSection({
  fiscalYear,
  fiscalMonth,
  fiscalQuarter,
}: FiscalPeriodSectionProps) {
  if (!fiscalYear && !fiscalMonth && !fiscalQuarter) {
    return null;
  }

  return (
    <div className="mt-2 border-t border-border/20 pt-2">
      <SubheadingWithTooltip
        label="Fiscal Period"
        tooltip="Financial period to which this transaction belongs"
      />
      {fiscalYear && (
        <DetailRow label="Fiscal Year" value={String(fiscalYear)} />
      )}
      {fiscalMonth && (
        <DetailRow label="Fiscal Month" value={String(fiscalMonth)} />
      )}
      {fiscalQuarter && (
        <DetailRow label="Fiscal Quarter" value={String(fiscalQuarter)} />
      )}
    </div>
  );
}

/** TagsAndLabelsSection - Component for displaying tags and labels */
interface TagsAndLabelsSectionProps {
  insightTags?: string[] | null;
  labels?: string[] | null;
}

function TagsAndLabelsSection({
  insightTags,
  labels,
}: TagsAndLabelsSectionProps) {
  return (
    <>
      {insightTags && insightTags.length > 0 && (
        <DetailRow label="Insight Tags" value={insightTags.join(', ')} />
      )}

      {labels && labels.length > 0 && (
        <DetailRow label="Labels" value={labels.join(', ')} />
      )}
    </>
  );
}

/**
 * CategorizationSection - Displays transaction categorization details
 *
 * This component handles the display and editing of transaction categorization
 * information, including categories, tags, and fiscal period details.
 */
export function CategorizationSection() {
  const { transaction, isEditMode, updateTransactionData } =
    useTransactionContext();
  const updateCategory = useUpdateTransactionCategory();
  const [updatingField, setUpdatingField] = React.useState<string | null>(null);

  // Create selectable options from TransactionCategory enum
  const categoryOptions = Object.values(TransactionCategory).map(
    (category) => ({
      label: category,
      value: category,
    })
  );

  // Subcategory and custom category should use the same options as the main category
  const getSubcategoryOptions = () => {
    return categoryColors;
  };

  // Custom category should also use the same options as the main category
  const getCustomCategoryOptions = () => {
    return categoryColors;
  };

  const handleCategoryUpdate = (newCategory: string) => {
    if (!transaction.id) return;

    setUpdatingField(newCategory);

    updateCategory.mutate(
      {
        id: transaction.id,
        category: newCategory as TransactionCategory,
      },
      {
        onSuccess: () => {
          updateTransactionData({
            category: newCategory as TransactionCategory,
          });

          toast.success(
            `Category updated to ${newCategory.replaceAll(/_/g, ' ')}`
          );
          setUpdatingField(null);
        },
        onError: (error) => {
          toast.error(`Failed to update category: ${error.message}`);
          console.error('Update category error:', error.message);
          setUpdatingField(null);
        },
      }
    );
  };

  const handleSubcategoryUpdate = (newSubcategory: string) => {
    if (!transaction.id) return;

    setUpdatingField(newSubcategory);

    updateCategory.mutate(
      {
        id: transaction.id,
        category: transaction.category as TransactionCategory,
        subCategory: newSubcategory,
      },
      {
        onSuccess: () => {
          updateTransactionData({
            subCategory: newSubcategory,
          });

          toast.success(
            `Subcategory updated to ${newSubcategory.replaceAll(/_/g, ' ')}`
          );
          setUpdatingField(null);
        },
        onError: (error) => {
          toast.error(`Failed to update subcategory: ${error.message}`);
          console.error('Update subcategory error:', error.message);
          setUpdatingField(null);
        },
      }
    );
  };

  const handleCustomCategoryUpdate = (newCustomCategory: string) => {
    if (!transaction.id) return;

    setUpdatingField(newCustomCategory);

    updateCategory.mutate(
      {
        id: transaction.id,
        category: transaction.category as TransactionCategory,
        customCategory: newCustomCategory,
      },
      {
        onSuccess: () => {
          updateTransactionData({
            customCategory: newCustomCategory,
          });

          toast.success(
            `Custom category updated to ${newCustomCategory.replaceAll(/_/g, ' ')}`
          );
          setUpdatingField(null);
        },
        onError: (error) => {
          toast.error(`Failed to update custom category: ${error.message}`);
          console.error('Update custom category error:', error.message);
          setUpdatingField(null);
        },
      }
    );
  };

  return (
    <TransactionSection
      title="Categorization"
      icon={<Tag className="h-4 w-4" />}
      defaultOpen={!!transaction.category || !!transaction.customCategory}
      tooltip={sectionDescriptions.categorization}
    >
      <div className="space-y-4">
        <CategorySelector
          category={transaction.category as keyof typeof categoryColors | null}
          updatingCategory={updatingField}
          onCategoryUpdate={handleCategoryUpdate}
          isEditMode={isEditMode}
          categoryOptions={categoryOptions}
        />

        {transaction.category && (
          <CategoryField
            fieldName="subCategory"
            label="Subcategory"
            value={transaction.subCategory}
            updatingValue={updatingField}
            onValueUpdate={handleSubcategoryUpdate}
            options={getSubcategoryOptions()}
            isEditMode={isEditMode}
            selectOptions={categoryOptions}
          />
        )}

        <CategoryField
          fieldName="customCategory"
          label="Custom Category"
          value={transaction.customCategory}
          updatingValue={updatingField}
          onValueUpdate={handleCustomCategoryUpdate}
          options={getCustomCategoryOptions()}
          isEditMode={isEditMode}
          selectOptions={categoryOptions}
          badgeType="info"
        />

        {/* Budget related fields */}
        <BudgetCategoryFields />

        {/* Fiscal information */}
        <FiscalPeriodSection
          fiscalYear={transaction.fiscalYear}
          fiscalMonth={transaction.fiscalMonth}
          fiscalQuarter={transaction.fiscalQuarter}
        />

        {/* Tags and Labels */}
        <TagsAndLabelsSection
          insightTags={transaction.insightTags}
          labels={transaction.labels}
        />
      </div>
    </TransactionSection>
  );
}
