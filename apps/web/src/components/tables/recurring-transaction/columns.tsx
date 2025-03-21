'use client';

import {
  Calendar,
  CalendarClock,
  Check,
  Clock,
  CreditCard,
  DollarSign,
  RefreshCw,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import type { RecurringTransactionSchema } from './schema';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

/**
 * Defines the data table columns for recurring transactions. This file contains
 * column definitions, cell renderers, and helper functions for displaying
 * recurring transaction data in a tabular format.
 *
 * @file Columns.tsx
 */

/**
 * Visual styling for different transaction types. Defines the badge colors, dot
 * colors, and icons for each transaction type. These styles provide consistent
 * visual cues across the UI.
 *
 * @property subscription - Styling for subscription transactions
 * @property bill - Styling for bill payments
 * @property income - Styling for income transactions
 * @property transfer - Styling for transfers
 * @property other - Styling for other transaction types
 */
export const transactionTypeColors = {
  subscription: {
    badge: 'text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100',
    dot: 'bg-purple-500',
    icon: <RefreshCw className="h-4 w-4 text-purple-500" />,
  },
  bill: {
    badge: 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100',
    dot: 'bg-amber-500',
    icon: <CreditCard className="h-4 w-4 text-amber-500" />,
  },
  income: {
    badge: 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100',
    dot: 'bg-green-500',
    icon: <DollarSign className="h-4 w-4 text-green-500" />,
  },
  transfer: {
    badge: 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100',
    dot: 'bg-blue-500',
    icon: <RefreshCw className="h-4 w-4 text-blue-500" />,
  },
  other: {
    badge: 'text-gray-700 bg-gray-50 border-gray-200 hover:bg-gray-100',
    dot: 'bg-gray-500',
    icon: <Calendar className="h-4 w-4 text-gray-500" />,
  },
};

/**
 * Visual styling for different importance levels. Defines badge and dot colors
 * based on the transaction's importance.
 *
 * @property critical - Styling for critical-importance transactions
 * @property high - Styling for high-importance transactions
 * @property medium - Styling for medium-importance transactions
 * @property low - Styling for low-importance transactions
 */
export const importanceLevelColors = {
  critical: {
    badge: 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100',
    dot: 'bg-red-500',
  },
  high: {
    badge: 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100',
    dot: 'bg-amber-500',
  },
  medium: {
    badge: 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100',
    dot: 'bg-blue-500',
  },
  low: {
    badge: 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100',
    dot: 'bg-green-500',
  },
};

/**
 * Formats a frequency code into human-readable text. Converts the raw frequency
 * and interval values into a user-friendly description.
 *
 * @example
 *   ```tsx
 *   formatFrequency("MONTHLY", 1) // "Monthly"
 *   formatFrequency("WEEKLY", 2) // "Every 2 weeks"
 *   formatFrequency("ANNUALLY", 1) // "Annually"
 *   ```;
 *
 * @param frequency - The frequency code (e.g., "MONTHLY")
 * @param interval - The interval value (default: 1)
 * @returns A formatted string describing the frequency
 */
export function formatFrequency(
  frequency: string,
  interval: number = 1
): string {
  if (interval === 1) {
    switch (frequency) {
      case 'WEEKLY':
        return 'Weekly';
      case 'BIWEEKLY':
        return 'Every 2 weeks';
      case 'MONTHLY':
        return 'Monthly';
      case 'SEMI_MONTHLY':
        return 'Twice a month';
      case 'ANNUALLY':
        return 'Annually';
      case 'IRREGULAR':
        return 'Irregular';
      default:
        return frequency;
    }
  } else {
    switch (frequency) {
      case 'WEEKLY':
        return `Every ${interval} weeks`;
      case 'MONTHLY':
        return `Every ${interval} months`;
      case 'ANNUALLY':
        return `Every ${interval} years`;
      default:
        return `Every ${interval} ${frequency.toLowerCase()}s`;
    }
  }
}

/**
 * Column definitions for the recurring transactions data table. Defines the
 * structure, sorting, and rendering of each column in the table.
 *
 * Columns include:
 *
 * - Title (with merchant name)
 * - Amount (with currency formatting)
 * - Frequency
 * - Next scheduled date
 * - Transaction type
 * - Execution count and total
 * - Status
 *
 * Each column definition includes:
 *
 * - AccessorKey: The property key in the data object
 * - Header: The column header component
 * - Cell: The cell renderer function
 *
 * @type {ColumnDef<RecurringTransactionSchema>[]}
 */
export const columns: ColumnDef<RecurringTransactionSchema>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const title = row.getValue('title') as string;
      const status = row.original.status;

      return (
        <div className="flex flex-col gap-1 py-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{title}</span>
            {status && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs px-2 py-1',
                  status === 'active'
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : status === 'paused'
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700'
                )}
              >
                {status}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {row.original.merchantName || 'Manual entry'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = row.original.amount;
      const currency = row.original.currency || 'USD';

      // Format with currency symbol
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);

      return (
        <div
          className={cn(
            'font-medium tabular-nums px-2 py-1 rounded-md inline-block',
            amount < 0 ? 'text-red-500 bg-red-50' : 'text-green-500 bg-green-50'
          )}
        >
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: 'frequency',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Frequency" />
    ),
    cell: ({ row }) => {
      const frequency = row.getValue('frequency') as string;
      const interval = row.original.interval || 1;

      return (
        <div className="flex items-center gap-2 px-1">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatFrequency(frequency, interval)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'nextScheduledDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Next Date" />
    ),
    cell: ({ row }) => {
      const date = row.original.nextScheduledDate;

      if (!date) return <span className="text-muted-foreground">-</span>;

      const formattedDate = format(new Date(date), 'MMM d, yyyy');
      const now = new Date();
      const daysDiff = Math.round(
        (new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isUpcoming = daysDiff <= 7 && daysDiff >= 0;
      const isOverdue = daysDiff < 0;

      return (
        <div className="flex flex-col gap-1 py-1">
          <span
            className={cn(
              'font-medium',
              isOverdue ? 'text-red-500' : isUpcoming ? 'text-amber-500' : ''
            )}
          >
            {formattedDate}
          </span>
          <span className="text-xs text-muted-foreground">
            {isOverdue
              ? `${Math.abs(daysDiff)} days overdue`
              : isUpcoming
                ? `In ${daysDiff} day${daysDiff === 1 ? '' : 's'}`
                : `In ${daysDiff} days`}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'transactionType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue('transactionType') as string;
      const typeColor =
        transactionTypeColors[type as keyof typeof transactionTypeColors] ||
        transactionTypeColors.other;

      return (
        <Badge
          variant="outline"
          className={cn('flex items-center gap-1 px-3 py-1.5', typeColor.badge)}
        >
          {typeColor.icon}
          <span className="capitalize">{type || 'Other'}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: 'executionCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Executions" />
    ),
    cell: ({ row }) => {
      const count = row.getValue('executionCount') as number;
      const total = row.original.totalExecuted;
      const currency = row.original.currency || 'USD';

      return (
        <div className="flex flex-col gap-1 py-1">
          <span className="font-medium">{count || 0}</span>
          <span className="text-xs text-muted-foreground">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency,
            }).format(total || 0)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;

      return (
        <div className="flex items-center gap-2 px-1">
          {status === 'active' ? (
            <>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <span className="font-medium text-green-700">Active</span>
            </>
          ) : status === 'paused' ? (
            <>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <span className="font-medium text-amber-700">Paused</span>
            </>
          ) : (
            <>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                <X className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="font-medium text-gray-500">{status || 'Inactive'}</span>
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'lastExecutedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Execution" />
    ),
    cell: ({ row }) => {
      const date = row.original.lastExecutedAt;

      if (!date) return <span className="text-muted-foreground italic">Never</span>;

      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {format(new Date(date), 'MMM d, yyyy')}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
    cell: ({ row }) => {
      const date = row.original.startDate;
      if (!date) return <span className="text-muted-foreground">-</span>;
      return format(new Date(date), 'MMM d, yyyy');
    },
    enableHiding: true,
    meta: {
      cellClassName: 'hidden md:hidden lg:hidden',
    },
  },
  {
    accessorKey: 'endDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
    cell: ({ row }) => {
      const date = row.original.endDate;
      if (!date) return <span className="text-muted-foreground">-</span>;
      return format(new Date(date), 'MMM d, yyyy');
    },
    enableHiding: true,
    meta: {
      cellClassName: 'hidden md:hidden lg:hidden',
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const date = row.original.createdAt;
      if (!date) return <span className="text-muted-foreground">-</span>;
      return format(new Date(date), 'MMM d, yyyy');
    },
    enableHiding: true,
    meta: {
      cellClassName: 'hidden md:hidden lg:hidden',
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => {
      const date = row.original.updatedAt;
      if (!date) return <span className="text-muted-foreground">-</span>;
      return format(new Date(date), 'MMM d, yyyy');
    },
    enableHiding: true,
    meta: {
      cellClassName: 'hidden md:hidden lg:hidden',
    },
  },
  {
    accessorKey: 'interval',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Interval" />
    ),
    cell: ({ row }) => {
      const interval = row.original.interval;
      return <span>{interval || 1}</span>;
    },
    enableHiding: true,
    meta: {
      cellClassName: 'hidden md:hidden lg:hidden',
    },
  },
  {
    accessorKey: 'totalExecuted',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Executed" />
    ),
    cell: ({ row }) => {
      const total = row.original.totalExecuted;
      const currency = row.original.currency || 'USD';
      return (
        <span>
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
          }).format(total || 0)}
        </span>
      );
    },
    enableHiding: true,
    meta: {
      cellClassName: 'hidden md:hidden lg:hidden',
    },
  },
  {
    accessorKey: 'minBalanceRequired',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Min Balance Required" />
    ),
    cell: ({ row }) => {
      const minBalance = row.original.minBalanceRequired;
      const currency = row.original.currency || 'USD';
      if (minBalance === undefined || minBalance === null)
        return <span className="text-muted-foreground">-</span>;
      return (
        <span>
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
          }).format(minBalance)}
        </span>
      );
    },
    enableHiding: true,
    meta: {
      cellClassName: 'hidden md:hidden lg:hidden',
    },
  },
  {
    accessorKey: 'importanceLevel',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Importance" />
    ),
    cell: ({ row }) => {
      const level = row.original.importanceLevel;
      const levelColor =
        importanceLevelColors[level as keyof typeof importanceLevelColors] ||
        importanceLevelColors.low;

      if (!level) return <span className="text-muted-foreground">-</span>;

      return (
        <Badge variant="outline" className={cn('capitalize px-3 py-1', levelColor.badge)}>
          {level}
        </Badge>
      );
    },
    enableHiding: true,
    meta: {
      cellClassName: 'hidden md:hidden lg:hidden',
    },
  },
  {
    accessorKey: 'affectAvailableBalance',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Affects Balance" />
    ),
    cell: ({ row }) => {
      const affects = row.original.affectAvailableBalance;
      return (
        <span>
          {affects ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
              <Check className="h-4 w-4 text-green-500" />
            </div>
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
              <X className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </span>
      );
    },
    enableHiding: true,
    meta: {
      cellClassName: 'hidden md:hidden lg:hidden',
    },
  },
  {
    accessorKey: 'isAutomated',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Automated" />
    ),
    cell: ({ row }) => {
      const isAutomated = row.original.isAutomated;
      return (
        <span>
          {isAutomated ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-muted-foreground" />
          )}
        </span>
      );
    },
    enableHiding: true,
    meta: {
      cellClassName: 'hidden md:hidden lg:hidden',
    },
  },
  {
    accessorKey: 'requiresApproval',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Requires Approval" />
    ),
    cell: ({ row }) => {
      const requiresApproval = row.original.requiresApproval;
      return (
        <span>
          {requiresApproval ? (
            <Check className="h-4 w-4 text-amber-500" />
          ) : (
            <X className="h-4 w-4 text-muted-foreground" />
          )}
        </span>
      );
    },
    enableHiding: true,
    meta: {
      cellClassName: 'hidden md:hidden lg:hidden',
    },
  },
  {
    accessorKey: 'isVariable',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Variable Amount" />
    ),
    cell: ({ row }) => {
      const isVariable = row.original.isVariable;
      return (
        <span>
          {isVariable ? (
            <Check className="h-4 w-4 text-blue-500" />
          ) : (
            <X className="h-4 w-4 text-muted-foreground" />
          )}
        </span>
      );
    },
    enableHiding: true,
    meta: {
      cellClassName: 'hidden md:hidden lg:hidden',
    },
  },
  {
    accessorKey: 'currency',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Currency" />
    ),
    cell: ({ row }) => {
      const currency = row.original.currency;
      return <span>{currency || 'USD'}</span>;
    },
    enableHiding: true,
    meta: {
      cellClassName: 'hidden md:hidden lg:hidden',
    },
  },
  {
    accessorKey: 'dayOfMonth',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Day of Month" />
    ),
    cell: ({ row }) => {
      const dayOfMonth = row.original.dayOfMonth;
      if (dayOfMonth === undefined || dayOfMonth === null)
        return <span className="text-muted-foreground">-</span>;
      return <span>{dayOfMonth}</span>;
    },
    enableHiding: true,
    meta: {
      cellClassName: 'hidden md:hidden lg:hidden',
    },
  },
  {
    accessorKey: 'dayOfWeek',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Day of Week" />
    ),
    cell: ({ row }) => {
      const dayOfWeek = row.original.dayOfWeek;
      if (dayOfWeek === undefined || dayOfWeek === null)
        return <span className="text-muted-foreground">-</span>;

      const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      return <span>{days[dayOfWeek] || dayOfWeek}</span>;
    },
    enableHiding: true,
    meta: {
      cellClassName: 'hidden md:hidden lg:hidden',
    },
  },
  {
    accessorKey: 'merchantName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Merchant" />
    ),
    cell: ({ row }) => {
      const merchantName = row.original.merchantName;
      return <span>{merchantName || 'Manual entry'}</span>;
    },
    enableHiding: true,
    meta: {
      cellClassName: 'hidden md:hidden lg:hidden',
    },
  },
];
