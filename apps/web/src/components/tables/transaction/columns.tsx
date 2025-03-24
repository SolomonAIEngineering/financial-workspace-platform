'use client';

import {
  Check,
  CreditCard,
  Download,
  Minus,
  Upload,
  X
} from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/registry/default/potion-ui/hover-card';
import { format, isSameDay } from 'date-fns';
import { isArrayOfDates, isArrayOfNumbers } from '@/lib/is-array';

import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import type { ColumnSchema } from './schema';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { HoverCardPortal } from '@radix-ui/react-hover-card';
import { TextWithTooltip } from '@/components/ui/text-with-tooltip';

/**
 * Defines the data table columns for financial transactions. This file contains
 * column definitions, formatting functions, category colors, and cell renderers
 * for displaying transaction data in a tabular format.
 *
 * @file Columns.tsx
 */

/**
 * Visual styling for different transaction categories. Defines badge colors,
 * dot colors, and icons for each transaction category. These styles provide
 * consistent visual cues throughout the UI.
 *
 * @property INCOME - Styling for income transactions (green)
 * @property TRANSFER - Styling for transfers (indigo)
 * @property LOAN_PAYMENTS - Styling for loan payments (purple)
 * @property BANK_FEES - Styling for bank fees (red)
 * @property ENTERTAINMENT - Styling for entertainment expenses (amber)
 * @property FOOD_AND_DRINK - Styling for food and dining (orange)
 * @property GENERAL_MERCHANDISE - Styling for retail purchases (blue)
 * @property HOME_IMPROVEMENT - Styling for home expenses (emerald)
 * @property MEDICAL - Styling for healthcare expenses (rose)
 * @property PERSONAL_CARE - Styling for personal expenses (pink)
 * @property GENERAL_SERVICES - Styling for service purchases (sky)
 * @property GOVERNMENT_AND_NON_PROFIT - Styling for government payments (slate)
 * @property TRANSPORTATION - Styling for transportation expenses (teal)
 * @property TRAVEL - Styling for travel expenses (violet)
 * @property UTILITIES - Styling for utility payments (yellow)
 * @property OTHER - Styling for uncategorized transactions (gray)
 */
