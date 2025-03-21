import * as React from 'react';

import { ChevronDown, HelpCircle } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/registry/default/potion-ui/tooltip';

import { cn } from '@/lib/utils';

/**
 * Interface defining the props for the TransactionSection component.
 * 
 * @interface TransactionSectionProps
 * @property {string} title - The title text to display in the section header.
 * @property {React.ReactNode} children - The content to display inside the collapsible section.
 * @property {React.ReactNode} [icon] - Optional icon to display next to the section title.
 * @property {boolean} [defaultOpen=false] - Whether the section should be expanded by default.
 * @property {string} [className] - Optional additional CSS classes to apply to the section.
 * @property {string} [tooltip] - Optional tooltip text to display when hovering over the section title.
 */
interface TransactionSectionProps {
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
    tooltip?: string;
}

/**
 * TransactionSection component - A collapsible section used for displaying
 * grouped transaction information with optional tooltips.
 * 
 * This component provides a consistent UI pattern for transaction details,
 * with accessibility features including tooltips for additional context.
 * The component has a collapsible behavior allowing users to expand/collapse
 * sections as needed to focus on relevant information.
 *
 * @component
 * @example
 * ```tsx
 * <TransactionSection 
 *   title="Payment Details"
 *   icon={<CreditCard className="h-4 w-4" />}
 *   tooltip="Information about how this transaction was paid"
 *   defaultOpen={true}
 * >
 *   <DetailRow label="Payment Method" value="Credit Card" />
 *   <DetailRow label="Card Number" value="**** 1234" />
 * </TransactionSection>
 * ```
 *
 * @param {TransactionSectionProps} props - The component props
 * @returns {JSX.Element} The rendered section component
 */
export function TransactionSection({
    title,
    children,
    icon,
    defaultOpen = false,
    className,
    tooltip,
}: TransactionSectionProps) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    const titleElement = tooltip ? (
        <div className="flex items-center gap-1">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-help">
                            <h3 className="text-sm font-medium">{title}</h3>
                            <HelpCircle className="h-3 w-3 text-muted-foreground/70" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                        <p className="text-xs">{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    ) : (
        <h3 className="text-sm font-medium">{title}</h3>
    );

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className={cn(
                "rounded-lg border-4 border-gray-50 bg-card/80 shadow-sm transition-all duration-200",
                "hover:shadow-md hover:bg-card md:p-[2.5%] mb-4",
                className
            )}
        >
            <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    {icon && <div className="text-muted-foreground">{icon}</div>}
                    {titleElement}
                </div>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </CollapsibleTrigger>
            <CollapsibleContent className="animate-collapsible-down">
                <div className={cn(
                    "px-4 pb-4 pt-4",
                    "border-t border-border/40"
                )}>
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
} 