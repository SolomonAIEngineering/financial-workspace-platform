import * as React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/registry/default/potion-ui/tooltip';

import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Maps a badge type string to its corresponding variant in the UI component
 * system.
 *
 * @function getBadgeVariant
 * @param {string} [badgeType] - The type of badge to display.
 * @returns {'default' | 'secondary' | 'destructive' | 'outline'} The variant
 *   string that should be used with the Badge component.
 */
function getBadgeVariant(
  badgeType?: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (!badgeType) return 'default';

  switch (badgeType) {
    case 'success':
    case 'warning':
    case 'error':
      return 'outline';
    case 'info':
    case 'secondary':
      return 'secondary';
    case 'destructive':
      return 'destructive';
    default:
      return 'default';
  }
}

/**
 * Determines CSS classes to apply to a badge based on its type. Provides
 * semantic colors for different badge states (success, warning, error, etc.).
 *
 * @function getBadgeClass
 * @param {string} [badgeType] - The type of badge to style.
 * @returns {string} A string of CSS classes to apply to the badge.
 */
function getBadgeClass(badgeType?: string): string {
  if (!badgeType) return '';

  switch (badgeType) {
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400';
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400';
    case 'error':
      return 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400';
    case 'info':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    default:
      return '';
  }
}

/**
 * Interface for props accepted by the DetailRow component.
 *
 * @property {string} label - The label text shown on the left side of the row.
 * @property {string | number | React.ReactNode} value - The value to display on the
 *   right side of the row.
 * @property {boolean} [monospace] - Whether to display the value in a monospace
 *   font for better legibility of codes/IDs.
 * @property {boolean} [isBadge] - Whether to display the value as a badge
 *   component.
 * @property {string} [badgeType] - The type of badge to display ('success',
 *   'warning', 'error', 'info').
 * @property {boolean} [isAmount] - Whether the value represents a financial
 *   amount.
 * @property {'positive' | 'negative' | 'neutral'} [amountType] - The type of
 *   financial amount for appropriate styling.
 * @property {string} [tooltip] - Optional tooltip text to show when hovering
 *   over the label.
 * @property {string} [className] - Optional additional CSS class names to apply
 *   to the row container.
 * @property {boolean} [valueTooltip] - Whether to show a tooltip on the value
 *   itself.
 * @property {string} [valueTooltipContent] - Content to display in the value's
 *   tooltip.
 * @property {boolean} [copyable] - Whether the value can be copied to
 *   clipboard.
 * @property {() => void} [onCopy] - Function to call when the value is copied.
 * @property {boolean} [loading] - Whether the row is in a loading state.
 * @property {boolean} [interactive] - Whether the value is interactive (can be clicked).
 * @property {string} [hoverText] - Text to display when hovering over an interactive value.
 * @interface DetailRowProps
 */
interface DetailRowProps {
  label: string;
  value: string | number | React.ReactNode;
  tooltip?: string;
  isBadge?: boolean;
  badgeType?: string;
  isAmount?: boolean;
  amountType?: 'positive' | 'negative' | 'neutral';
  monospace?: boolean;
  href?: string;
  onClick?: () => void;
  interactive?: boolean;
  hoverText?: string;
}

/**
 * DetailRow component - Renders a labeled value row with various display
 * options.
 *
 * This component is a versatile building block for displaying transaction
 * details, providing consistent presentation with multiple display variants
 * (text, badge, amount, link). It includes accessibility features such as
 * tooltips and appropriate semantic markup.
 *
 * @example
 *   ```tsx
 *   // Basic usage
 *   <DetailRow label="Transaction ID" value="TXN12345678" monospace={true} />
 *
 *   // With badge
 *   <DetailRow label="Status" value="COMPLETED" isBadge={true} badgeType="success" />
 *
 *   // With interactive badge
 *   <DetailRow 
 *     label="Status" 
 *     value="Pending" 
 *     isBadge={true} 
 *     badgeType="warning" 
 *     interactive={true}
 *     onClick={() => markAsComplete()}
 *     hoverText="Click to mark as complete"
 *   />
 *
 *   // With amount styling
 *   <DetailRow label="Amount" value="$1,250.00" isAmount={true} amountType="positive" />
 *
 *   // With tooltip
 *   <DetailRow
 *     label="Processing Fee"
 *     value="$12.50"
 *     tooltip="Fee charged by the payment processor for this transaction"
 *   />
 *   ```;
 *
 * @param {DetailRowProps} props - The component props
 * @returns {JSX.Element} The rendered row component
 * @component
 */
export function DetailRow({
  label,
  value,
  tooltip,
  isBadge = false,
  badgeType,
  isAmount = false,
  amountType = 'neutral',
  monospace = false,
  href,
  onClick,
  interactive = false,
  hoverText,
}: DetailRowProps) {
  /**
   * Renders the appropriate value display based on the props provided.
   *
   * @returns {JSX.Element} The rendered value element
   */
  const renderValue = () => {
    // If value is a React element, return it directly
    if (React.isValidElement(value)) {
      return value;
    }

    // Badge display
    if (isBadge && typeof value === 'string') {
      return (
        <div
          className={cn(
            "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
            getBadgeClass(badgeType),
            interactive && "cursor-pointer hover:opacity-80 transition-opacity",
            interactive && "relative group"
          )}
          onClick={interactive ? onClick : undefined}
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
          onKeyDown={interactive ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick?.();
            }
          } : undefined}
        >
          {value}
          {interactive && hoverText && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded z-50">
              {hoverText}
            </span>
          )}
        </div>
      );
    }

    if (isAmount) {
      return (
        <span
          className={cn(
            'font-medium',
            amountType === 'positive' && 'text-green-600 dark:text-green-400',
            amountType === 'negative' && 'text-red-600 dark:text-red-400'
          )}
        >
          {value}
        </span>
      );
    }

    if (monospace) {
      return <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">{value}</code>;
    }

    if (href) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {value}
        </a>
      );
    }

    return <span className="text-foreground">{value}</span>;
  };

  return (
    <div className="flex flex-row items-start justify-between py-1.5 text-sm">
      <div className="flex items-center gap-1.5">
        {tooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center gap-1">
                  <span className="text-muted-foreground">{label}</span>
                  <HelpCircle className="h-3 w-3 text-muted-foreground/70" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-muted-foreground">{label}</span>
        )}
      </div>
      {renderValue()}
    </div>
  );
}