export const categoryColors = {
  INCOME: {
    badge:
      'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20 hover:bg-[#10b981]/10',
    dot: 'bg-[#10b981]',
    icon: <Download className="h-4 w-4 text-[#10b981]" />,
  },
  TRANSFER: {
    badge:
      'text-[#6366f1] bg-[#6366f1]/10 border-[#6366f1]/20 hover:bg-[#6366f1]/10',
    dot: 'bg-[#6366f1]',
    icon: <CreditCard className="h-4 w-4 text-[#6366f1]" />,
  },
  LOAN_PAYMENTS: {
    badge:
      'text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/20 hover:bg-[#8b5cf6]/10',
    dot: 'bg-[#8b5cf6]',
    icon: <Upload className="h-4 w-4 text-[#8b5cf6]" />,
  },
  BANK_FEES: {
    badge:
      'text-[#f43f5e] bg-[#f43f5e]/10 border-[#f43f5e]/20 hover:bg-[#f43f5e]/10',
    dot: 'bg-[#f43f5e]',
    icon: <Upload className="h-4 w-4 text-[#f43f5e]" />,
  },
  ENTERTAINMENT: {
    badge:
      'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20 hover:bg-[#f59e0b]/10',
    dot: 'bg-[#f59e0b]',
    icon: <Minus className="h-4 w-4 text-[#f59e0b]" />,
  },
  FOOD_AND_DRINK: {
    badge:
      'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20 hover:bg-[#10b981]/10',
    dot: 'bg-[#10b981]',
    icon: <Upload className="h-4 w-4 text-[#10b981]" />,
  },
  GENERAL_MERCHANDISE: {
    badge:
      'text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20 hover:bg-[#3b82f6]/10',
    dot: 'bg-[#3b82f6]',
    icon: <Upload className="h-4 w-4 text-[#3b82f6]" />,
  },
  HOME_IMPROVEMENT: {
    badge:
      'text-[#f97316] bg-[#f97316]/10 border-[#f97316]/20 hover:bg-[#f97316]/10',
    dot: 'bg-[#f97316]',
    icon: <Upload className="h-4 w-4 text-[#f97316]" />,
  },
  MEDICAL: {
    badge:
      'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20 hover:bg-[#ef4444]/10',
    dot: 'bg-[#ef4444]',
    icon: <Upload className="h-4 w-4 text-[#ef4444]" />,
  },
  PERSONAL_CARE: {
    badge:
      'text-[#ec4899] bg-[#ec4899]/10 border-[#ec4899]/20 hover:bg-[#ec4899]/10',
    dot: 'bg-[#ec4899]',
    icon: <Upload className="h-4 w-4 text-[#ec4899]" />,
  },
  GENERAL_SERVICES: {
    badge:
      'text-[#6366f1] bg-[#6366f1]/10 border-[#6366f1]/20 hover:bg-[#6366f1]/10',
    dot: 'bg-[#6366f1]',
    icon: <Upload className="h-4 w-4 text-[#6366f1]" />,
  },
  GOVERNMENT_AND_NON_PROFIT: {
    badge:
      'text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/20 hover:bg-[#0ea5e9]/10',
    dot: 'bg-[#0ea5e9]',
    icon: <Upload className="h-4 w-4 text-[#0ea5e9]" />,
  },
  TRANSPORTATION: {
    badge:
      'text-[#14b8a6] bg-[#14b8a6]/10 border-[#14b8a6]/20 hover:bg-[#14b8a6]/10',
    dot: 'bg-[#14b8a6]',
    icon: <Upload className="h-4 w-4 text-[#14b8a6]" />,
  },
  TRAVEL: {
    badge:
      'text-[#0284c7] bg-[#0284c7]/10 border-[#0284c7]/20 hover:bg-[#0284c7]/10',
    dot: 'bg-[#0284c7]',
    icon: <Upload className="h-4 w-4 text-[#0284c7]" />,
  },
  UTILITIES: {
    badge:
      'text-[#f97316] bg-[#f97316]/10 border-[#f97316]/20 hover:bg-[#f97316]/10',
    dot: 'bg-[#f97316]',
    icon: <Upload className="h-4 w-4 text-[#f97316]" />,
  },
  OTHER: {
    badge:
      'text-[#64748b] bg-[#64748b]/10 border-[#64748b]/20 hover:bg-[#64748b]/10',
    dot: 'bg-[#64748b]',
    icon: <Upload className="h-4 w-4 text-[#64748b]" />,
  },
} as Record<string, Record<'badge' | 'dot' | 'icon', any>>;

/**
 * Column definitions for the transactions data table. Defines the structure,
 * sorting, filtering, and rendering of each column in the table.
 *
 * Columns include:
 *
 * - Transaction name (with hover details)
 * - Merchant name
 * - Amount (with currency formatting)
 * - Date (with formatted display)
 * - Category (with color coding)
 * - Payment method
 * - Status
 *
 * Each column definition includes:
 *
 * - AccessorKey: The property key in the data object
 * - Header: The column header component
 * - Cell: The cell renderer function
 * - FilterFn: Custom filtering logic where needed
 *
 * @type {ColumnDef<ColumnSchema>[]}
 */
