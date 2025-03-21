/** Utility functions for formatting transaction data for display */

/** Maps day of week number to name */
export function getDayOfWeekName(day: number): string {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[day % 7] || 'Unknown';
}

/** Maps month number to name */
export function getMonthName(month: number): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[(month - 1) % 12] || 'Unknown';
}

/** Maps frequency to human-readable text */
export function formatFrequency(
  frequency: string,
  dayOfMonth?: number,
  dayOfWeek?: number
): string {
  switch (frequency) {
    case 'DAILY':
      return 'Daily';
    case 'WEEKLY':
      return dayOfWeek !== undefined
        ? `Weekly on ${getDayOfWeekName(dayOfWeek)}`
        : 'Weekly';
    case 'BIWEEKLY':
      return 'Every two weeks';
    case 'MONTHLY':
      return dayOfMonth !== undefined
        ? `Monthly on day ${dayOfMonth}`
        : 'Monthly';
    case 'QUARTERLY':
      return 'Every 3 months';
    case 'SEMIANNUALLY':
      return 'Every 6 months';
    case 'ANNUALLY':
      return 'Yearly';
    default:
      return frequency || 'Unknown frequency';
  }
}

/** Maps transaction status to badge type */
export function getStatusBadgeType(
  status: string
):
  | 'active'
  | 'pending'
  | 'warning'
  | 'error'
  | 'cancelled'
  | 'paused'
  | 'completed'
  | 'unknown' {
  const statusMap: Record<
    string,
    | 'active'
    | 'pending'
    | 'warning'
    | 'error'
    | 'cancelled'
    | 'paused'
    | 'completed'
    | 'unknown'
  > = {
    ACTIVE: 'active',
    PENDING: 'pending',
    FAILED: 'error',
    CANCELLED: 'cancelled',
    PAUSED: 'paused',
    COMPLETED: 'completed',
  };

  return statusMap[status] || 'unknown';
}

/** Maps importance level to badge type */
export function getImportanceBadgeType(
  importance: string | undefined
): 'default' | 'success' | 'warning' | 'info' | 'error' {
  const importanceMap: Record<
    string,
    'default' | 'success' | 'warning' | 'info' | 'error'
  > = {
    LOW: 'info',
    MEDIUM: 'default',
    HIGH: 'warning',
    CRITICAL: 'error',
  };

  return importanceMap[importance || ''] || 'default';
}

/** Returns a human-readable string for the transaction importance */
export function formatImportanceLevel(importance: string | undefined): string {
  const importanceLabels: Record<string, string> = {
    LOW: 'Low Priority',
    MEDIUM: 'Medium Priority',
    HIGH: 'High Priority',
    CRITICAL: 'Critical Priority',
  };

  return importanceLabels[importance || ''] || 'Medium Priority';
}

/** Maps execution status to badge type */
export function getExecutionStatusBadgeType(
  status: string
): 'success' | 'warning' | 'info' | 'error' | 'default' {
  const statusMap: Record<
    string,
    'success' | 'warning' | 'info' | 'error' | 'default'
  > = {
    SUCCESS: 'success',
    PENDING: 'info',
    PROCESSING: 'info',
    FAILED: 'error',
    CANCELLED: 'default',
    SCHEDULED: 'warning',
  };

  return statusMap[status] || 'default';
}

/** Formats a currency amount with the specified currency code */
export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Returns a truncated ID with ellipsis */
export function formatTruncatedId(id: string, length: number = 8): string {
  if (!id) return 'N/A';
  if (id.length <= length) return id;

  return `${id.slice(0, length)}...`;
}

/** Gets a color for importance level (for styling) */
export function getImportanceColor(importance: string | undefined): string {
  const importanceColors: Record<string, string> = {
    LOW: 'bg-blue-100',
    MEDIUM: 'bg-amber-100',
    HIGH: 'bg-orange-100',
    CRITICAL: 'bg-red-100',
  };

  return importanceColors[importance || ''] || 'bg-gray-100';
}
