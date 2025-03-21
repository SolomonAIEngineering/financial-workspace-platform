import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';
import InfoTooltip from '@/components/ui/info-tooltip';
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Badge type options for styling badge variants in DetailRow
 */
export type BadgeType = 'default' | 'success' | 'warning' | 'info' | 'error';

/**
 * Amount type options for styling monetary values in DetailRow
 */
export type AmountType = 'positive' | 'negative' | 'neutral';

/**
 * Props for the DetailRow component
 */
export interface DetailRowProps {
    /** The label text to display on the left side */
    label: string;

    /** The value to display on the right side */
    value: React.ReactNode;

    /** Whether to display the value in a monospace font */
    monospace?: boolean;

    /** Whether to render the value as a badge */
    isBadge?: boolean;

    /** The style of badge to use when isBadge is true */
    badgeType?: BadgeType;

    /** Whether this row displays a monetary amount that should be colored */
    isAmount?: boolean;

    /** The type of amount to determine color when isAmount is true */
    amountType?: AmountType;

    /** Optional tooltip text to display when hovering over the info icon */
    tooltip?: string;

    /** Optional description text to display under the label */
    description?: string;
}

/**
 * A modern, visually appealing component for displaying key-value pairs in detail views.
 * Includes support for various formatting options and visual styles.
 *
 * @param props - The component props
 */
export function DetailRow({
    label,
    value,
    monospace = false,
    isBadge = false,
    badgeType = 'default',
    isAmount = false,
    amountType = 'neutral',
    tooltip,
    description,
}: DetailRowProps) {
    const getBadgeClass = (type: BadgeType) => {
        switch (type) {
            case 'success':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'warning':
                return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'error':
                return 'bg-blue-200 text-blue-800 border-blue-300';
            case 'info':
                return 'bg-blue-50 text-blue-500 border-blue-100';
            default:
                return 'bg-white text-blue-400 border-blue-100';
        }
    };

    const getAmountClass = (type: AmountType) => {
        switch (type) {
            case 'positive':
                return 'text-blue-600';
            case 'negative':
                return 'text-blue-700';
            default:
                return 'text-gray-700';
        }
    };

    return (
        <div className="group mb-3 rounded-md py-2 transition-colors hover:bg-gray-50">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-700">
                        {label}
                    </span>
                    {tooltip && (
                        <InfoTooltip
                            description={tooltip}
                            iconClassName="text-blue-400"
                            size="sm"
                        />
                    )}
                </div>
                <div
                    className={cn(
                        "text-sm",
                        monospace && 'font-mono text-xs'
                    )}
                >
                    <div className="flex justify-between py-2.5 text-sm">
                        <div className="flex items-center gap-2">
                            {isBadge && (
                                <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", getBadgeClass(badgeType as BadgeType))}>
                                    {value}
                                </span>
                            )}
                        </div>

                        <div className={cn("flex items-center gap-1.5", monospace && "font-mono text-xs")}>
                            {isAmount && (
                                <span className={cn("font-medium", getAmountClass(amountType as AmountType))}>
                                    {value}
                                </span>
                            )}

                            {!isBadge && !isAmount && (
                                <span className={cn("text-gray-700", monospace && "font-mono text-xs")}>
                                    {value}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {description && (
                <p className="mt-0.5 text-xs text-gray-500">{description}</p>
            )}
        </div>
    );
} 