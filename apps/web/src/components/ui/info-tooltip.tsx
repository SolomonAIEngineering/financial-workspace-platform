/**
 * InfoTooltip Component
 *
 * A reusable tooltip component that displays helpful information when users
 * hover over a question mark icon. Designed to provide contextual help and
 * detailed explanations for various UI elements throughout the application.
 *
 * @module components/ui/info-tooltip
 * @file Info Tooltip Component
 */

'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/registry/default/potion-ui/tooltip';

import { HelpCircle } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for the InfoTooltip component
 *
 * @interface InfoTooltipProps
 */
export interface InfoTooltipProps {
  /** Title text to display in the tooltip. Should be brief and descriptive. */
  title?: string;

  /**
   * Detailed description text to display in the tooltip. Can include longer
   * explanations and instructions.
   */
  description: string;

  /** Optional CSS class to apply to the tooltip trigger icon. */
  iconClassName?: string;

  /** Optional CSS class to apply to the tooltip content. */
  contentClassName?: string;

  /**
   * Optional size for the question mark icon.
   *
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'lg';

  /**
   * Optional side where the tooltip should appear.
   *
   * @default 'top'
   */
  side?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * Optional alignment of the tooltip relative to the trigger.
   *
   * @default 'center'
   */
  align?: 'start' | 'center' | 'end';
}

/**
 * InfoTooltip component that displays a question mark icon with a tooltip.
 *
 * This component is useful for providing additional context or explanations for
 * fields, features, or actions in the user interface. It helps improve user
 * experience by making information available on demand without cluttering the
 * interface.
 *
 * @example
 *   ```tsx
 *   // Basic usage
 *   <InfoTooltip
 *     title="Team Slug"
 *     description="A unique identifier for your team used in URLs"
 *   />
 *
 *   // With customized appearance
 *   <InfoTooltip
 *     title="Document Classification"
 *     description="Automatically categorize incoming documents based on content"
 *     size="lg"
 *     side="right"
 *     iconClassName="text-blue-500"
 *   />
 *   ```;
 *
 * @param props - The component props
 * @returns A tooltip component with a question mark icon trigger
 */
export function InfoTooltip({
  title,
  description,
  iconClassName,
  contentClassName,
  size = 'default',
  side = 'top',
  align = 'center',
}: InfoTooltipProps) {
  // Determine icon size based on the size prop
  const iconSize = {
    sm: 14,
    default: 16,
    lg: 18,
  }[size];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex cursor-help items-center justify-center rounded-full bg-background',
              'text-muted-foreground transition-colors hover:text-foreground',
              iconClassName
            )}
          >
            <HelpCircle size={iconSize} />
          </span>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            'max-w-sm bg-background p-3 text-sm text-foreground md:min-h-[80px] md:min-w-[200px] md:p-[3%]',
            contentClassName
          )}
        >
          {title && <div className="mb-1 font-medium">{title}</div>}
          <div className="text-xs text-muted-foreground">{description}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default InfoTooltip;