export const columns: ColumnDef<ColumnSchema>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('name');
      return <div className="font-medium">{`${value}`}</div>;
    },
    enableHiding: false,
    size: 175,
    minSize: 175,
  },
  {
    accessorKey: 'merchantName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Merchant" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('merchantName');
      return value ? (
        <TextWithTooltip
          text={`${value}`}
          className="font-mono text-sm text-muted-foreground"
        />
      ) : (
        <span className="text-muted-foreground/50">-</span>
      );
    },
    size: 150,
    minSize: 125,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number;
      const currency = row.original.currency || 'USD';
      const isIncome = row.original.category === 'INCOME';

      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);

      return (
        <div
          className={`font-mono text-sm font-medium ${isIncome ? 'text-green-600' : 'text-red-500'}`}
        >
          {formattedAmount}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as number;
      if (!isArrayOfNumbers(value)) return true;
      const [min, max] = value;
      return rowValue >= min && rowValue <= max;
    },
    size: 125,
    minSize: 100,
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const category = row.getValue('category') as
        | keyof typeof categoryColors
        | null;
      const customCategory = row.original.customCategory;

      if (category && categoryColors[category]) {
        return (
          <div className="flex cursor-pointer items-center gap-2 opacity-90 transition-opacity hover:opacity-100">
            <div className="flex items-center justify-center p-0.5">
              {categoryColors[category].icon}
            </div>
            <Badge
              className={`${categoryColors[category].badge} rounded-md px-2 py-1 text-xs font-medium shadow-sm transition-all duration-200`}
            >
              {category.replaceAll(/_/g, ' ')}
            </Badge>
          </div>
        );
      } else if (customCategory) {
        return (
          <div className="font-mono text-sm text-muted-foreground">
            {customCategory}
          </div>
        );
      }

      // No category set - show dropdown with "Uncategorized" label
      return (
        <Badge
          variant="outline"
          className="rounded-md px-2 py-1 text-xs font-medium"
        >
          Uncategorized
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as string | null;
      if (!rowValue) return false;
      if (typeof value === 'string') return value === rowValue;
      if (Array.isArray(value)) return value.includes(rowValue);
      return false;
    },
    size: 180,
    minSize: 180,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('date');
      const date = new Date(`${value}`);
      const formattedDate = format(date, 'LLL dd, y');
      const formattedTime = format(date, 'HH:mm:ss');

      return (
        <HoverCard openDelay={50} closeDelay={50}>
          <HoverCardTrigger className="opacity-90 transition-opacity hover:opacity-100">
            <div
              className="font-mono text-sm font-medium text-muted-foreground"
              suppressHydrationWarning
            >
              {formattedDate}
            </div>
          </HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent
              side="bottom"
              align="start"
              className="z-10 w-auto p-3"
            >
              <div className="flex flex-col gap-1">
                <div className="font-mono text-xs text-muted-foreground">
                  Time: {formattedTime}
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {format(date, 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCard>
      );
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id);
      if (value instanceof Date && rowValue instanceof Date) {
        return isSameDay(value, rowValue);
      }
      if (Array.isArray(value)) {
        if (isArrayOfDates(value) && rowValue instanceof Date) {
          const sorted = value.sort((a, b) => a.getTime() - b.getTime());
          return (
            sorted[0]?.getTime() <= rowValue.getTime() &&
            rowValue.getTime() <= sorted[1]?.getTime()
          );
        }
      }

      return false;
    },
    size: 120,
    minSize: 120,
  },
  {
    accessorKey: 'transactionType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('transactionType');
      if (value) {
        return (
          <div className="font-mono text-sm text-muted-foreground">
            {`${value}`.replaceAll(/_/g, ' ')}
          </div>
        );
      }
      return <Minus className="h-4 w-4 text-muted-foreground/50" />;
    },
    size: 110,
    minSize: 110,
  },
  {
    accessorKey: 'pending',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isPending = row.getValue('pending') as boolean;

      if (isPending) {
        return (
          <Badge
            variant="outline"
            className="rounded-md border-yellow-300 bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-600"
          >
            Pending
          </Badge>
        );
      }
      return (
        <Badge
          variant="outline"
          className="rounded-md border-green-300 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600"
        >
          Completed
        </Badge>
      );
    },
    size: 100,
    minSize: 100,
  },
  {
    accessorKey: 'isRecurring',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Recurring" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('isRecurring');
      if (value) return <Check className="h-4 w-4 text-green-500" />;
      return <X className="h-4 w-4 text-muted-foreground opacity-50" />;
    },
    size: 90,
    minSize: 80,
  },
  {
    accessorKey: 'frequency',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Frequency" />
    ),
    cell: ({ row }) => {
      const frequency = row.getValue('frequency') as string | null;

      // Convert enum values to more readable format
      const formattedFrequency = frequency
        ? {
          WEEKLY: 'Weekly',
          BIWEEKLY: 'Every 2 Weeks',
          MONTHLY: 'Monthly',
          SEMI_MONTHLY: 'Twice Monthly',
          ANNUALLY: 'Yearly',
          IRREGULAR: 'Irregular',
          UNKNOWN: 'Unknown',
        }[frequency] || frequency
        : null;

      return formattedFrequency ? (
        <Badge
          variant="outline"
          className="rounded-md bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 shadow-sm"
        >
          {formattedFrequency}
        </Badge>
      ) : (
        <Minus className="h-4 w-4 text-muted-foreground opacity-50" />
      );
    },
    filterFn: 'arrSome',
    size: 130,
    minSize: 110,
  },
  {
    accessorKey: 'bankAccountName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('bankAccountName') as string | undefined;
      const displayValue = value || row.original.bankAccountId;
      return (
        <HoverCard openDelay={50} closeDelay={50}>
          <HoverCardTrigger className="opacity-90 transition-opacity hover:opacity-100">
            <Badge
              variant="outline"
              className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 shadow-sm"
            >
              {displayValue}
            </Badge>
          </HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent
              side="bottom"
              align="start"
              className="z-10 w-auto p-3"
            >
              <div className="flex flex-col gap-1">
                <div className="font-medium">{displayValue}</div>
                <div className="text-xs text-muted-foreground">
                  Bank Account
                </div>
              </div>
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCard>
      );
    },
    size: 150,
    minSize: 125,
  },
  {
    accessorKey: 'paymentMethod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Method" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('paymentMethod');
      if (value) {
        return (
          <div className="font-mono text-sm text-muted-foreground">
            {`${value}`.replaceAll(/_/g, ' ')}
          </div>
        );
      }
      return <Minus className="h-4 w-4 text-muted-foreground/50" />;
    },
    size: 140,
    minSize: 120,
  },
  {
    accessorKey: 'cashFlowCategory',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cash Flow" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('cashFlowCategory') as string | null;
      if (value) {
        const badgeClass =
          value === 'INCOME'
            ? 'text-green-600 border-green-300 bg-green-50'
            : value === 'EXPENSE'
              ? 'text-red-600 border-red-300 bg-red-50'
              : 'text-blue-600 border-blue-300 bg-blue-50';

        return (
          <Badge
            variant="outline"
            className={`${badgeClass} rounded-md px-2 py-0.5 text-xs font-medium`}
          >
            {value}
          </Badge>
        );
      }
      return <Minus className="h-4 w-4 text-muted-foreground/50" />;
    },
    size: 110,
    minSize: 100,
  },
  {
    accessorKey: 'budgetCategory',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Budget Category" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('budgetCategory');
      if (value) {
        return (
          <Badge
            variant="outline"
            className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 shadow-sm"
          >
            {`${value}`.replaceAll(/_/g, ' ')}
          </Badge>
        );
      }
      return <Minus className="h-4 w-4 text-muted-foreground/50" />;
    },
    size: 140,
    minSize: 120,
  },
  {
    accessorKey: 'needsWantsCategory',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Needs/Wants" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('needsWantsCategory') as string | null;
      if (value) {
        const badgeConfig = {
          NEEDS: {
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-300',
            icon: <Check className="mr-1 h-3 w-3" />,
          },
          WANTS: {
            bg: 'bg-purple-50',
            text: 'text-purple-700',
            border: 'border-purple-300',
            icon: <CreditCard className="mr-1 h-3 w-3" />,
          },
          SAVINGS: {
            bg: 'bg-green-50',
            text: 'text-green-700',
            border: 'border-green-300',
            icon: <Download className="mr-1 h-3 w-3" />,
          },
        };

        const config = badgeConfig[value as keyof typeof badgeConfig];

        return (
          <Badge
            variant="outline"
            className={`${config.bg} ${config.text} ${config.border} flex items-center rounded-md px-2 py-0.5 text-xs font-medium shadow-sm`}
          >
            {config.icon}
            {value}
          </Badge>
        );
      }
      return <Minus className="h-4 w-4 text-muted-foreground/50" />;
    },
    size: 120,
    minSize: 100,
  },
  {
    accessorKey: 'tags',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tags" />
    ),
    cell: ({ row }) => {
      const tags = row.getValue('tags') as string[];
      if (!tags || tags.length === 0)
        return <Minus className="h-4 w-4 text-muted-foreground/50" />;

      return (
        <HoverCard openDelay={50} closeDelay={50}>
          <HoverCardTrigger className="opacity-90 transition-opacity hover:opacity-100">
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-md px-1.5 py-0 text-xs"
                >
                  {tag}
                </Badge>
              ))}
              {tags.length > 2 && (
                <Badge
                  variant="secondary"
                  className="rounded-md px-1.5 py-0 text-xs"
                >
                  +{tags.length - 2}
                </Badge>
              )}
            </div>
          </HoverCardTrigger>
          {tags.length > 2 && (
            <HoverCardPortal>
              <HoverCardContent
                side="bottom"
                align="start"
                className="z-10 w-auto p-3"
              >
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </HoverCardContent>
            </HoverCardPortal>
          )}
        </HoverCard>
      );
    },
    size: 130,
    minSize: 100,
  },
  {
    accessorKey: 'isVerified',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Verified" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('isVerified');
      if (value) return <Check className="h-4 w-4 text-green-500" />;
      return <X className="h-4 w-4 text-muted-foreground opacity-50" />;
    },
    size: 80,
    minSize: 80,
  },
  {
    accessorKey: 'taxDeductible',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tax Deductible" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('taxDeductible');
      if (value) return <Check className="h-4 w-4 text-green-500" />;
      return <X className="h-4 w-4 text-muted-foreground opacity-50" />;
    },
    size: 120,
    minSize: 100,
  },
  {
    accessorKey: 'isManual',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Manual Entry" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('isManual') as boolean;
      return value ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground opacity-50" />
      );
    },
    filterFn: 'arrSome',
    size: 120,
    minSize: 100,
  },
  {
    accessorKey: 'excludeFromBudget',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Exclude from Budget" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('excludeFromBudget');
      if (value) return <Check className="h-4 w-4 text-green-500" />;
      return <X className="h-4 w-4 text-muted-foreground opacity-50" />;
    },
    size: 150,
    minSize: 120,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      const value = row.getValue('description');
      if (value) {
        return (
          <TextWithTooltip
            text={`${value}`}
            className="max-w-[200px] truncate font-mono text-sm text-muted-foreground"
          />
        );
      }
      return <Minus className="h-4 w-4 text-muted-foreground/50" />;
    },
    size: 200,
    minSize: 150,
  },
];

