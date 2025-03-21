import * as React from 'react';

import { cn } from '@/lib/utils';

interface ProcessingStepProps {
  name: string;
  percentage: number;
  value: number;
  color: string;
}

export function ProcessingStep({
  name,
  percentage,
  value,
  color,
}: ProcessingStepProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center">
          <span className="font-mono">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {percentage.toFixed(1)}%
          </span>
          <span className="font-mono">{value}ms</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(color, 'h-full rounded-full')}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
