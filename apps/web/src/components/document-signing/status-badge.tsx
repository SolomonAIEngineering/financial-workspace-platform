'use client';

import {
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@udecode/cn';

import type { SigningStatus } from './types';

interface StatusBadgeProps {
  status: SigningStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    expired: {
      bgColor: 'bg-zinc-100 dark:bg-zinc-800/40',
      borderColor: 'border-zinc-200 dark:border-zinc-700',
      icon: XCircleIcon,
      label: 'Expired',
      textColor: 'text-zinc-700 dark:text-zinc-400',
    },
    pending: {
      bgColor: 'bg-amber-100 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800/30',
      icon: ClockIcon,
      label: 'Pending',
      textColor: 'text-amber-700 dark:text-amber-400',
    },
    rejected: {
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800/30',
      icon: XCircleIcon,
      label: 'Rejected',
      textColor: 'text-red-700 dark:text-red-400',
    },
    signed: {
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800/30',
      icon: CheckCircleIcon,
      label: 'Signed',
      textColor: 'text-green-700 dark:text-green-400',
    },
    viewed: {
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800/30',
      icon: EyeIcon,
      label: 'Viewed',
      textColor: 'text-blue-700 dark:text-blue-400',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
        config.bgColor,
        config.textColor,
        config.borderColor
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </div>
  );
}