/**
 * Helper function to get a descriptive explanation of each transaction
 * category. Used for tooltips and accessibility purposes.
 *
 * @example
 *   ```tsx
 *   <Tooltip content={getCategoryDescription(transaction.category)}>
 *     <span>{transaction.category}</span>
 *   </Tooltip>
 *   ```;
 *
 * @param category - The transaction category code (e.g., "FOOD_AND_DRINK")
 * @returns A human-readable description of the category
 */
function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    INCOME: 'Money received from salary, investments, or other sources',
    TRANSFER: 'Movement of money between accounts',
    LOAN_PAYMENTS: 'Payments towards loans or mortgages',
    BANK_FEES: 'Fees charged by financial institutions',
    ENTERTAINMENT: 'Expenses for recreation and leisure activities',
    FOOD_AND_DRINK: 'Expenses for groceries, restaurants, and beverages',
    GENERAL_MERCHANDISE: 'Purchases of retail goods and merchandise',
    HOME_IMPROVEMENT: 'Expenses for home repairs and upgrades',
    MEDICAL: 'Healthcare and medical-related expenses',
    PERSONAL_CARE: 'Expenses for personal grooming and wellness',
    GENERAL_SERVICES: 'Payments for various services',
    GOVERNMENT_AND_NON_PROFIT: 'Payments to government agencies or donations',
    TRANSPORTATION: 'Expenses for travel and commuting',
    TRAVEL: 'Expenses for vacations and business trips',
    UTILITIES: 'Bills for electricity, water, internet, etc.',
    OTHER: 'Miscellaneous expenses not fitting other categories',
  };

  return descriptions[category] || 'No description available';
}
