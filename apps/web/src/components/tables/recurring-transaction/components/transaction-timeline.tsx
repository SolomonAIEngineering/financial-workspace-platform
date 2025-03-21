import * as React from 'react';

import { ChevronDown, History } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format-utils';

import { Badge } from '@/components/ui/badge';
import type { RecurringTransactionSchema } from '../schema';
import { SAMPLE_TRANSACTION_HISTORY } from '../data/sample-data';
import { cn } from '@/lib/utils';

/**
 * Props for the TransactionTimeline component
 *
 * @property transactions - Array of transaction history entries to display
 * @property nextDates - Array of forecasted future transaction dates
 * @property recurringTransaction - The recurring transaction data for the
 *   timeline
 */
export interface TransactionTimelineProps {
  /** Array of transaction history entries to display */
  transactions: typeof SAMPLE_TRANSACTION_HISTORY;

  /** Array of forecasted future transaction dates */
  nextDates: Date[];

  /** The recurring transaction data for the timeline */
  recurringTransaction: RecurringTransactionSchema;
}

/**
 * Transaction Timeline Component. Renders a visual timeline of transaction
 * history and forecasted future transactions. Includes a summary section with
 * statistics and visualizations.
 *
 * Features:
 *
 * - Visual timeline with past and future transactions
 * - Transaction summary with statistics
 * - Bar chart visualization of amount history
 * - Monthly spending pattern visualization
 * - Toggle controls for showing/hiding different views
 *
 * @example
 *   ```tsx
 *   <TransactionTimeline
 *     transactions={transactionHistory}
 *     nextDates={forecastedDates}
 *     recurringTransaction={recurringTransactionData}
 *   />
 *   ```;
 *
 * @param props - The component props
 * @returns A timeline visualization component
 */
export function TransactionTimeline({
  transactions,
  nextDates,
  recurringTransaction,
}: TransactionTimelineProps) {
  // Calculate statistics for the summary
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

  // Month names for the yearly pattern visualization
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

  /** Renders the transaction summary section with statistics and visualizations */
  const renderSummarySection = () => (
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

      {/* Bar chart visualization */}
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
              const height = (Math.abs(Number(tx.amount)) / maxAmount) * 100;
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
          <span>{formatDate(transactions[transactions.length - 1]?.date)}</span>
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
              {Math.max(...monthlyPattern.map((m) => m.count))} max transactions
            </span>
          </div>
        </div>
      )}
    </div>
  );

  /** Renders the future transaction toggle controls */
  const renderTimelineControls = () => (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-700">
        Transaction Timeline
      </h3>
      <div className="flex items-center">
        <span className="mr-2 text-xs text-muted-foreground">Show Future</span>
        <button
          onClick={() => setShowFuture(!showFuture)}
          className={cn(
            'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-4 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
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
  );

  /** Renders future transaction items in the timeline */
  const renderFutureTransactions = () =>
    showFuture &&
    nextDates.map((date, index) => (
      <div key={`future-${index}`} className="group relative pb-8 pl-12">
        {/* Timeline node */}
        <div className="absolute left-10 z-10 -ml-2.5 flex h-5 w-5 items-center justify-center rounded-full border-4 border-dashed border-blue-300 bg-white">
          <div className="h-2 w-2 rounded-full bg-blue-200"></div>
        </div>

        {/* Content card */}
        <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/30 p-4">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-800">
                {recurringTransaction.title || 'Upcoming Transaction'}
              </h4>
              <p className="text-xs text-blue-600">{formatDate(date)}</p>
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
    ));

  /** Renders past transaction items in the timeline */
  const renderPastTransactions = () =>
    transactions.map((tx, index) => (
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
              index === 0 ? 'bg-white' : 'bg-gray-100 group-hover:bg-white'
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
                Number(tx.amount) < 0 ? 'text-red-600' : 'text-green-600'
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
    ));

  /** Renders an empty state when no transactions are available */
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
      <History className="mb-2 h-10 w-10 text-muted-foreground/50" />
      <p>No transaction history available.</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Future transactions will appear here.
      </p>
    </div>
  );

  return (
    <div className="relative pl-6">
      {transactions.length > 0 ? (
        <>
          {/* Summary section */}
          {renderSummarySection()}

          {/* Timeline controls */}
          {renderTimelineControls()}

          {/* Timeline track */}
          <div className="absolute top-[18rem] bottom-0 left-10 w-px bg-gradient-to-b from-blue-300 to-gray-200"></div>

          <div className="space-y-0">
            {/* Future transactions */}
            {renderFutureTransactions()}

            {/* Past transactions */}
            {renderPastTransactions()}
          </div>
        </>
      ) : (
        renderEmptyState()
      )}
    </div>
  );
}
