'use client';

import * as React from 'react';

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Clock,
  CreditCard,
  Download,
  Edit,
  FileText,
  History,
  Info,
  Tag,
} from 'lucide-react';
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isValid,
  parseISO,
} from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/registry/default/potion-ui/button';
// Add import for RecurringTransactionSchema
import type { RecurringTransactionSchema } from './schema';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/registry/default/potion-ui/separator';
import { cn } from '@/lib/utils';
import { useDataTable } from '@/components/data-table/data-table-provider';

/**
 * Detail view component for recurring transactions. This file implements a rich
 * detail panel that appears when a user selects a recurring transaction in the
 * data table. It includes comprehensive information display, a timeline
 * visualization, and collapsible sections for better organization.
 *
 * @file Recurring-transaction-sheet-details.tsx
 */

/**
 * Props for the CollapsibleSection component.
 *
 * @property title - The section title
 * @property icon - Optional icon element to display next to the title
 * @property defaultOpen - Whether the section should be open by default
 *   (default: false)
 * @property children - The content to display inside the section when open
 */
interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * Collapsible section component for organizing content in the detail view.
 * Provides a toggle-able section with a header and expandable content.
 *
 * @param props - The component props
 * @returns A collapsible section component
 */
function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-t">
      <div
        className="flex cursor-pointer items-center py-3 transition-colors hover:bg-accent/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          {icon}
          <span>{title}</span>
        </div>
        <ChevronDown
          className={cn(
            'ml-auto h-4 w-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </div>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  );
}

/**
 * Sample transaction data for testing and demonstration. In a production
 * environment, this would be replaced with real transaction data.
 */
// Sample transaction data related to a recurring transaction
const sampleRelatedTransactions = [
  {
    id: 'tx_1',
    date: new Date('2023-10-15'),
    name: 'Netflix Subscription',
    amount: -15.99,
    currency: 'USD',
    status: 'completed',
  },
  {
    id: 'tx_2',
    date: new Date('2023-09-15'),
    name: 'Netflix Subscription',
    amount: -15.99,
    currency: 'USD',
    status: 'completed',
  },
  {
    id: 'tx_3',
    date: new Date('2023-08-15'),
    name: 'Netflix Subscription',
    amount: -15.99,
    currency: 'USD',
    status: 'completed',
  },
];

/**
 * Sample transaction history data for the timeline visualization. Provides
 * historical data for the transaction timeline view.
 */
// Sample transaction history data for the timeline
const sampleTransactionHistory = [
  {
    id: 'tx_1',
    date: new Date('2023-10-15'),
    name: 'Netflix Subscription',
    amount: -15.99,
    currency: 'USD',
    status: 'completed',
    note: 'Monthly subscription payment',
  },
  {
    id: 'tx_2',
    date: new Date('2023-09-15'),
    name: 'Netflix Subscription',
    amount: -15.99,
    currency: 'USD',
    status: 'completed',
    note: null,
  },
  {
    id: 'tx_3',
    date: new Date('2023-08-15'),
    name: 'Netflix Subscription',
    amount: -15.99,
    currency: 'USD',
    status: 'completed',
    note: null,
  },
  {
    id: 'tx_4',
    date: new Date('2023-07-15'),
    name: 'Netflix Subscription',
    amount: -14.99,
    currency: 'USD',
    status: 'completed',
    note: 'Price increased from previous month',
  },
  {
    id: 'tx_5',
    date: new Date('2023-06-15'),
    name: 'Netflix Subscription',
    amount: -14.99,
    currency: 'USD',
    status: 'completed',
    note: null,
  },
  {
    id: 'tx_6',
    date: new Date('2023-05-15'),
    name: 'Netflix Subscription',
    amount: -14.99,
    currency: 'USD',
    status: 'completed',
    note: null,
  },
];

/**
 * Helper function to calculate future execution dates based on frequency.
 *
 * @param frequency - The transaction frequency (WEEKLY, MONTHLY, etc.)
 * @param interval - The interval between executions
 * @param baseDate - The starting date for calculations
 * @param count - Number of future dates to calculate (default: 5)
 * @returns An array of future execution dates
 */
function getNextExecutionDates(
  frequency: string,
  interval: number,
  baseDate: Date,
  count: number = 5
): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(baseDate);

  for (let i = 0; i < count; i++) {
    // Calculate next date based on frequency
    switch (frequency) {
      case 'WEEKLY':
        currentDate = addWeeks(currentDate, interval);
        break;
      case 'BIWEEKLY':
        currentDate = addWeeks(currentDate, 2 * interval);
        break;
      case 'MONTHLY':
        currentDate = addMonths(currentDate, interval);
        break;
      case 'SEMI_MONTHLY':
        currentDate = addDays(currentDate, 15 * interval);
        break;
      case 'ANNUALLY':
        currentDate = addMonths(currentDate, 12 * interval);
        break;
      default:
        currentDate = addMonths(currentDate, interval);
    }

    dates.push(new Date(currentDate));
  }

  return dates;
}

