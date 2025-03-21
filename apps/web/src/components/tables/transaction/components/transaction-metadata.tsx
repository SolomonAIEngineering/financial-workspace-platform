import * as React from 'react';

import { Calendar, Clock, Edit, RotateCcw } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatDate } from './utils';

interface TransactionMetadataProps {
  age?: number;
  isRecurring?: boolean;
  isManual?: boolean;
  creationDate?: string | Date;
}

export function TransactionMetadata({
  age,
  isRecurring,
  isManual,
  creationDate,
}: TransactionMetadataProps) {
  return (
    <div className="mt-4 rounded-lg border-4 border-gray-50 bg-card/60 p-[2.5%] shadow-sm">
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">
        Transaction Metadata
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Age */}
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/20">
            <Clock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Age</p>
            <p className="text-sm font-medium">
              {age !== undefined ? `${age} days` : 'New'}
            </p>
          </div>
        </div>

        {/* Frequency */}
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-cyan-100 p-2 dark:bg-cyan-900/20">
            <RotateCcw className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Frequency</p>
            <p className="text-sm font-medium">
              {isRecurring ? 'Recurring' : 'One-time'}
            </p>
          </div>
        </div>

        {/* Entry Method */}
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/20">
            <Edit className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Entry Method</p>
            <p className="text-sm font-medium">
              {isManual ? 'Manual entry' : 'Auto-import'}
            </p>
          </div>
        </div>

        {/* Creation Date */}
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
            <Calendar className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Creation Date</p>
            <p className="text-sm font-medium">
              {creationDate ? formatDate(creationDate) : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
