import { addDays, isValid, parse, subDays } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

/**
 * Adjusts a date by adding or subtracting days.
 *
 * @private
 * @param {string} date - The date to adjust in ISO format
 * @param {number} [dateAdjustment] - Number of days to adjust (positive or negative)
 * @returns {string} The adjusted date in ISO format
 */
function getAdjustedDate(date: Date | string, dateAdjustment?: number) {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (dateAdjustment) {
    return dateAdjustment > 0
      ? addDays(dateObj, Math.abs(dateAdjustment))
      : subDays(dateObj, Math.abs(dateAdjustment))
  }

  return dateObj
}

/**
 * Formats a date string into a standardized format, handling various input formats.
 *
 * @param {string} date - The input date string in any common format
 * @param {string} [timezone='America/New_York'] - The timezone to use for formatting
 * @param {number} [dateAdjustment] - Optional number of days to adjust the date by
 * @returns {string | undefined} The formatted date in 'YYYY-MM-DD' format, or undefined if parsing fails
 *
 * @example
 * ```typescript
 * // Basic date formatting
 * formatDate('15/03/2024'); // '2024-03-15'
 *
 * // With timezone
 * formatDate('2024-03-15T14:30:00', 'Europe/London'); // '2024-03-15'
 *
 * // With date adjustment
 * formatDate('2024-03-15', 'America/New_York', 1); // '2024-03-16'
 *
 * // Handles various formats
 * formatDate('15 Mar 2024'); // '2024-03-15'
 * formatDate('2024.03.15'); // '2024-03-15'
 * formatDate('03/15/2024'); // '2024-03-15'
 * ```
 */
export function formatDate(
  date: string,
  timezone = 'America/New_York',
  dateAdjustment?: number,
) {
  const formats = [
    'dd/MM/yyyy',
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'dd.MM.yyyy',
    'dd-MM-yyyy',
    'yyyy/MM/dd',
    'MM-dd-yyyy',
    'yyyy.MM.dd',
    'dd MMM yyyy',
    'MMM dd, yyyy',
    'MMMM dd, yyyy',
    "yyyy-MM-dd'T'HH:mm:ss",
    'yyyy-MM-dd HH:mm:ss',
    'dd/MM/yyyy HH:mm:ss',
    'MM/dd/yyyy HH:mm:ss',
    'yyyy/MM/dd HH:mm:ss',
    'dd.MM.yyyy HH:mm:ss',
    'dd-MM-yyyy HH:mm:ss',
    "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
    "yyyy-MM-dd'T'HH:mm:ss",
  ]

  // Try parsing with each format
  for (const format of formats) {
    const parsedDate = parse(date, format, new Date())
    if (isValid(parsedDate)) {
      const adjustedDate = getAdjustedDate(parsedDate, dateAdjustment)
      return formatInTimeZone(adjustedDate, timezone, 'yyyy-MM-dd')
    }
  }

  // Try parsing as ISO date
  if (isValid(new Date(date))) {
    const adjustedDate = getAdjustedDate(new Date(date), dateAdjustment)
    return formatInTimeZone(adjustedDate, timezone, 'yyyy-MM-dd')
  }

  // If the date includes a time, we don't need to remove the time
  const value = date.includes('T') ? date : date.replace(/[^0-9-\.\/]/g, '')

  if (isValid(new Date(value))) {
    const adjustedDate = getAdjustedDate(new Date(value), dateAdjustment)
    return formatInTimeZone(adjustedDate, timezone, 'yyyy-MM-dd')
  }

  // If all parsing attempts fail, return undefined
  return undefined
}

/**
 * Formats a string amount into a standardized number value, handling various number formats.
 *
 * @param {Object} params - The formatting parameters
 * @param {string} params.amount - The amount string to format
 * @param {boolean} [params.inverted] - Whether to invert the result (multiply by -1)
 * @returns {number} The formatted amount as a number
 */
export function formatAmountValue({
  amount,
  inverted,
}: {
  amount: string
  inverted?: boolean
}) {
  let value: number
  const normalizedAmount = amount.trim()

  // Handle negative numbers consistently
  const isNegative = normalizedAmount.startsWith('-')
  const absAmount = isNegative ? normalizedAmount.slice(1) : normalizedAmount

  // First, detect the format
  const hasComma = absAmount.includes(',')
  const hasDot = absAmount.includes('.')
  const commaIndex = absAmount.lastIndexOf(',')
  const dotIndex = absAmount.lastIndexOf('.')

  // Determine the format based on position of separators
  if (hasComma && hasDot) {
    if (commaIndex > dotIndex) {
      // European format (1.234,56)
      value = Number(absAmount.replace(/\./g, '').replace(',', '.'))
    } else {
      // US/UK format (1,234.56)
      value = Number(absAmount.replace(/,/g, ''))
    }
  } else if (hasComma) {
    // Format with only comma - treat as decimal separator
    value = Number(absAmount.replace(',', '.'))
  } else if (hasDot) {
    // Format with only dot - treat as decimal separator
    value = Number(absAmount)
  } else {
    // Plain integer
    value = Number(absAmount)
  }

  // Handle invalid numbers
  if (isNaN(value)) {
    throw new Error(`Invalid number format: ${amount}`)
  }

  // Apply negative if original was negative
  if (isNegative) {
    value = -value
  }

  // Apply inversion if requested
  return inverted ? -value : value
}
