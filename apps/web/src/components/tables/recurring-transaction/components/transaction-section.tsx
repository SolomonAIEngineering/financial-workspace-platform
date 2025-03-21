import * as Icons from 'lucide-react';

import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

/** Available icon types that can be used in the TransactionSection component */
export type SectionIconType =
  | 'calendar'
  | 'bank'
  | 'credit-card'
  | 'receipt'
  | 'tag'
  | 'pie-chart'
  | 'alert-circle'
  | 'mail'
  | 'shield'
  | 'zap'
  | 'activity'
  | 'repeat'
  | 'dollar-sign'
  | 'settings'
  | 'file-text'
  | 'user'
  | 'bell'
  | 'flag'
  | 'clock'
  | 'info';

/** Props for the TransactionSection component */
export interface TransactionSectionProps {
  /** The title of the section */
  title: string;

  /** The icon to display next to the section title */
  iconType: SectionIconType;

  /** Whether the section should be open by default */
  defaultOpen?: boolean;

  /** The content to display within the section */
  children: React.ReactNode;

  /** Additional class names to apply to the section */
  className?: string;

  /** Optional badge count to display next to section title */
  badgeCount?: number;
}

/**
 * A modern, visually appealing collapsible section component with animations
 * for displaying grouped information in transaction details.
 */
export function TransactionSection({
  title,
  iconType,
  defaultOpen = true,
  children,
  className,
  badgeCount,
}: TransactionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Icon variations with different colors for different section types
  const iconVariants = cva('h-5 w-5 shrink-0', {
    variants: {
      variant: {
        calendar: 'text-blue-500',
        bank: 'text-emerald-500',
        'credit-card': 'text-indigo-500',
        receipt: 'text-amber-500',
        tag: 'text-purple-500',
        'pie-chart': 'text-pink-500',
        'alert-circle': 'text-red-500',
        mail: 'text-sky-500',
        shield: 'text-teal-500',
        zap: 'text-yellow-500',
        activity: 'text-orange-500',
        repeat: 'text-violet-500',
        'dollar-sign': 'text-lime-500',
        settings: 'text-gray-500',
        'file-text': 'text-blue-400',
        user: 'text-indigo-400',
        bell: 'text-amber-400',
        flag: 'text-rose-500',
        clock: 'text-cyan-500',
        info: 'text-gray-400',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  });

  // Map icon type to the appropriate Lucide icon component
  const getIconComponent = (type: SectionIconType) => {
    const iconMap: Record<SectionIconType, React.ReactNode> = {
      calendar: (
        <Icons.Calendar className={iconVariants({ variant: 'calendar' })} />
      ),
      bank: <Icons.Building2 className={iconVariants({ variant: 'bank' })} />,
      'credit-card': (
        <Icons.CreditCard
          className={iconVariants({ variant: 'credit-card' })}
        />
      ),
      receipt: (
        <Icons.Receipt className={iconVariants({ variant: 'receipt' })} />
      ),
      tag: <Icons.Tag className={iconVariants({ variant: 'tag' })} />,
      'pie-chart': (
        <Icons.PieChart className={iconVariants({ variant: 'pie-chart' })} />
      ),
      'alert-circle': (
        <Icons.AlertCircle
          className={iconVariants({ variant: 'alert-circle' })}
        />
      ),
      mail: <Icons.Mail className={iconVariants({ variant: 'mail' })} />,
      shield: <Icons.Shield className={iconVariants({ variant: 'shield' })} />,
      zap: <Icons.Zap className={iconVariants({ variant: 'zap' })} />,
      activity: (
        <Icons.Activity className={iconVariants({ variant: 'activity' })} />
      ),
      repeat: <Icons.Repeat className={iconVariants({ variant: 'repeat' })} />,
      'dollar-sign': (
        <Icons.DollarSign
          className={iconVariants({ variant: 'dollar-sign' })}
        />
      ),
      settings: (
        <Icons.Settings className={iconVariants({ variant: 'settings' })} />
      ),
      'file-text': (
        <Icons.FileText className={iconVariants({ variant: 'file-text' })} />
      ),
      user: <Icons.User className={iconVariants({ variant: 'user' })} />,
      bell: <Icons.Bell className={iconVariants({ variant: 'bell' })} />,
      flag: <Icons.Flag className={iconVariants({ variant: 'flag' })} />,
      clock: <Icons.Clock className={iconVariants({ variant: 'clock' })} />,
      info: <Icons.Info className={iconVariants({ variant: 'info' })} />,
    };

    return iconMap[type];
  };

  return (
    <div
      className={cn(
        'mb-4 overflow-hidden rounded-lg border-4 border-gray-50 bg-white shadow-sm transition-all duration-200',
        isOpen ? 'shadow-md' : '',
        className
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          {getIconComponent(iconType)}
          <span className="text-sm font-medium text-gray-800">{title}</span>
          {badgeCount !== undefined && (
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {badgeCount}
            </span>
          )}
        </div>
        <div className="text-gray-400">
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="border-t border-gray-100 px-4 py-3">{children}</div>
      </div>
    </div>
  );
}
