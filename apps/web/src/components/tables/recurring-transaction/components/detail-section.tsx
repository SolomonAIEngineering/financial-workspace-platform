import {
  Activity,
  BarChart2,
  Building2,
  Calendar,
  CircleIcon,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  History,
  Info,
  RepeatIcon,
  Settings,
  Tag,
} from 'lucide-react';

import { ChevronDown } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

/** Available icon options for the detail section */
export type SectionIconType =
  | 'fileText'
  | 'tag'
  | 'clock'
  | 'info'
  | 'creditCard'
  | 'history'
  | 'calendar'
  | 'bank'
  | 'settings'
  | 'chart'
  | 'none'
  | 'dollar-sign'
  | 'repeat'
  | 'activity';

/** Props for the DetailSection component */
export interface DetailSectionProps {
  /** The section title displayed in the header */
  title: string;

  /** The icon type to display next to the title */
  icon?: SectionIconType;

  /** Whether the section should be open by default */
  defaultOpen?: boolean;

  /** The content to display inside the section when open */
  children: React.ReactNode;

  /** Optional class names to apply to the section container */
  className?: string;

  /** Optional badge count to display */
  badgeCount?: number;
}

/**
 * A modern, styled detail section component for organizing content in panels.
 * Provides a toggle-able section with an animated header and expandable
 * content.
 *
 * @param props - The component props
 */
export function DetailSection({
  title,
  icon = 'none',
  defaultOpen = false,
  children,
  className,
  badgeCount,
}: DetailSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  // Map icon types to actual icon components
  const getIconComponent = (iconType: SectionIconType): React.ReactNode => {
    switch (iconType) {
      case 'fileText':
        return <FileText className="h-5 w-5 text-blue-700" />;
      case 'tag':
        return <Tag className="h-5 w-5 text-blue-600" />;
      case 'clock':
        return <Clock className="h-5 w-5 text-blue-700" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-700" />;
      case 'creditCard':
        return <CreditCard className="h-5 w-5 text-blue-700" />;
      case 'history':
        return <History className="h-5 w-5 text-blue-700" />;
      case 'calendar':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'bank':
        return <Building2 className="h-5 w-5 text-blue-600" />;
      case 'settings':
        return <Settings className="h-5 w-5 text-blue-700" />;
      case 'chart':
        return <BarChart2 className="h-5 w-5 text-blue-600" />;
      case 'dollar-sign':
        return <DollarSign className="h-5 w-5 text-blue-600" />;
      case 'repeat':
        return <RepeatIcon className="h-5 w-5 text-blue-700" />;
      case 'activity':
        return <Activity className="h-5 w-5 text-blue-600" />;
      default:
        return <CircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={cn(
        'mb-4 overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm',
        className
      )}
    >
      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          'flex w-full items-center justify-between px-4 py-3 text-left transition-colors',
          'bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 hover:to-blue-50',
          'border-b border-blue-100'
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            {getIconComponent(icon)}
          </div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          {badgeCount !== undefined && (
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {badgeCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-blue-500 transition-transform',
            isOpen && 'rotate-180 transform'
          )}
        />
      </button>
      {isOpen && (
        <div className="divide-y divide-blue-50 px-4 py-3">{children}</div>
      )}
    </div>
  );
}
