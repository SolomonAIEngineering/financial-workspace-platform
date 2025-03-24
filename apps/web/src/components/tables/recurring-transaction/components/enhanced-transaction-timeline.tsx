// Add global CSS for custom scrollbar
import './timeline-scrollbar.css';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  RefreshCw
} from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInDays,
  format,
  parseISO
} from 'date-fns';

import { RecurringTransactionSchema } from '../schema';
import { cn } from '@/lib/utils';
import { formatAmount } from '../utils/transaction-formatters';

/** Props for the EnhancedTransactionTimeline component */
export interface EnhancedTransactionTimelineProps {
  /** The recurring transaction data */
  transaction: RecurringTransactionSchema;

  /** Number of historical transactions to show */
  historyCount?: number;

  /** Number of future transactions to forecast */
  forecastCount?: number;
}

// Limit the number of items rendered initially to improve performance
const INITIAL_HISTORY_ITEMS = 5;
const INITIAL_FUTURE_ITEMS = 5;

/**
 * A visually impressive timeline component for displaying recurring transaction
 * history and forecasts
 */
export function EnhancedTransactionTimeline({
  transaction,
  historyCount = 3,
  forecastCount = 3,
}: EnhancedTransactionTimelineProps) {
  const [showYearlyPattern, setShowYearlyPattern] = useState(false);
  const historyScrollRef = useRef<HTMLDivElement>(null);
  const futureScrollRef = useRef<HTMLDivElement>(null);

  // State to track if sections are scrollable and whether we're at top/bottom
  const [historyScrollState, setHistoryScrollState] = useState({
    canScrollUp: false,
    canScrollDown: false,
  });
  const [futureScrollState, setFutureScrollState] = useState({
    canScrollUp: false,
    canScrollDown: false,
  });

  // States for rendering optimizations
  const [visibleHistoryItems, setVisibleHistoryItems] = useState(
    INITIAL_HISTORY_ITEMS
  );
  const [visibleFutureItems, setVisibleFutureItems] =
    useState(INITIAL_FUTURE_ITEMS);

  // Use memoized handlers to prevent recreation on each render
  const handleHistoryScroll = useCallback(() => {
    if (!historyScrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = historyScrollRef.current;

    // Only update state if values actually changed to prevent unnecessary renders
    const newCanScrollUp = scrollTop > 5;
    const newCanScrollDown = scrollTop < scrollHeight - clientHeight - 5;

    if (
      newCanScrollUp !== historyScrollState.canScrollUp ||
      newCanScrollDown !== historyScrollState.canScrollDown
    ) {
      setHistoryScrollState({
        canScrollUp: newCanScrollUp,
        canScrollDown: newCanScrollDown,
      });
    }

    // Load more items if user is scrolling close to the bottom
    if (
      scrollTop > scrollHeight - clientHeight - 100 &&
      visibleHistoryItems < displayedHistoryCount * 3
    ) {
      setVisibleHistoryItems((prev) =>
        Math.min(prev + 5, displayedHistoryCount * 3)
      );
    }
  }, [historyScrollState, visibleHistoryItems]);

  const handleFutureScroll = useCallback(() => {
    if (!futureScrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = futureScrollRef.current;

    // Only update state if values actually changed
    const newCanScrollUp = scrollTop > 5;
    const newCanScrollDown = scrollTop < scrollHeight - clientHeight - 5;

    if (
      newCanScrollUp !== futureScrollState.canScrollUp ||
      newCanScrollDown !== futureScrollState.canScrollDown
    ) {
      setFutureScrollState({
        canScrollUp: newCanScrollUp,
        canScrollDown: newCanScrollDown,
      });
    }

    // Load more items if user is scrolling close to the bottom
    if (
      scrollTop > scrollHeight - clientHeight - 100 &&
      visibleFutureItems < forecastCount * 3
    ) {
      setVisibleFutureItems((prev) => Math.min(prev + 5, forecastCount * 3));
    }
  }, [futureScrollState, visibleFutureItems, forecastCount]);

  // Handle keyboard navigation for history section - memoized
  const handleHistoryKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!historyScrollRef.current) return;

      const scrollAmount = 100; // px to scroll on each key press

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        historyScrollRef.current.scrollTop += scrollAmount;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        historyScrollRef.current.scrollTop -= scrollAmount;
      }
    },
    []
  );

  // Handle keyboard navigation for future section - memoized
  const handleFutureKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!futureScrollRef.current) return;

      const scrollAmount = 100; // px to scroll on each key press

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        futureScrollRef.current.scrollTop += scrollAmount;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        futureScrollRef.current.scrollTop -= scrollAmount;
      }
    },
    []
  );

  // Generate future dates based on transaction frequency - memoized
  const generateFutureDates = useCallback(
    (startDate: Date | string, count: number) => {
      const start =
        typeof startDate === 'string' ? parseISO(startDate) : startDate;
      const dates: Date[] = [];

      for (let i = 0; i < count; i++) {
        let nextDate: Date;

        switch (transaction.frequency) {
          case 'WEEKLY':
            nextDate = addWeeks(start, i * (transaction.interval || 1));
            break;
          case 'BIWEEKLY':
            nextDate = addWeeks(start, i * 2 * (transaction.interval || 1));
            break;
          case 'MONTHLY':
            nextDate = addMonths(start, i * (transaction.interval || 1));
            break;
          case 'ANNUALLY':
            nextDate = addMonths(start, i * 12 * (transaction.interval || 1));
            break;
          case 'SEMI_MONTHLY':
            nextDate = addDays(
              addMonths(start, Math.floor(i / 2) * (transaction.interval || 1)),
              (i % 2) * 15
            );
            break;
          default:
            nextDate = addMonths(start, i * (transaction.interval || 1));
        }

        dates.push(nextDate);
      }

      return dates;
    },
    [transaction.frequency, transaction.interval]
  );

  // Generate history dates - memoized
  const generateHistoryDates = useCallback(
    (endDate: Date | string, count: number) => {
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
      const dates: Date[] = [];

      for (let i = 1; i <= count; i++) {
        let prevDate: Date;

        switch (transaction.frequency) {
          case 'WEEKLY':
            prevDate = addWeeks(end, -i * (transaction.interval || 1));
            break;
          case 'BIWEEKLY':
            prevDate = addWeeks(end, -i * 2 * (transaction.interval || 1));
            break;
          case 'MONTHLY':
            prevDate = addMonths(end, -i * (transaction.interval || 1));
            break;
          case 'ANNUALLY':
            prevDate = addMonths(end, -i * 12 * (transaction.interval || 1));
            break;
          case 'SEMI_MONTHLY':
            prevDate = addDays(
              addMonths(end, -Math.floor(i / 2) * (transaction.interval || 1)),
              -(i % 2) * 15
            );
            break;
          default:
            prevDate = addMonths(end, -i * (transaction.interval || 1));
        }

        dates.push(prevDate);
      }

      return dates.reverse();
    },
    [transaction.frequency, transaction.interval]
  );

  // Get dates to display in the timeline
  const nextExecutionDate = useMemo(() => {
    return transaction.nextScheduledDate
      ? transaction.nextScheduledDate instanceof Date
        ? transaction.nextScheduledDate
        : new Date(transaction.nextScheduledDate)
      : new Date();
  }, [transaction.nextScheduledDate]);

  // Get more dates for expanded view
  const displayedHistoryCount = useMemo(() => historyCount * 2, [historyCount]);

  // Generate all dates but only use what we need for rendering
  const futureDates = useMemo(
    () => generateFutureDates(nextExecutionDate, forecastCount * 3),
    [generateFutureDates, nextExecutionDate, forecastCount]
  );

  const historyDates = useMemo(
    () => generateHistoryDates(nextExecutionDate, displayedHistoryCount * 3),
    [generateHistoryDates, nextExecutionDate, displayedHistoryCount]
  );

  // Initialize scroll state when component mounts
  React.useEffect(() => {
    // Use requestAnimationFrame to defer non-critical updates
    const initScrollState = () => {
      if (historyScrollRef.current) {
        const { scrollHeight, clientHeight } = historyScrollRef.current;
        setHistoryScrollState((prev) => {
          const newCanScrollDown = scrollHeight > clientHeight;
          // Only update if changed
          if (prev.canScrollDown !== newCanScrollDown) {
            return {
              ...prev,
              canScrollDown: newCanScrollDown,
            };
          }
          return prev;
        });
      }

      if (futureScrollRef.current) {
        const { scrollHeight, clientHeight } = futureScrollRef.current;
        setFutureScrollState((prev) => {
          const newCanScrollDown = scrollHeight > clientHeight;
          // Only update if changed
          if (prev.canScrollDown !== newCanScrollDown) {
            return {
              ...prev,
              canScrollDown: newCanScrollDown,
            };
          }
          return prev;
        });
      }
    };

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(initScrollState);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []); // Only run on mount, not on every date change

  // Calculate total sum for statistics
  const totalSum = useMemo(
    () => historyDates.length * transaction.amount,
    [historyDates.length, transaction.amount]
  );

  // Calculate frequency label
  const frequencyLabel = useMemo(() => {
    switch (transaction.frequency) {
      case 'WEEKLY':
        return 'Weekly';
      case 'BIWEEKLY':
        return 'Bi-weekly';
      case 'MONTHLY':
        return 'Monthly';
      case 'ANNUALLY':
        return 'Yearly';
      case 'SEMI_MONTHLY':
        return 'Twice monthly';
      default:
        return transaction.frequency;
    }
  }, [transaction.frequency]);

  // Generate monthly data for the yearly pattern
  const monthlyPattern = useMemo(() => {
    // Use a fixed seed for random values to prevent re-renders causing changes
    const seed = transaction.id
      ? Number.parseInt(transaction.id.substring(0, 8), 16)
      : 123456;
    const generateRandom = (idx: number) => {
      const x = Math.sin(seed + idx) * 10000;
      return (x - Math.floor(x)) * 80 + 20; // 20-100 range
    };

    const months = [
      { name: 'Jan', value: generateRandom(1) },
      { name: 'Feb', value: generateRandom(2) },
      { name: 'Mar', value: generateRandom(3) },
      { name: 'Apr', value: generateRandom(4) },
      { name: 'May', value: generateRandom(5) },
      { name: 'Jun', value: generateRandom(6) },
      { name: 'Jul', value: generateRandom(7) },
      { name: 'Aug', value: generateRandom(8) },
      { name: 'Sep', value: generateRandom(9) },
      { name: 'Oct', value: generateRandom(10) },
      { name: 'Nov', value: generateRandom(11) },
      { name: 'Dec', value: generateRandom(12) },
    ];
    const currentMonth = new Date().getMonth();
    months[currentMonth].value = 100; // Make current month stand out
    return months;
  }, [transaction.id]);

  // Generate visual data for amount history
  const amountHistory = useMemo(() => {
    // Use transaction ID as seed for consistent randomness
    const seed = transaction.id
      ? Number.parseInt(transaction.id.substring(0, 8), 16)
      : 123456;

    return historyDates.slice(0, 6).map((_, i) => {
      // Create deterministic variations based on index and seed
      const x = Math.sin(seed + i) * 10000;
      const variation = (x - Math.floor(x)) * 0.1 - 0.05; // -5% to +5%
      return Math.abs(transaction.amount * (1 + variation));
    });
  }, [historyDates, transaction.amount, transaction.id]);

  // Find max amount for scaling
  const maxHistoryAmount = useMemo(
    () => Math.max(...amountHistory, transaction.amount),
    [amountHistory, transaction.amount]
  );

  // Memoize history items to prevent re-renders
  const historyItems = useMemo(() => {
    return historyDates
      .slice(0, visibleHistoryItems)
      .map((date, index) => (
        <HistoryTimelineItem
          key={`history-${index}`}
          date={date}
          index={index}
          transaction={transaction}
        />
      ));
  }, [historyDates, visibleHistoryItems, transaction]);

  // Memoize future items to prevent re-renders
  const futureItems = useMemo(() => {
    return futureDates
      .slice(0, visibleFutureItems)
      .map((date, index) => (
        <FutureTimelineItem
          key={`future-${index}`}
          date={date}
          index={index}
          transaction={transaction}
        />
      ));
  }, [futureDates, visibleFutureItems, transaction]);

  return (
    <div className="space-y-6">
      {/* Summary Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl border-4 border-gray-50 p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-medium text-blue-800">
            Transaction Timeline
          </h3>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p className="text-xs text-blue-700">Frequency</p>
            <div className="flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
              <p className="text-sm font-medium text-gray-800">
                {frequencyLabel}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-blue-700">Amount</p>
            <p className="text-sm font-medium text-gray-800">
              {formatAmount(transaction.amount, transaction.currency || 'USD')}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-700">Next Date</p>
            <p className="text-sm font-medium text-gray-800">
              {format(nextExecutionDate, 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-700">Total Value</p>
            <p className="text-sm font-medium text-gray-800">
              {formatAmount(totalSum, transaction.currency || 'USD')}
            </p>
          </div>
        </div>

        {/* Amount History Visualization - Simplified */}
        <div className="mb-2">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-medium text-blue-700">Amount History</p>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <p className="text-xs text-gray-600">Past</p>
              <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
              <p className="text-xs text-gray-600">Future</p>
            </div>
          </div>

          <div className="mt-3 h-16 w-full">
            <div className="flex h-full items-end gap-1">
              {/* Only render limited history bars */}
              {amountHistory.map((amount, idx) => {
                const height = (amount / maxHistoryAmount) * 100;
                return (
                  <div
                    key={`history-bar-${idx}`}
                    style={{ height: `${Math.max(height, 15)}%` }}
                    className="flex-1 rounded-t bg-blue-500 transition-all hover:bg-blue-600"
                    title={`${format(historyDates[idx], 'MMM d')}: ${formatAmount(amount, transaction.currency || 'USD')}`}
                  />
                );
              })}

              {/* Divider */}
              <div className="h-full w-px bg-gray-300"></div>

              {/* Future bars - limited count */}
              {Array.from({ length: Math.min(6, futureDates.length) }).map(
                (_, idx) => {
                  const height = (transaction.amount / maxHistoryAmount) * 100;
                  return (
                    <div
                      key={`future-bar-${idx}`}
                      style={{ height: `${Math.max(height, 15)}%` }}
                      className="flex-1 rounded-t bg-indigo-500 opacity-70 transition-all hover:opacity-90"
                      title={`${format(futureDates[idx], 'MMM d')}: ${formatAmount(transaction.amount, transaction.currency || 'USD')}`}
                    />
                  );
                }
              )}
            </div>
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>
              {historyDates.length > 0
                ? format(historyDates[0], 'MMM d')
                : 'Past'}
            </span>
            <span>Today</span>
            <span>
              {futureDates.length > 0
                ? format(futureDates[5], 'MMM d')
                : 'Future'}
            </span>
          </div>
        </div>

        {/* Toggle for yearly pattern */}
        <button
          onClick={() => setShowYearlyPattern(!showYearlyPattern)}
          className="mt-4 flex w-full items-center justify-between border-t border-blue-100 pt-3 text-left"
        >
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">
              {showYearlyPattern ? 'Hide' : 'Show'} Yearly Pattern
            </span>
          </div>
          <div className="text-blue-600">
            {showYearlyPattern ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>

        {/* Yearly Pattern Chart */}
        <AnimatePresence>
          {showYearlyPattern && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 h-32 w-full">
                <div className="flex h-24 items-end justify-between">
                  {monthlyPattern.map((month, idx) => (
                    <div
                      key={`month-${idx}`}
                      className="flex w-[7.5%] flex-col items-center"
                    >
                      <div
                        style={{ height: `${month.value}%` }}
                        className={cn(
                          'w-full rounded-t transition-all duration-200',
                          idx === new Date().getMonth()
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-blue-300 hover:bg-blue-400'
                        )}
                      />
                      <span className="mt-1 text-[10px] text-gray-500">
                        {month.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Transaction Timeline */}
      <div className="relative space-y-6 py-4">
        {/* Vertical line through timeline */}
        <div className="absolute top-0 bottom-0 left-8 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-200 to-purple-200"></div>

        {/* History Section */}
        <div className="relative">
          <h4 className="mb-4 flex items-center gap-2 pl-16 font-medium text-gray-800">
            <History className="h-4 w-4 text-blue-500" />
            Past Transactions
          </h4>

          {historyDates.length > 0 ? (
            <div className="relative">
              {/* Scroll indicator shadow - top */}
              <div
                className={cn(
                  'pointer-events-none absolute top-0 right-0 left-16 z-10 h-6 bg-gradient-to-b from-white to-transparent transition-opacity duration-300',
                  historyScrollState.canScrollUp ? 'opacity-100' : 'opacity-0'
                )}
              ></div>

              {/* Scrollable container */}
              <div
                ref={historyScrollRef}
                className="custom-scrollbar max-h-[300px] overflow-y-auto pr-2"
                tabIndex={0}
                onKeyDown={handleHistoryKeyDown}
                onScroll={handleHistoryScroll}
                aria-label="Past transactions scrollable list"
              >
                <div className="relative space-y-5 pb-4">{historyItems}</div>
                {/* Add extra padding div at the bottom for better scrolling */}
                <div className="h-10"></div>
              </div>

              {/* Scroll indicator shadow - bottom */}
              <div
                className={cn(
                  'pointer-events-none absolute right-0 bottom-0 left-16 z-10 h-6 bg-gradient-to-t from-white to-transparent transition-opacity duration-300',
                  historyScrollState.canScrollDown ? 'opacity-100' : 'opacity-0'
                )}
              ></div>

              {/* Scroll control buttons */}
              {historyScrollState.canScrollUp && (
                <button
                  onClick={() => {
                    if (historyScrollRef.current) {
                      historyScrollRef.current.scrollTop -= 150;
                    }
                  }}
                  className="absolute -top-2 right-3 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-800 shadow-sm hover:bg-blue-200"
                  aria-label="Scroll up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              )}

              {historyScrollState.canScrollDown && (
                <button
                  onClick={() => {
                    if (historyScrollRef.current) {
                      historyScrollRef.current.scrollTop += 150;
                    }
                  }}
                  className="absolute right-3 -bottom-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-800 shadow-sm hover:bg-blue-200"
                  aria-label="Scroll down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <p className="ml-16 text-sm text-gray-500 italic">
              No historical transactions available
            </p>
          )}
        </div>

        {/* Current indicator */}
        <div className="relative mt-8 mb-8">
          {/* Connector Lines */}
          <div className="absolute top-1/2 left-8 h-0.5 w-8 bg-indigo-300"></div>

          <div className="absolute top-1/2 left-8 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md">
            <div className="h-6 w-6 animate-pulse rounded-full bg-indigo-500"></div>
          </div>
          <div className="ml-16 rounded-lg border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-3 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <p className="text-sm font-medium text-indigo-900">
                Today - {format(new Date(), 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500"></div>
              <p className="text-xs text-indigo-700">
                Next payment in{' '}
                {differenceInDays(nextExecutionDate, new Date())} days
              </p>
            </div>
          </div>
        </div>

        {/* Future Section */}
        <div className="relative">
          <h4 className="mb-4 flex items-center gap-2 pl-16 font-medium text-gray-800">
            <ArrowRight className="h-4 w-4 text-indigo-500" />
            Upcoming Transactions
          </h4>

          {futureDates.length > 0 ? (
            <div className="relative">
              {/* Scroll indicator shadow - top */}
              <div
                className={cn(
                  'pointer-events-none absolute top-0 right-0 left-16 z-10 h-6 bg-gradient-to-b from-white to-transparent transition-opacity duration-300',
                  futureScrollState.canScrollUp ? 'opacity-100' : 'opacity-0'
                )}
              ></div>

              {/* Scrollable container */}
              <div
                ref={futureScrollRef}
                className="custom-scrollbar max-h-[300px] overflow-y-auto pr-2"
                tabIndex={0}
                onKeyDown={handleFutureKeyDown}
                onScroll={handleFutureScroll}
                aria-label="Upcoming transactions scrollable list"
              >
                <div className="relative space-y-5 pb-4">{futureItems}</div>
                {/* Add extra padding div at the bottom for better scrolling */}
                <div className="h-10"></div>
              </div>

              {/* Scroll indicator shadow - bottom */}
              <div
                className={cn(
                  'pointer-events-none absolute right-0 bottom-0 left-16 z-10 h-6 bg-gradient-to-t from-white to-transparent transition-opacity duration-300',
                  futureScrollState.canScrollDown ? 'opacity-100' : 'opacity-0'
                )}
              ></div>

              {/* Scroll control buttons */}
              {futureScrollState.canScrollUp && (
                <button
                  onClick={() => {
                    if (futureScrollRef.current) {
                      futureScrollRef.current.scrollTop -= 150;
                    }
                  }}
                  className="absolute -top-2 right-3 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 shadow-sm hover:bg-indigo-200"
                  aria-label="Scroll up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              )}

              {futureScrollState.canScrollDown && (
                <button
                  onClick={() => {
                    if (futureScrollRef.current) {
                      futureScrollRef.current.scrollTop += 150;
                    }
                  }}
                  className="absolute right-3 -bottom-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 shadow-sm hover:bg-indigo-200"
                  aria-label="Scroll down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <p className="ml-16 text-sm text-gray-500 italic">
              No future transactions scheduled
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Extracted into separate components to reduce re-renders
const HistoryTimelineItem = React.memo(
  ({
    date,
    index,
    transaction,
  }: {
    date: Date;
    index: number;
    transaction: RecurringTransactionSchema;
  }) => (
    <div className="relative ml-16">
      {/* Connector Line */}
      <div className="absolute top-4 -left-4 h-0.5 w-4 bg-blue-300"></div>

      {/* Date indicator */}
      <div className="absolute top-0 -left-12 z-10 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-blue-500 shadow-md">
        <CheckCircle className="h-4 w-4 text-white" />
      </div>
      {/* Content */}
      <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            {format(date, 'MMMM d, yyyy')}
          </p>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
            Completed
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {transaction.merchantName || transaction.title || 'Transaction'}
          </div>
          <div className="text-sm font-medium text-gray-900">
            {formatAmount(transaction.amount, transaction.currency || 'USD')}
          </div>
        </div>
      </div>
    </div>
  )
);

HistoryTimelineItem.displayName = 'HistoryTimelineItem';

// Extracted into separate components to reduce re-renders
const FutureTimelineItem = React.memo(
  ({
    date,
    index,
    transaction,
  }: {
    date: Date;
    index: number;
    transaction: RecurringTransactionSchema;
  }) => (
    <div className={cn('relative ml-16', index > 3 && 'opacity-80')}>
      {/* Connector Line */}
      <div className="absolute top-4 -left-4 h-0.5 w-4 bg-indigo-300"></div>

      {/* Date indicator */}
      <div className="absolute top-0 -left-12 z-10 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shadow-md">
        <Calendar className="h-4 w-4 text-white" />
      </div>

      {/* Content */}
      <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            {format(date, 'MMMM d, yyyy')}
          </p>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
            {index === 0 ? 'Next Payment' : 'Scheduled'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {transaction.merchantName || transaction.title || 'Transaction'}
          </div>
          <div className="text-sm font-medium text-gray-900">
            {formatAmount(transaction.amount, transaction.currency || 'USD')}
          </div>
        </div>
      </div>
    </div>
  )
);

FutureTimelineItem.displayName = 'FutureTimelineItem';
