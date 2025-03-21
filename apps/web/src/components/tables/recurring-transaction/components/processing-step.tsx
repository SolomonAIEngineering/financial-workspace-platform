import React from 'react';
import { cn } from '@/lib/utils';

/** Available color options for the processing step bar */
export type ProcessingStepColorType =
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'purple'
  | 'default';

/**
 * Props for the ProcessingStep component
 *
 * @property label - The name of the processing step
 * @property percentage - The percentage of time this step took relative to the
 *   whole process
 * @property time - The formatted time string (e.g., "122ms")
 * @property color - The color variant to use for the progress bar
 */
export interface ProcessingStepProps {
  /** The name of the processing step */
  label: string;

  /** The percentage of time this step took relative to the whole process */
  percentage: number;

  /** The formatted time string (e.g., "122ms") */
  time: string;

  /** The color variant to use for the progress bar */
  color?: ProcessingStepColorType;
}

/**
 * ProcessingStep component for visualizing processing steps with percentage
 * bars. Used to display relative time spent in each step of a process, such as
 * transaction processing phases.
 *
 * The component displays:
 *
 * - A label for the step name
 * - The percentage of total time this step took
 * - The absolute time value
 * - A progress bar with customizable color
 *
 * @example
 *   ```tsx
 *   <ProcessingStep
 *     label="VERIFICATION"
 *     percentage={29.3}
 *     time="293ms"
 *     color="info"
 *   />
 *   ```;
 *
 * @param props - The component props
 * @returns A processing step visualization component
 */
export function ProcessingStep({
  label,
  percentage,
  time,
  color = 'default',
}: ProcessingStepProps) {
  // Map color types to Tailwind CSS classes
  const colorMap: Record<ProcessingStepColorType, string> = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    warning: 'bg-orange-500',
    error: 'bg-red-500',
    purple: 'bg-purple-500',
    default: 'bg-gray-500',
  };

  const barColor = colorMap[color];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="text-right">{percentage.toFixed(1)}%</span>
        <span className="w-10 text-right">{time}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn('h-full', barColor)}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
