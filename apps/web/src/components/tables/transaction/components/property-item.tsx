import * as React from 'react';

import { Check, X } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/registry/default/potion-ui/tooltip';

import { cn } from '@/lib/utils';

/**
 * Interface for the PropertyItem component props.
 * 
 * @interface PropertyItemProps
 * @property {string} label - The text label to display for the property
 * @property {boolean} value - The boolean value of the property (true/false)
 * @property {string} [tooltip] - Optional tooltip text to provide more context
 * @property {'default' | 'success' | 'warning' | 'danger' | 'info'} [colorScheme='default'] - 
 *   The color scheme to use for styling the property item based on its semantic meaning
 */
interface PropertyItemProps {
    label: string;
    value: boolean;
    tooltip?: string;
    colorScheme?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

/**
 * PropertyItem component - Displays a labeled boolean property with visual indication.
 * 
 * This component is used to show boolean properties/flags in a transaction with consistent 
 * styling. Each property is displayed as a pill/chip with a label and a checkmark or X icon
 * to indicate true/false state. Optional tooltips provide additional context.
 *
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <PropertyItem label="Recurring" value={transaction.isRecurring} />
 * 
 * // With tooltip and semantic coloring
 * <PropertyItem 
 *   label="Tax Deductible" 
 *   value={transaction.isTaxDeductible} 
 *   tooltip="This transaction can be deducted from taxes"
 *   colorScheme="success"
 * />
 * ```
 *
 * @param {PropertyItemProps} props - Component props
 * @returns {JSX.Element} The rendered property item
 */
export function PropertyItem({
    label,
    value,
    tooltip,
    colorScheme = 'default'
}: PropertyItemProps) {
    /**
     * Determines the CSS classes to apply based on the value and color scheme.
     * 
     * @returns {string} CSS class names to apply to the property item
     */
    const getColorClasses = () => {
        if (!value) return "bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400";

        switch (colorScheme) {
            case 'success':
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
            case 'warning':
                return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
            case 'danger':
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            case 'info':
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            default:
                return "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300";
        }
    };

    const content = (
        <div className={cn(
            "px-2 py-1.5 rounded-md flex items-center justify-between",
            getColorClasses()
        )}>
            <span className="text-xs">{label}</span>
            <span className="flex items-center">
                {value ? (
                    <Check className="h-3.5 w-3.5" />
                ) : (
                    <X className="h-3.5 w-3.5 opacity-50" />
                )}
            </span>
        </div>
    );

    if (tooltip) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="cursor-help">{content}</div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                        <p className="text-xs">{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return content;
} 