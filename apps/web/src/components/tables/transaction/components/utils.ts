import { format, isValid, parseISO } from 'date-fns';

/** Format currency amount for display */
export function formatAmount(
  amount?: number,
  currency: string = 'USD'
): string {
  if (amount === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/** Format a date string or object for display */
export function formatDate(dateString?: string | Date): string {
  if (!dateString) return '-';
  try {
    const date =
      typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, 'MMM dd, yyyy HH:mm:ss') : '-';
  } catch (e) {
    return '-';
  }
}

/** Get a color for the transaction status */
export function getStatusColor(isPending: boolean): string {
  return isPending ? 'text-amber-500' : 'text-emerald-500';
}

/** Format a transaction type for display */
export function formatTransactionType(
  type?: string,
  isManual?: boolean,
  isRecurring?: boolean
): string {
  if (type) return type.replace(/_/g, ' ');
  if (isManual) return 'MANUAL';
  if (isRecurring) return 'RECURRING';
  return 'STANDARD';
}

/** Truncate an ID for display */
export function formatTruncatedId(id: string): string {
  if (!id) return '-';
  return id.length > 8 ? `${id.substring(0, 8)}...` : id;
}

/** Get the appropriate badge variant based on status */
export function getStatusBadgeType(
  status: string
): 'default' | 'success' | 'warning' | 'error' | 'info' {
  if (!status) return 'default';

  const statusLower = status.toLowerCase();
  if (statusLower.includes('complete') || statusLower.includes('success')) {
    return 'success';
  }
  if (statusLower.includes('pending') || statusLower.includes('wait')) {
    return 'warning';
  }
  if (
    statusLower.includes('fail') ||
    statusLower.includes('error') ||
    statusLower.includes('cancel')
  ) {
    return 'error';
  }

  return 'info';
}

/** Map category name to color dot */
export const categoryColors: Record<
  string,
  { dot?: string; icon?: React.ReactNode }
> = {
  // These would be populated with actual category colors and icons
};
