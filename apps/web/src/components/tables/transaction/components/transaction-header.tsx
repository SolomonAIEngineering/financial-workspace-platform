import * as React from 'react';

import { ArrowDown, ArrowUp, Calendar } from 'lucide-react';
import { formatAmount, formatDate } from './utils';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TransactionHeaderProps {
  id?: string;
  amount: number;
  currency?: string;
  status?: string;
  type?: string;
  merchantName?: string;
  description?: string;
  date?: string | Date;
  isPending?: boolean;
}

export function TransactionHeader({
  id,
  amount,
  currency = 'USD',
  status,
  type,
  merchantName,
  description,
  date,
  isPending = false,
}: TransactionHeaderProps) {
  // Format transaction ID
  const formattedId = id ? `${id.slice(0, 8)}...${id.slice(-8)}` : 'N/A';

  // Determine amount type for styling
  const isNegative = amount < 0;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg p-[2%] transition-all',
        'border-4 border-gray-50 shadow-sm',
        isPending
          ? 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20'
          : 'bg-gradient-to-r from-card to-card/80'
      )}
    >
      {/* Status indicator strip */}
      <div
        className={cn(
          'h-1 w-full',
          isPending
            ? 'bg-gradient-to-r from-amber-300 to-amber-400'
            : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
        )}
      />

      <div className="p-4">
        {/* Top section with ID and status */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              ID: {formattedId}
            </span>
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-medium',
                isPending
                  ? 'border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
              )}
            >
              {status}
            </Badge>
          </div>
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-100 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
          >
            {type}
          </Badge>
        </div>

        {/* Main transaction info */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {merchantName && (
              <h3 className="mb-1 truncate text-sm font-medium">
                {merchantName}
              </h3>
            )}
            <h2 className="mb-2 truncate text-lg font-semibold">
              {description}
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{date ? formatDate(date) : 'No date'}</span>
            </div>
          </div>

          <div
            className={cn(
              'flex flex-col items-end',
              'rounded-lg border-4 border-gray-50 px-4 py-3',
              isNegative
                ? 'bg-red-50 dark:bg-red-950/20'
                : 'bg-green-50 dark:bg-green-950/20'
            )}
          >
            <div className="mb-1 flex items-center gap-1">
              {isNegative ? (
                <ArrowDown className="h-3 w-3 text-red-500" />
              ) : (
                <ArrowUp className="h-3 w-3 text-green-500" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  isNegative ? 'text-red-500' : 'text-green-500'
                )}
              >
                {isNegative ? 'OUTFLOW' : 'INFLOW'}
              </span>
            </div>
            <span
              className={cn(
                'text-xl font-bold',
                isNegative ? 'text-red-600' : 'text-green-600'
              )}
            >
              {formatAmount(amount, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
