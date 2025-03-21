import * as React from 'react';

import { formatAmount, formatDate } from './utils';

import type { ColumnSchema } from '../schema';
import { DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RelatedTransactionItemProps {
  transaction: ColumnSchema;
  onClick?: () => void;
}

export function RelatedTransactionItem({
  transaction,
  onClick,
}: RelatedTransactionItemProps) {
  return (
    <div
      className="flex items-center rounded-md bg-background p-2 transition-colors hover:bg-accent/10"
      onClick={onClick}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
          {transaction.category && <DollarSign className="h-3 w-3" />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">
            {transaction.name || 'Transaction'}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {formatDate(transaction.date)}
          </p>
        </div>
      </div>
      <p
        className={cn(
          'ml-2 text-xs font-medium',
          transaction.amount < 0 ? 'text-red-500' : 'text-emerald-500'
        )}
      >
        {formatAmount(transaction.amount, transaction.currency)}
      </p>
    </div>
  );
}
