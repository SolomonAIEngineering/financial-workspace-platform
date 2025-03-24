import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  PauseCircle,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';

import { Card } from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import { cn } from '@/lib/utils';
import { formatAmount } from '../utils/transaction-formatters';
import { getStatusBadgeType } from '../utils/transaction-formatters';
import { motion } from 'framer-motion';

/** Props for the TransactionHeader component */
export interface TransactionHeaderProps {
  /** Unique identifier for the transaction */
  id: string;

  /** Transaction amount */
  amount: number;

  /** Currency code */
  currency: string;

  /** Transaction status */
  status: string;

  /** Transaction type */
  type: string;

  /** Merchant name */
  merchantName?: string;

  /** Transaction description */
  description?: string;

  /** Next execution date */
  nextExecutionDate?: string | Date | null;

  /** Transaction importance level */
  importance?: string;

  /** Transaction frequency */
  frequency?: string;
}

/**
 * A modern, visually appealing header component for displaying key recurring
 * transaction information
 */
export function TransactionHeader({
  id,
  amount,
  currency,
  status,
  type,
  merchantName,
  description,
  nextExecutionDate,
  importance,
  frequency,
}: TransactionHeaderProps) {
  const [showDetails, setShowDetails] = useState(true);

  // Get status icon based on transaction status - all using blue colors
  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
      case 'paused':
        return <PauseCircle className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-foreground" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-400" />;
      default:
        return <Clock className="h-5 w-5 text-blue-300" />;
    }
  };

  // Format next execution date if provided
  const formattedNextDate = nextExecutionDate
    ? typeof nextExecutionDate === 'string'
      ? format(parseISO(nextExecutionDate), 'MMM d, yyyy')
      : format(nextExecutionDate, 'MMM d, yyyy')
    : 'Not scheduled';

  // Days left calculation
  const daysLeft = nextExecutionDate
    ? Math.max(
      0,
      Math.ceil(
        (new Date(nextExecutionDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
      )
    )
    : null;

  // Determine color for status indicator - all using blue colors
  const statusColors: Record<string, string> = {
    active: 'bg-blue-600',
    pending: 'bg-blue-400',
    cancelled: 'bg-blue-800',
    paused: 'bg-blue-500',
    failed: 'bg-blue-700',
  };

  const statusBgColors: Record<string, string> = {
    active: 'from-blue-50 to-blue-25',
    pending: 'from-blue-50 to-white',
    cancelled: 'from-blue-100 to-blue-50',
    paused: 'from-blue-75 to-blue-25',
    failed: 'from-blue-100 to-blue-50',
  };

  const statusColor = statusColors[status.toLowerCase()] || 'bg-blue-300';
  const statusBg =
    statusBgColors[status.toLowerCase()] || 'from-blue-50 to-white';

  // Determine importance styling - all blue variations
  const importanceStyles: Record<string, string> = {
    LOW: 'bg-blue-50 text-blue-600 border-blue-200',
    MEDIUM: 'bg-blue-100 text-foreground border-blue-200',
    HIGH: 'bg-blue-200 text-blue-800 border-blue-300',
    CRITICAL: 'bg-blue-300 text-blue-900 border-blue-400',
  };

  const importanceStyle =
    importanceStyles[importance || 'MEDIUM'] || importanceStyles.MEDIUM;

  // Render merchant icon based on first letter - using only blue
  const renderMerchantIcon = () => {
    const name = merchantName || description || 'Transaction';
    const firstLetter = name.charAt(0).toUpperCase();

    // Different blue variations
    const colors = [
      'bg-blue-100 text-foreground',
      'bg-blue-200 text-blue-800',
      'bg-blue-50 text-blue-600',
      'bg-blue-300 text-blue-900',
      'bg-blue-400 text-white',
      'bg-blue-500 text-white',
    ];

    // Use character code to pick a consistent color
    const colorIndex = name.charCodeAt(0) % colors.length;
    const backgroundClass = colors[colorIndex];

    return (
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full text-xl font-semibold',
          backgroundClass
        )}
      >
        {firstLetter}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-xl border-4 border-gray-50 bg-white shadow-sm"
    >
      {/* Top status strip */}
      <div className={cn('h-1 w-full', statusColor)} />

      {/* Main content with subtle blue gradient background based on status */}
      <div className={cn('bg-gradient-to-br', 'bg-background text-foreground')}>
        <div className="p-5">
          {/* Header Section */}
          <div className="mb-6 flex items-center gap-4">
            {renderMerchantIcon()}

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-medium text-gray-900">
                  {merchantName || description || 'Recurring Transaction'}
                </h2>
                <StatusBadge status={getStatusBadgeType(status)} size="sm" />
              </div>
              <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                <span className="font-mono text-xs">{id.slice(0, 8)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5" />
                  {frequency || 'Unknown frequency'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div
                className={cn(
                  'flex items-center gap-1 text-2xl font-semibold',
                  'text-foreground' // Use blue for all amount text
                )}
              >
                {amount < 0 ? (
                  <TrendingDown className="h-5 w-5" />
                ) : (
                  <TrendingUp className="h-5 w-5" />
                )}
                {formatAmount(Math.abs(amount), currency)}
              </div>
              <span
                className={cn(
                  'mt-2 rounded-full border px-3 py-1 text-xs font-medium',
                  importanceStyle
                )}
              >
                {importance || 'MEDIUM'} Priority
              </span>
            </div>
          </div>

          {/* Toggle button for details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full items-center justify-between border-t border-blue-100 pt-4 pb-1 text-sm font-medium text-blue-600 focus:outline-none"
          >
            <span>Transaction Details</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                showDetails ? 'rotate-180 transform' : ''
              )}
            />
          </button>

          {/* Collapsible Details Section */}
          <motion.div
            initial={false}
            animate={{
              height: showDetails ? 'auto' : 0,
              opacity: showDetails ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Info Cards Row */}
            <div className="m-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {/* Next Payment Card */}
              <Card className="rounded-lg border-4 border-gray-50 p-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-xs text-foreground">Next Payment</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formattedNextDate}
                    </p>
                    {daysLeft !== null && (
                      <p className="mt-1 flex items-center text-xs text-blue-600">
                        <Clock className="mr-1 h-3 w-3" />
                        {daysLeft === 0 ? 'Today' : `${daysLeft} days left`}
                      </p>
                    )}
                  </div>
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </Card>

              {/* Type Card */}
              <Card className="rounded-lg border-4 border-gray-50 p-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-xs text-foreground">Type</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {type || 'Unknown'}
                    </p>
                  </div>
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
              </Card>

              {/* Frequency Card */}
              <Card className="rounded-lg border-4 border-gray-50 p-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-xs text-foreground">Frequency</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {frequency || 'Unknown'}
                    </p>
                  </div>
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                </div>
              </Card>

              {/* Status Card */}
              <Card className="rounded-lg border-4 border-gray-50 p-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-xs text-foreground">Status</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {status}
                    </p>
                  </div>
                  {getStatusIcon()}
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Fix the import for lucide icons
function RefreshCw(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
