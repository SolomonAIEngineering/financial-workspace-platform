import { format, subDays } from 'date-fns';

/**
 * Formats a JavaScript Date object into a string format required by Plaid API.
 *
 * The Plaid API requires dates in the 'YYYY-MM-DD' format for various
 * endpoints, such as transaction sync, account balance queries, and investment
 * holdings.
 *
 * @example
 *   ```typescript
 *   // Format the current date for Plaid API
 *   const today = new Date();
 *   const formattedDate = formatDateForPlaid(today);
 *   // Result: '2025-04-15' (if today is April 15, 2025)
 *
 *   // Use in Plaid API calls
 *   const params = {
 *     start_date: formatDateForPlaid(startDate),
 *     end_date: formatDateForPlaid(endDate),
 *   };
 *   ```;
 *
 * @param date - The JavaScript Date object to format
 * @returns A string in the format 'YYYY-MM-DD'
 */
export function formatDateForPlaid(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Calculates a date range for transaction synchronization with financial APIs.
 *
 * This utility function generates a start and end date range for retrieving
 * transactions from financial services like Plaid. By default, it calculates a
 * range covering the last 30 days up to the current date, but this can be
 * customized by providing a different number of days.
 *
 * @example
 *   ```typescript
 *   // Get default 30-day range
 *   const defaultRange = getTransactionDateRange();
 *   // Result: { startDate: '2025-03-16', endDate: '2025-04-15' } (if today is April 15, 2025)
 *
 *   // Get transactions for the last 7 days
 *   const weekRange = getTransactionDateRange(7);
 *   // Result: { startDate: '2025-04-08', endDate: '2025-04-15' } (if today is April 15, 2025)
 *
 *   // Use in API calls
 *   const { startDate, endDate } = getTransactionDateRange();
 *   const response = await plaidClient.transactionsGet({
 *     access_token: accessToken,
 *     start_date: startDate,
 *     end_date: endDate,
 *   });
 *   ```;
 *
 * @param days - Number of days to look back from today (default: 30)
 * @returns An object containing formatted startDate and endDate strings
 */
export function getTransactionDateRange(days = 30): {
  endDate: string;
  startDate: string;
} {
  const endDate = new Date();
  const startDate = subDays(endDate, days);

  return {
    endDate: formatDateForPlaid(endDate),
    startDate: formatDateForPlaid(startDate),
  };
}

/**
 * Splits an array into smaller arrays of specified size.
 *
 * This utility helps with batch processing of large datasets, which is useful
 * for API rate limiting, memory optimization, or parallel processing.
 *
 * @typeParam T - The type of elements in the array
 * @param array - The source array to split into chunks
 * @param size - The maximum size of each chunk
 * @returns An array of arrays, each containing at most `size` elements
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunked: T[][] = [];
  let index = 0;

  while (index < array.length) {
    chunked.push(array.slice(index, index + size));
    index += size;
  }

  return chunked;
}
