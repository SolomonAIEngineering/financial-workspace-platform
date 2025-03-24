import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge class names with Tailwind CSS
 *
 * This combines clsx for conditional classes with tailwind-merge to properly
 * handle Tailwind CSS class conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string or Date object into a readable format
 *
 * @param dateInput - Date string or Date object
 * @param options - Date formatting options
 * @returns Formatted date string
 */
export function formatDate(
  dateInput: string | Date,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Returns the initials of a given string
 *
 * @param value - The string to get initials from
 * @returns The initials of the string
 */
export function getInitials(value: string) {
  const formatted = value.toUpperCase().replace(/[\s.-]/g, '');

  if (formatted.split(' ').length > 1) {
    return `${formatted.charAt(0)}${formatted.charAt(1)}`;
  }

  if (value.length > 1) {
    return formatted.charAt(0) + formatted.charAt(1);
  }

  return formatted.charAt(0);
}

/**
 * Formats an amount into a currency string
 *
 * @param currency - The currency code
 * @param amount - The amount to format
 * @param locale - The locale to format the amount in
 * @param maximumFractionDigits - The maximum number of fraction digits
 * @param minimumFractionDigits - The minimum number of fraction digits
 * @returns The formatted amount
 */
type FormatAmountParams = {
  currency: string;
  amount: number;
  locale?: string;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
};

/**
 * Formats an amount into a currency string
 *
 * @param currency - The currency code
 * @param amount - The amount to format
 * @param locale - The locale to format the amount in
 * @param maximumFractionDigits - The maximum number of fraction digits
 * @param minimumFractionDigits - The minimum number of fraction digits
 * @returns The formatted amount
 */
export function formatAmount({
  currency,
  amount,
  locale = 'en-US',
  minimumFractionDigits,
  maximumFractionDigits,
}: FormatAmountParams) {
  if (!currency) {
    return;
  }

  return Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}