/**
 * Transaction Timeline Component. Renders a visual timeline of transaction
 * history and forecasted future transactions. Includes a summary section with
 * statistics and visualizations.
 *
 * @param props - The component props
 * @returns A timeline visualization component
 */
function TransactionTimeline({
  transactions,
  formatDate,
  formatCurrency,
  nextDates,
  recurringTransaction,
}: {
  transactions: typeof sampleTransactionHistory;
  formatDate: (date: Date | string | null | undefined) => string;
  formatCurrency: (
    amount: number | null | undefined,
    currency?: string
  ) => string;
  nextDates: Date[];
  recurringTransaction: RecurringTransactionSchema;
}) {
  // Calculate some statistics for the summary
  const totalAmount = transactions.reduce(
    (sum, tx) => sum + Math.abs(Number(tx.amount)),
    0
  );
  const averageAmount = totalAmount / (transactions.length || 1);
  const latestAmount =
    transactions.length > 0 ? Math.abs(Number(transactions[0].amount)) : 0;
  const oldestAmount =
    transactions.length > 0
      ? Math.abs(Number(transactions[transactions.length - 1].amount))
      : 0;
  const amountChange = latestAmount - oldestAmount;
  const percentChange = oldestAmount ? (amountChange / oldestAmount) * 100 : 0;

  // Get min and max for the chart scaling
  const amounts = transactions.map((tx) => Math.abs(Number(tx.amount)));
  const maxAmount = Math.max(...amounts, 0);

  // Toggle for showing future transactions
  const [showFuture, setShowFuture] = React.useState(true);

  // Toggle for showing yearly pattern
  const [showYearlyPattern, setShowYearlyPattern] = React.useState(false);

  // Calculate monthly spending pattern
  const monthlyPattern = React.useMemo(() => {
    const months = Array(12).fill(0);
    const monthCounts = Array(12).fill(0);

    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      const month = date.getMonth();
      months[month] += Math.abs(Number(tx.amount));
      monthCounts[month]++;
    });

    // Calculate average per month (if there are transactions)
    return months.map((total, i) => ({
      month: i,
      total,
      count: monthCounts[i],
      average: monthCounts[i] ? total / monthCounts[i] : 0,
    }));
  }, [transactions]);

  // Get max monthly amount for scaling
  const maxMonthlyAmount = Math.max(...monthlyPattern.map((m) => m.total), 0.1);

  // Month names
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return (
    <div className="relative pl-6">
      {transactions.length > 0 ? (
        <>
          {/* Summary section */}
          <div className="mb-8 rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
            <h3 className="mb-4 text-sm font-medium text-blue-800">
              Transaction Summary
            </h3>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-blue-700">Total Transactions</p>
                <p className="text-lg font-semibold">{transactions.length}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Average Amount</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(averageAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700">First Transaction</p>
                <p className="text-sm">
                  {formatDate(transactions[transactions.length - 1]?.date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Latest Transaction</p>
                <p className="text-sm">{formatDate(transactions[0]?.date)}</p>
              </div>
            </div>

            {/* Simple bar chart visualization */}
            <div className="mb-2">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs text-blue-700">Amount History</p>
                <p
                  className={cn(
                    'text-xs font-medium',
                    percentChange >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {percentChange >= 0 ? '+' : ''}
                  {percentChange.toFixed(1)}%
                </p>
              </div>
              <div className="mb-1 flex h-16 items-end gap-1">
                {transactions
                  .slice()
                  .reverse()
                  .map((tx, i) => {
                    const height =
                      (Math.abs(Number(tx.amount)) / maxAmount) * 100;
                    return (
                      <div
                        key={`bar-${tx.id}`}
                        className="flex-1 rounded-t transition-all hover:opacity-80"
                        style={{
                          height: `${Math.max(height, 10)}%`,
                          backgroundColor:
                            i === transactions.length - 1
                              ? '#3b82f6' // Latest transaction (blue-500)
                              : '#93c5fd', // Older transactions (blue-300)
                        }}
                        title={`${formatDate(tx.date)}: ${formatCurrency(tx.amount)}`}
                      ></div>
                    );
                  })}
              </div>
              <div className="flex justify-between text-xs text-blue-700/60">
                <span>
                  {formatDate(transactions[transactions.length - 1]?.date)}
                </span>
                <span>{formatDate(transactions[0]?.date)}</span>
              </div>
            </div>

            {/* Yearly pattern toggle */}
            <div className="mt-4 flex items-center justify-between border-t border-blue-100 pt-3">
              <button
                onClick={() => setShowYearlyPattern(!showYearlyPattern)}
                className="flex items-center text-xs text-blue-600"
              >
                <ChevronDown
                  className={cn(
                    'mr-1 h-4 w-4 transition-transform',
                    showYearlyPattern && 'rotate-180'
                  )}
                />
                {showYearlyPattern ? 'Hide' : 'Show'} Yearly Pattern
              </button>
              <span className="text-xs text-blue-600">
                {formatCurrency(totalAmount)} total
              </span>
            </div>

            {/* Yearly spending pattern */}
            {showYearlyPattern && (
              <div className="mt-3 pt-2">
                <div className="flex h-24 items-end gap-1">
                  {monthlyPattern.map((month, i) => {
                    const height = month.total
                      ? (month.total / maxMonthlyAmount) * 100
                      : 0;
                    const hasTransactions = month.count > 0;

                    return (
                      <div
                        key={`month-${i}`}
                        className="flex flex-1 flex-col items-center"
                      >
                        <div
                          className={cn(
                            'w-full rounded-t transition-all',
                            hasTransactions
                              ? 'bg-blue-400 hover:bg-blue-500'
                              : 'bg-gray-200'
                          )}
                          style={{
                            height: `${Math.max(height, hasTransactions ? 10 : 5)}%`,
                          }}
                          title={`${monthNames[i]}: ${formatCurrency(month.total)} (${month.count} transactions)`}
                        ></div>
                        <span className="mt-1 text-[10px] text-blue-700">
                          {monthNames[i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between text-xs text-blue-700">
                  <span>Monthly Pattern</span>
                  <span>
                    {Math.max(...monthlyPattern.map((m) => m.count))} max
                    transactions
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Future transactions toggle */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Transaction Timeline
            </h3>
            <div className="flex items-center">
              <span className="mr-2 text-xs text-muted-foreground">
                Show Future
              </span>
              <button
                onClick={() => setShowFuture(!showFuture)}
                className={cn(
                  'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                  showFuture ? 'bg-blue-500' : 'bg-gray-200'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    showFuture ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Timeline track */}
          <div className="absolute top-[18rem] bottom-0 left-10 w-px bg-gradient-to-b from-blue-300 to-gray-200"></div>

          <div className="space-y-0">
            {/* Future transactions */}
            {showFuture &&
              nextDates.map((date, index) => (
                <div
                  key={`future-${index}`}
                  className="group relative pb-8 pl-12"
                >
                  {/* Timeline node */}
                  <div className="absolute left-10 z-10 -ml-2.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-dashed border-blue-300 bg-white">
                    <div className="h-2 w-2 rounded-full bg-blue-200"></div>
                  </div>

                  {/* Content card */}
                  <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/30 p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">
                          {recurringTransaction.title || 'Upcoming Transaction'}
                        </h4>
                        <p className="text-xs text-blue-600">
                          {formatDate(date)}
                        </p>
                      </div>
                      <div
                        className={cn(
                          'text-sm font-medium',
                          Number(recurringTransaction.amount) < 0
                            ? 'text-red-600'
                            : 'text-green-600'
                        )}
                      >
                        {formatCurrency(
                          recurringTransaction.amount,
                          recurringTransaction.currency
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-100 px-1.5 py-0 text-xs font-normal text-blue-800 uppercase">
                        Forecast
                      </Badge>

                      <div className="text-xs text-blue-600">
                        {index === 0
                          ? 'Next scheduled payment'
                          : `Scheduled payment #${index + 1}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {/* Past transactions */}
            {transactions.map((tx, index) => (
              <div key={tx.id} className="group relative pb-8 pl-12">
                {/* Timeline node */}
                <div
                  className={cn(
                    'absolute left-10 z-10 -ml-2.5 flex h-5 w-5 items-center justify-center rounded-full transition-all',
                    index === 0
                      ? 'bg-blue-500 shadow-md shadow-blue-200'
                      : 'bg-gray-300 group-hover:bg-blue-400'
                  )}
                >
                  <div
                    className={cn(
                      'h-2.5 w-2.5 rounded-full transition-all',
                      index === 0
                        ? 'bg-white'
                        : 'bg-gray-100 group-hover:bg-white'
                    )}
                  ></div>
                </div>

                {/* Content card */}
                <div
                  className={cn(
                    'rounded-lg border p-4 transition-all',
                    index === 0
                      ? 'border-blue-200 bg-blue-50 shadow-sm'
                      : 'hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm'
                  )}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium">{tx.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'text-sm font-medium',
                        Number(tx.amount) < 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      )}
                    >
                      {formatCurrency(tx.amount, tx.currency)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge
                      className={cn(
                        'text-xs capitalize',
                        tx.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : tx.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {tx.status}
                    </Badge>

                    {tx.note && (
                      <div className="text-xs text-muted-foreground italic">
                        {tx.note}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
          <History className="mb-2 h-10 w-10 text-muted-foreground/50" />
          <p>No transaction history available.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Future transactions will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Recurring Transaction Sheet Details component. The main component for
 * displaying detailed information about a selected recurring transaction.
 *
 * Features:
 *
 * - Comprehensive transaction information display
 * - Transaction history timeline with visualizations
 * - Collapsible sections for organization
 * - Visual indicators for status and categories
 * - Future transaction forecast
 *
 * @example
 *   ```tsx
 *   <DataTable
 *     columns={columns}
 *     data={recurringTransactions}
 *     detailPanel={<RecurringTransactionSheetDetails />}
 *   />
 *   ```;
 *
 * @returns A detailed view component for a selected recurring transaction
 */
export function RecurringTransactionSheetDetails() {
  const { rowSelection, table } = useDataTable();
  const [loading, setLoading] = React.useState(false);

  // Fix the selectedRow and recurringTransaction type handling
  const selectedRowKey = Object.keys(rowSelection)[0];
  const selectedRow = selectedRowKey ? table.getRow(selectedRowKey) : null;
  const recurringTransaction =
    (selectedRow?.original as RecurringTransactionSchema) ||
    ({} as RecurringTransactionSchema);

  // Update the error state check to include a proper empty check for RecurringTransactionSchema
  if (!selectedRow || !recurringTransaction.id) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="mb-4 h-10 w-10 text-muted-foreground" />
        <h3 className="text-lg font-medium">
          No Recurring Transaction Selected
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a recurring transaction from the table to view its details.
        </p>
      </div>
    );
  }

  // Format date strings
  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return '-';
    try {
      const date =
        typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return isValid(date) ? format(date, 'MMM dd, yyyy') : '-';
    } catch (e) {
      return '-';
    }
  };

  // Format date with time
  const formatDateTime = (dateString?: string | Date | null) => {
    if (!dateString) return '-';
    try {
      const date =
        typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return isValid(date) ? format(date, 'MMM dd, yyyy HH:mm:ss') : '-';
    } catch (e) {
      return '-';
    }
  };

  // Format currency
  const formatCurrency = (amount?: number | null, currency: string = 'USD') => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Format recurring frequency
  const formatFrequency = (frequency?: string, interval: number = 1) => {
    if (!frequency) return '-';

    const frequencyMap: Record<string, string> = {
      WEEKLY: interval === 1 ? 'Weekly' : `Every ${interval} weeks`,
      BIWEEKLY: 'Every 2 weeks',
      MONTHLY: interval === 1 ? 'Monthly' : `Every ${interval} months`,
      SEMI_MONTHLY: 'Twice a month',
      ANNUALLY: interval === 1 ? 'Annually' : `Every ${interval} years`,
      IRREGULAR: 'Irregular',
      UNKNOWN: 'Unknown',
    };

    return frequencyMap[frequency] || frequency.toLowerCase();
  };

  // Format status text
  const formatStatus = (status?: string) => {
    if (!status) return 'UNKNOWN';
    return status.toUpperCase();
  };

  // Calculate next execution dates
  const nextDates = getNextExecutionDates(
    recurringTransaction.frequency,
    recurringTransaction.interval,
    new Date(recurringTransaction.nextScheduledDate),
    3
  );

  // Generate historical transactions based on recurring transaction data
  const generateHistoricalTransactions = () => {
    if (!recurringTransaction.id) return [];

    // For demo purposes, we'll use the sample data
    // In a real implementation, you would fetch this data from an API
    return sampleTransactionHistory;
  };

  const historicalTransactions = generateHistoricalTransactions();

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col px-1 py-2">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium">Recurring Transaction Details</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main information section */}
        <div className="space-y-4">
          {/* Basic info */}
          <InfoRow
            label="Transaction ID"
            value={recurringTransaction.id}
            monospace
          />
          <InfoRow
            label="Date"
            value={formatDate(recurringTransaction.startDate)}
          />
          <InfoRow
            label="Status"
            value={
              <Badge
                className={cn(
                  'px-1.5 py-0 text-xs font-normal uppercase',
                  recurringTransaction.status?.toLowerCase() === 'active'
                    ? 'bg-green-100 text-green-800'
                    : recurringTransaction.status?.toLowerCase() === 'paused'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                )}
              >
                {formatStatus(recurringTransaction.status)}
              </Badge>
            }
          />
          <InfoRow
            label="Type"
            value={
              recurringTransaction.transactionType
                ? recurringTransaction.transactionType.toUpperCase()
                : 'UNKNOWN'
            }
          />
          <InfoRow label="Merchant" value={recurringTransaction.merchantName} />
          <InfoRow label="Name" value={recurringTransaction.title} />
          <InfoRow
            label="Category"
            value={
              <Badge className="bg-gray-100 px-1.5 py-0 text-xs font-normal text-gray-800 uppercase">
                {recurringTransaction.transactionType || 'INCOME'}
              </Badge>
            }
          />
          <InfoRow
            label="Amount"
            value={
              <span
                className={cn(
                  'font-medium',
                  Number(recurringTransaction.amount) < 0
                    ? 'text-red-600'
                    : 'text-green-600'
                )}
              >
                {formatCurrency(
                  recurringTransaction.amount,
                  recurringTransaction.currency
                )}
              </span>
            }
          />
          <InfoRow
            label="Account"
            value={recurringTransaction.bankAccountId || 'Primary Checking'}
          />
        </div>

        <Separator className="my-4" />

        {/* Collapsible Sections */}
        <CollapsibleSection
          title="Description & Notes"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="pl-6 text-sm text-muted-foreground">
            {recurringTransaction.description || 'No description available.'}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Categorization Details"
          icon={<Tag className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="space-y-4 pl-6">
            <InfoRow
              label="Category"
              value={recurringTransaction.transactionType || 'Income'}
              size="sm"
            />
            <InfoRow
              label="Importance"
              value={recurringTransaction.importanceLevel || 'Low'}
              size="sm"
            />
            <InfoRow
              label="Type"
              value={recurringTransaction.transactionType || 'Income'}
              size="sm"
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Processing Time"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          defaultOpen={true}
        >
          <div className="space-y-3 pl-6">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span>P50</span>
              <span>1000ms</span>
            </div>

            <ProcessingStep
              label="PROCESSING"
              percentage={12.2}
              time="122ms"
              color="bg-green-500"
            />

            <ProcessingStep
              label="VERIFICATION"
              percentage={29.3}
              time="293ms"
              color="bg-blue-500"
            />

            <ProcessingStep
              label="AUTHORIZATION"
              percentage={9.7}
              time="97ms"
              color="bg-blue-500"
            />

            <ProcessingStep
              label="SETTLEMENT"
              percentage={48.4}
              time="484ms"
              color="bg-orange-500"
            />

            <ProcessingStep
              label="FINALIZATION"
              percentage={0.4}
              time="4ms"
              color="bg-purple-500"
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Transaction Properties"
          icon={<Info className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="space-y-4 pl-6">
            <InfoRow
              label="Frequency"
              value={formatFrequency(
                recurringTransaction.frequency,
                recurringTransaction.interval
              )}
              size="sm"
            />
            {recurringTransaction.frequency === 'MONTHLY' &&
              recurringTransaction.dayOfMonth && (
                <InfoRow
                  label="Day of Month"
                  value={String(recurringTransaction.dayOfMonth)}
                  size="sm"
                />
              )}
            <InfoRow
              label="Next Execution"
              value={formatDate(recurringTransaction.nextScheduledDate)}
              size="sm"
            />
            <InfoRow
              label="Last Execution"
              value={formatDateTime(recurringTransaction.lastExecutedAt)}
              size="sm"
            />
            <InfoRow
              label="Is Automated"
              value={recurringTransaction.isAutomated ? 'Yes' : 'No'}
              size="sm"
            />
            <InfoRow
              label="Affects Balance"
              value={recurringTransaction.affectAvailableBalance ? 'Yes' : 'No'}
              size="sm"
            />
            <InfoRow
              label="Variable Amount"
              value={recurringTransaction.isVariable ? 'Yes' : 'No'}
              size="sm"
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Related Transactions"
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="pl-6">
            {sampleRelatedTransactions.length > 0 ? (
              <div className="space-y-3">
                {sampleRelatedTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between border-b pb-2"
                  >
                    <div>
                      <div className="text-sm">{tx.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(tx.date)}
                      </div>
                    </div>
                    <div
                      className={cn(
                        'text-sm font-medium',
                        Number(tx.amount) < 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      )}
                    >
                      {formatCurrency(tx.amount, tx.currency)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No related transactions found.
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Add the new Transaction History Timeline section */}
        <CollapsibleSection
          title="Transaction History Timeline"
          icon={<History className="h-4 w-4 text-muted-foreground" />}
          defaultOpen={true}
        >
          <TransactionTimeline
            transactions={historicalTransactions}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            nextDates={nextDates}
            recurringTransaction={recurringTransaction}
          />
        </CollapsibleSection>

        {/* Footer info section */}
        <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground">
          <div className="grid w-full grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <p className="font-medium">Age</p>
              <p>{recurringTransaction.executionCount || 0}</p>
            </div>
            <div>
              <p className="font-medium">Frequency</p>
              <p>Recurring</p>
            </div>
            <div>
              <p className="font-medium">Entry Method</p>
              <p>Auto-import</p>
            </div>
            <div>
              <p className="font-medium">Creation Date</p>
              <p>{formatDate(recurringTransaction.createdAt) || '-'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <Edit className="mr-1 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

/**
 * Helper component for displaying key-value pairs of information. Used
 * throughout the detail view to consistently format information.
 *
 * @param props - The component props
 * @returns A formatted key-value display component
 */
function InfoRow({
  label,
  value,
  monospace = false,
  size = 'base',
}: {
  label: string;
  value: React.ReactNode;
  monospace?: boolean;
  size?: 'sm' | 'base';
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          'text-muted-foreground',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          size === 'sm' ? 'text-xs' : 'text-sm',
          monospace && 'font-mono text-xs'
        )}
      >
        {value || '-'}
      </span>
    </div>
  );
}

/**
 * Helper component for visualizing processing steps with percentage bars. Used
 * in the Processing Time section to show relative time spent in each step.
 *
 * @param props - The component props
 * @returns A processing step visualization component
 */
function ProcessingStep({
  label,
  percentage,
  time,
  color,
}: {
  label: string;
  percentage: number;
  time: string;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="text-right">{percentage.toFixed(1)}%</span>
        <span className="w-10 text-right">{time}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn('h-full', color)}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
