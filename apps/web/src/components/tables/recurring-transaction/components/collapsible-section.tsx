import {
    Calendar,
    Clock,
    CreditCard,
    FileText,
    History,
    Info,
    Landmark,
    Tag
} from 'lucide-react';

import { ChevronDown } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Available icon options for the collapsible section
 */
export type SectionIconType = 'fileText' | 'tag' | 'clock' | 'info' | 'creditCard' | 'history' | 'calendar' | 'bank' | 'none';

/**
 * Props for the CollapsibleSection component
 * 
 * @property title - The section title displayed in the header
 * @property icon - The icon type to display next to the title or 'none' for no icon
 * @property defaultOpen - Whether the section should be open by default
 * @property children - The content to display inside the section when open
 */
export interface CollapsibleSectionProps {
    /** The section title displayed in the header */
    title: string;

    /** The icon type to display next to the title or 'none' for no icon */
    icon?: SectionIconType;

    /** Whether the section should be open by default */
    defaultOpen?: boolean;

    /** The content to display inside the section when open */
    children: React.ReactNode;
}

/**
 * Collapsible section component for organizing content in the detail view.
 * Provides a toggle-able section with a header and expandable content.
 * 
 * Features:
 * - Animated chevron indicator
 * - Optional icon in header
 * - Customizable default state (open/closed)
 * - Hover effect for better UX
 *
 * @example
 * ```tsx
 * <CollapsibleSection 
 *   title="Transaction Properties" 
 *   icon="info"
 *   defaultOpen={true}
 * >
 *   <div className="p-4">
 *     <p>Content goes here</p>
 *   </div>
 * </CollapsibleSection>
 * ```
 *
 * @param props - The component props
 * @returns A collapsible section component
 */
export function CollapsibleSection({
    title,
    icon = 'none',
    defaultOpen = false,
    children,
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    // Map icon types to actual icon components
    const getIcon = () => {
        const iconClasses = 'h-4 w-4 text-muted-foreground';

        switch (icon) {
            case 'fileText':
                return <FileText className={iconClasses} />;
            case 'tag':
                return <Tag className={iconClasses} />;
            case 'clock':
                return <Clock className={iconClasses} />;
            case 'info':
                return <Info className={iconClasses} />;
            case 'creditCard':
                return <CreditCard className={iconClasses} />;
            case 'history':
                return <History className={iconClasses} />;
            case 'calendar':
                return <Calendar className={iconClasses} />;
            case 'bank':
                return <Landmark className={iconClasses} />;
            case 'none':
            default:
                return null;
        }
    };

    return (
        <div className="border-t">
            <div
                className="flex cursor-pointer items-center py-3 transition-colors hover:bg-accent/10"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 text-sm font-medium">
                    {getIcon()}
                    <span>{title}</span>
                </div>
                <ChevronDown
                    className={cn(
                        'ml-auto h-4 w-4 text-muted-foreground transition-transform',
                        isOpen && 'rotate-180'
                    )}
                />
            </div>
            {isOpen && <div className="pb-4">{children}</div>}
        </div>
    );
} 