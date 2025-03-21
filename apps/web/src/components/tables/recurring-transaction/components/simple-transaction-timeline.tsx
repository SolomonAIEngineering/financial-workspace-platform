import { CheckCircle, Clock } from 'lucide-react';
import { addDays, addMonths, addWeeks, format, parseISO } from 'date-fns';

import React from 'react';
import { RecurringTransactionSchema } from '../schema';
import { cn } from '@/lib/utils';
import { formatAmount } from '../utils/transaction-formatters';

/** Props for the TransactionTimeline component */
export interface TransactionTimelineProps {
  /** The recurring transaction data */
  transaction: RecurringTransactionSchema;

  /** Number of historical transactions to show */
  historyCount?: number;

  /** Number of future transactions to forecast */
  forecastCount?: number;
}

/**
 * A component that displays a timeline of past and future recurring
 * transactions
 */
export function TransactionTimeline({
  transaction,
  historyCount = 3,
  forecastCount = 3,
}: TransactionTimelineProps) {
  // Generate future dates based on transaction frequency
  const generateFutureDates = (startDate: Date | string, count: number) => {
    const start =
      typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const dates: Date[] = [];

    for (let i = 0; i < count; i++) {
      let nextDate: Date;

      // Handle different frequency types
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
          // For semi-monthly, add half a month each time
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
  };

  // Generate history dates (for demonstration - in reality would come from actual data)
  const generateHistoryDates = (endDate: Date | string, count: number) => {
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    const dates: Date[] = [];

    for (let i = 1; i <= count; i++) {
      let prevDate: Date;

      // Handle different frequency types
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
          // For semi-monthly, subtract half a month each time
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
  };

  // Get dates to display in the timeline
  const nextExecutionDate = transaction.nextScheduledDate
    ? transaction.nextScheduledDate instanceof Date
      ? transaction.nextScheduledDate
      : new Date(transaction.nextScheduledDate)
    : new Date();

  const futureDates = generateFutureDates(nextExecutionDate, forecastCount);
  const historyDates = generateHistoryDates(nextExecutionDate, historyCount);

  return (
    <div className="py-2">
      {/* History Section */}
      <div className="mb-4">
        <h4 className="mb-2 text-sm font-medium text-gray-700">
          Transaction History
        </h4>
        {historyDates.length > 0 ? (
          <div className="space-y-3">
            {historyDates.map((date, index) => (
              <div
                key={`history-${index}`}
                className="flex items-center space-x-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {formatAmount(
                      transaction.amount,
                      transaction.currency || 'USD'
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(date, 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                  Completed
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No transaction history available
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-2 text-xs font-medium text-gray-500">
            NOW
          </span>
        </div>
      </div>

      {/* Forecast Section */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-700">
          Upcoming Transactions
        </h4>
        {futureDates.length > 0 ? (
          <div className="space-y-3">
            {futureDates.map((date, index) => (
              <div
                key={`forecast-${index}`}
                className={cn(
                  'flex items-center space-x-3',
                  index === 0
                    ? 'opacity-100'
                    : index === 1
                      ? 'opacity-90'
                      : 'opacity-70'
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {formatAmount(
                      transaction.amount,
                      transaction.currency || 'USD'
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(date, 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  Scheduled
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No upcoming transactions forecasted
          </p>
        )}
      </div>
    </div>
  );
}
