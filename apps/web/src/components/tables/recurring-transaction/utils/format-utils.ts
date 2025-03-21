import { format, isValid, parseISO } from 'date-fns';

/**
 * Formats a date string or Date object into a human-readable date format.
 *
 * @example
 *   ```tsx
 *   formatDate('2023-01-15'); // 'Jan 15, 2023'
 *   formatDate(new Date(2023, 0, 15)); // 'Jan 15, 2023'
 *   formatDate(null); // '-'
 *   ```;
 *
 * @param dateString - The date to format, which can be a string, Date object,
 *   null, or undefined
 * @returns A formatted date string in the format 'MMM dd, yyyy' or '-' if the
 *   date is invalid
 */
export const formatDate = (dateString?: string | Date | null): string => {
  if (!dateString) return '-';
  try {
    const date =
      typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, 'MMM dd, yyyy') : '-';
  } catch (e) {
    return '-';
  }
};

/**
 * Formats a date string or Date object into a human-readable date and time
 * format.
 *
 * @example
 *   ```tsx
 *   formatDateTime('2023-01-15T14:30:00'); // 'Jan 15, 2023 14:30:00'
 *   formatDateTime(new Date(2023, 0, 15, 14, 30)); // 'Jan 15, 2023 14:30:00'
 *   ```;
 *
 * @param dateString - The date to format, which can be a string, Date object,
 *   null, or undefined
 * @returns A formatted date string in the format 'MMM dd, yyyy HH:mm:ss' or '-'
 *   if the date is invalid
 */
export const formatDateTime = (dateString?: string | Date | null): string => {
  if (!dateString) return '-';
  try {
    const date =
      typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, 'MMM dd, yyyy HH:mm:ss') : '-';
  } catch (e) {
    return '-';
  }
};

/**
 * Formats a number into a localized currency string.
 *
 * @example
 *   ```tsx
 *   formatCurrency(12.99); // '$12.99'
 *   formatCurrency(12.99, 'EUR'); // '€12.99'
 *   formatCurrency(null); // '-'
 *   ```;
 *
 * @param amount - The amount to format
 * @param currency - The currency code to use for formatting (default: 'USD')
 * @returns A formatted currency string or '-' if the amount is null or
 *   undefined
 */
export const formatCurrency = (
  amount?: number | null,
  currency: string = 'USD'
): string => {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Formats a recurring transaction frequency into a human-readable string.
 *
 * @example
 *   ```tsx
 *   formatFrequency('WEEKLY'); // 'Weekly'
 *   formatFrequency('WEEKLY', 2); // 'Every 2 weeks'
 *   formatFrequency('MONTHLY'); // 'Monthly'
 *   ```;
 *
 * @param frequency - The frequency identifier (e.g., 'WEEKLY', 'MONTHLY')
 * @param interval - The interval between occurrences (default: 1)
 * @returns A formatted frequency string or '-' if the frequency is not provided
 */
export const formatFrequency = (
  frequency?: string,
  interval: number = 1
): string => {
  if (!frequency) return '-';

  const frequencyMap: Record<string, string> = {
    WEEKLY: interval === 1 ? 'Weekly' : `Every ${interval} weeks`,
    BIWEEKLY: 'Every 2 weeks',
    MONTHLY: interval === 1 ? 'Monthly' : `Every ${interval} months`,
    SEMI_MONTHLY: 'Twice a month',
    ANNUALLY: interval === 1 ? 'Annually' : `Every ${interval} years`,
    IRREGULAR: 'Irregular',
    UNKNOWN: 'Unknown',
  };

  return frequencyMap[frequency] || frequency.toLowerCase();
};

/**
 * Formats a transaction status into a standardized format.
 *
 * @example
 *   ```tsx
 *   formatStatus('active'); // 'ACTIVE'
 *   formatStatus(); // 'UNKNOWN'
 *   ```;
 *
 * @param status - The status string to format
 * @returns The formatted status string in uppercase or 'UNKNOWN' if not
 *   provided
 */
export const formatStatus = (status?: string): string => {
  if (!status) return 'UNKNOWN';
  return status.toUpperCase();
};
