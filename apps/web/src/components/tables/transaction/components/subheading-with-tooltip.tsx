import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/registry/default/potion-ui/tooltip';

import { HelpCircle } from 'lucide-react';
import React from 'react';

interface SubheadingWithTooltipProps {
    label: string;
    tooltip?: string;
}

/**
 * SubheadingWithTooltip component - Renders a subheading with optional tooltip.
 *
 * This helper component displays a subheading label with an optional
 * tooltip that provides additional context. When a tooltip is provided, it also
 * displays a help icon that users can hover over to see the tooltip content.
 */
export function SubheadingWithTooltip({
    label,
    tooltip,
}: SubheadingWithTooltipProps) {
    if (!tooltip) {
        return <p className="mb-2 text-xs text-muted-foreground">{label}</p>;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="mb-2 flex cursor-help items-center gap-1">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <HelpCircle className="h-3 w-3 text-muted-foreground/70" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                    <p className="text-xs">{tooltip}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
} 