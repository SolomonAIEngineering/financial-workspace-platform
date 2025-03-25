import { Calendar, CreditCard, DollarSign, Store } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { StatusBadge } from './status-badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '../utils/format-utils';

/** Status mapping for transaction status to StatusBadge status type */
export const mapTransactionStatus = (status: string) => {
  const statusMap: Record<
    string,
    | 'active'
    | 'pending'
    | 'warning'
    | 'error'
    | 'cancelled'
    | 'paused'
    | 'completed'
    | 'unknown'
  > = {
    ACTIVE: 'active',
    PENDING: 'pending',
    FAILED: 'error',
    CANCELLED: 'cancelled',
    PAUSED: 'paused',
    COMPLETED: 'completed',
  };

  return statusMap[status] || 'unknown';
};

/** Props for the TransactionCard component */
export interface TransactionCardProps {
  /** Unique identifier for the transaction */
  id: string;

  /** Transaction amount */
  amount: number;

  /** Currency code */
  currency: string;

  /** Transaction status */
  status: string;

  /** Transaction type */
  type: string;

  /** Merchant name */
  merchantName?: string;

  /** Transaction description */
  description?: string;

  /** Next execution date */
  nextExecutionDate?: string | Date | null;

  /** Transaction frequency */
  frequency?: string;

  /** Optional additional class names */
  className?: string;

  /** Transaction importance level */
  importance?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
}

/**
 * A modern, visually appealing card component for displaying recurring
 * transaction details. This component serves as a summary view in list
 * contexts.
 */
export function TransactionCard({
  id,
  amount,
  currency,
  status,
  type,
  merchantName,
  description,
  nextExecutionDate,
  frequency,
  className,
  importance = 'MEDIUM',
}: TransactionCardProps) {
  // Importance level styling
  const importanceBar = () => {
    const importanceStyles: Record<string, string> = {
      LOW: 'bg-gray-300',
      MEDIUM: 'bg-blue-400',
      HIGH: 'bg-amber-500',
      CRITICAL: 'bg-red-500',
    };

    return (
      <div
        className={cn(
          'absolute top-0 bottom-0 left-0 w-1.5',
          importanceStyles[importance] || 'bg-gray-300'
        )}
      />
    );
  };

  // Format next execution date if provided
  const formattedNextDate = nextExecutionDate
    ? typeof nextExecutionDate === 'string'
      ? format(parseISO(nextExecutionDate), 'MMM d, yyyy')
      : format(nextExecutionDate, 'MMM d, yyyy')
    : 'Not scheduled';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md',
        className
      )}
    >
      {importanceBar()}

      <div className="ml-2">
        {/* Card Header */}
        <div className="mb-2 flex items-center justify-between">
          <StatusBadge status={mapTransactionStatus(status)} />
          <span className="text-xs text-gray-500">ID: {id.slice(0, 8)}</span>
        </div>

        {/* Main Transaction Info */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">
              {merchantName || 'Unnamed Transaction'}
            </h3>
            <p className="line-clamp-1 text-sm text-gray-600">
              {description || type}
            </p>
          </div>
          <div className="text-right">
            <p
              className={cn(
                'text-lg font-semibold',
                amount < 0 ? 'text-red-600' : 'text-emerald-600'
              )}
            >
              {formatCurrency(amount, currency)}
            </p>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-600">{type}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5 text-gray-400" />
            <span className="truncate text-xs text-gray-600">
              {merchantName || 'Unknown'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-600">{formattedNextDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-600">
              {frequency || 'Unknown frequency'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
