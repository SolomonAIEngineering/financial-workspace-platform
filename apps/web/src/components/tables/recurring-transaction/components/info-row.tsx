import { Badge } from '@/components/ui/badge';
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Badge type options for styling badge variants in InfoRow
 */
export type BadgeType = 'default' | 'success' | 'warning' | 'info' | 'error';

/**
 * Amount type options for styling monetary values in InfoRow
 */
export type AmountType = 'positive' | 'negative' | 'neutral';

/**
 * Props for the InfoRow component
 * 
 * @property label - The label text to display on the left side
 * @property value - The value to display on the right side
 * @property monospace - Whether to display the value in a monospace font
 * @property size - The text size to use ('sm' for small, 'base' for default)
 * @property isBadge - Whether to render the value as a badge
 * @property badgeType - The style of badge to use when isBadge is true
 * @property isAmount - Whether this row displays a monetary amount that should be colored
 * @property amountType - The type of amount to determine color when isAmount is true
 */
export interface InfoRowProps {
    /** The label text to display on the left side */
    label: string;

    /** The value to display on the right side */
    value: React.ReactNode;

    /** Whether to display the value in a monospace font */
    monospace?: boolean;

    /** The text size to use ('sm' for small, 'base' for default) */
    size?: 'sm' | 'base';

    /** Whether to render the value as a badge */
    isBadge?: boolean;

    /** The style of badge to use when isBadge is true */
    badgeType?: BadgeType;

    /** Whether this row displays a monetary amount that should be colored */
    isAmount?: boolean;

    /** The type of amount to determine color when isAmount is true */
    amountType?: AmountType;
}

/**
 * InfoRow component for displaying key-value pairs of information.
 * Used throughout detail views to consistently format information with various display options.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <InfoRow label="Transaction ID" value="tx_123456789" />
 * 
 * // With monospace formatting for IDs
 * <InfoRow label="Transaction ID" value="tx_123456789" monospace />
 * 
 * // As a badge
 * <InfoRow 
 *   label="Status" 
 *   value="Active" 
 *   isBadge 
 *   badgeType="success" 
 * />
 * 
 * // As a monetary amount with color
 * <InfoRow
 *   label="Amount"
 *   value="$15.99"
 *   isAmount
 *   amountType="negative"
 * />
 * ```
 * 
 * @param props - The component props
 * @returns A formatted key-value display component
 */
export function InfoRow({
    label,
    value,
    monospace = false,
    size = 'base',
    isBadge = false,
    badgeType = 'default',
    isAmount = false,
    amountType = 'neutral',
}: InfoRowProps) {
    // Badge style mapping
    const badgeStyles: Record<BadgeType, string> = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-amber-100 text-amber-800',
        info: 'bg-blue-100 text-blue-800',
        error: 'bg-red-100 text-red-800',
    };

    // Amount style mapping
    const amountStyles: Record<AmountType, string> = {
        positive: 'text-green-600',
        negative: 'text-red-600',
        neutral: 'text-foreground',
    };

    // Render the value based on the provided options
    const renderValue = () => {
        if (isBadge && typeof value === 'string') {
            return (
                <Badge className={cn('px-1.5 py-0 text-xs font-normal uppercase', badgeStyles[badgeType])}>
                    {value}
                </Badge>
            );
        }

        if (isAmount) {
            return (
                <span className={cn('font-medium', amountStyles[amountType])}>
                    {value}
                </span>
            );
        }

        return value || '-';
    };

    return (
        <div className="flex items-center justify-between">
            <span
                className={cn(
                    'text-muted-foreground',
                    size === 'sm' ? 'text-xs' : 'text-sm'
                )}
            >
                {label}
            </span>
            <span
                className={cn(
                    size === 'sm' ? 'text-xs' : 'text-sm',
                    monospace && 'font-mono text-xs'
                )}
            >
                {renderValue()}
            </span>
        </div>
    );
} 