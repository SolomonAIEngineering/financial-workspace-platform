import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { ProcessingStep } from './processing-step';
import { cn } from '@/lib/utils';

/**
 * Interface for timing phase data used in the processing time visualization.
 *
 * @property name - The name of the processing phase
 * @property percentage - The percentage of total processing time
 * @property value - The actual time value in milliseconds
 * @property color - The color to use for the phase visualization
 */
interface TimingPhase {
  name: string;
  percentage: number;
  value: number;
  color: string;
}

interface TransactionTimelineProps {
  timingPhases: TimingPhase[];
  totalLatency: number;
}

export function TransactionTimeline({
  timingPhases,
  totalLatency,
}: TransactionTimelineProps) {
  return (
    <div className="rounded-md border bg-gray-50/50 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Processing Time</h3>
        </div>
        <div className="flex items-center gap-1">
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-xs font-normal"
          >
            P50
          </Badge>
          <p className="text-sm">{totalLatency}ms</p>
        </div>
      </div>

      <div className="space-y-2">
        {timingPhases.map((phase) => (
          <ProcessingStep
            key={phase.name}
            name={phase.name}
            percentage={phase.percentage}
            value={phase.value}
            color={phase.color}
          />
        ))}
      </div>
    </div>
  );
}
