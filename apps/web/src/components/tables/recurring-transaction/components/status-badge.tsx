import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Ban,
  Pause,
  HelpCircle,
  type LucideIcon,
  AlertTriangle,
  XCircle,
  Info,
  CircleDot,
} from 'lucide-react';

/** Status types that can be represented by the StatusBadge */
export type StatusType =
  | 'active'
  | 'pending'
  | 'warning'
  | 'error'
  | 'cancelled'
  | 'paused'
  | 'completed'
  | 'unknown'
  | 'info';

// Class variance configuration for the badge
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ring-1 ring-inset',
  {
    variants: {
      variant: {
        active: 'bg-blue-100 text-blue-700 ring-blue-600/20',
        pending: 'bg-blue-50 text-blue-600 ring-blue-500/20',
        warning: 'bg-blue-50 text-blue-600 ring-blue-500/20',
        error: 'bg-blue-200 text-blue-800 ring-blue-700/20',
        cancelled: 'bg-blue-100 text-blue-700 ring-blue-600/20',
        paused: 'bg-blue-50 text-blue-600 ring-blue-500/20',
        completed: 'bg-blue-100 text-blue-700 ring-blue-600/20',
        unknown: 'bg-blue-50 text-blue-500 ring-blue-400/20',
        info: 'bg-blue-50 text-blue-500 ring-blue-400/20',
      },
      size: {
        sm: 'text-[0.65rem] px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'unknown',
      size: 'md',
    },
  }
);

// Props interface for the StatusBadge component
export interface StatusBadgeProps extends VariantProps<typeof badgeVariants> {
  /** The status to display */
  status: StatusType;

  /** Whether to show the status icon */
  showIcon?: boolean;

  /** Optional additional class names */
  className?: string;

  /** Optional custom text to display instead of the status name */
  label?: string;
}

/**
 * A modern, visually appealing badge component that displays transaction status
 * with appropriate styling and optional icons.
 */
export function StatusBadge({
  status,
  variant = status as StatusType,
  size,
  showIcon = true,
  className,
  label,
}: StatusBadgeProps) {
  // Map status types to their respective icons
  const iconMap: Record<StatusType, LucideIcon> = {
    active: CheckCircle,
    pending: Clock,
    warning: AlertCircle,
    error: AlertCircle,
    cancelled: Ban,
    paused: Pause,
    completed: CheckCircle,
    unknown: HelpCircle,
    info: Info,
  };

  // Get the appropriate icon component
  const Icon = iconMap[status];

  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{label || status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </span>
  );
}

// Replace color mapping with blue variations
const getBadgeColor = (status: StatusType): string => {
  switch (status) {
    case 'active':
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

// Replace icon colors with blue variations
const getBadgeIcon = (status: StatusType): JSX.Element => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-3.5 w-3.5 text-blue-700" />;
    case 'warning':
      return <AlertTriangle className="h-3.5 w-3.5 text-blue-600" />;
    case 'error':
      return <XCircle className="h-3.5 w-3.5 text-blue-800" />;
    case 'info':
      return <Info className="h-3.5 w-3.5 text-blue-500" />;
    default:
      return <CircleDot className="h-3.5 w-3.5 text-blue-400" />;
  }
};
