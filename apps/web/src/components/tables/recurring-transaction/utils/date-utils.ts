import { addDays, addMonths, addWeeks } from 'date-fns';

/**
 * Calculates future execution dates for a recurring transaction based on frequency.
 * 
 * This utility function is used to predict when future transactions will occur
 * based on the frequency settings of a recurring transaction.
 *
 * @param frequency - The transaction frequency identifier (e.g., 'WEEKLY', 'MONTHLY')
 * @param interval - The interval between executions (default: 1)
 * @param baseDate - The starting date for calculations
 * @param count - Number of future dates to calculate (default: 5)
 * @returns An array of future execution dates
 * 
 * @example
 * ```tsx
 * // Get the next 3 monthly execution dates
 * const nextDates = getNextExecutionDates('MONTHLY', 1, new Date(), 3);
 * 
 * // Get the next 2 bi-weekly execution dates
 * const nextBiweeklyDates = getNextExecutionDates('BIWEEKLY', 1, new Date(), 2);
 * ```
 */
export function getNextExecutionDates(
    frequency: string,
    interval: number,
    baseDate: Date,
    count: number = 5
): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(baseDate);

    for (let i = 0; i < count; i++) {
        // Calculate next date based on frequency
        switch (frequency) {
            case 'WEEKLY':
                currentDate = addWeeks(currentDate, interval);
                break;
            case 'BIWEEKLY':
                currentDate = addWeeks(currentDate, 2 * interval);
                break;
            case 'MONTHLY':
                currentDate = addMonths(currentDate, interval);
                break;
            case 'SEMI_MONTHLY':
                currentDate = addDays(currentDate, 15 * interval);
                break;
            case 'ANNUALLY':
                currentDate = addMonths(currentDate, 12 * interval);
                break;
            default:
                currentDate = addMonths(currentDate, interval);
        }

        dates.push(new Date(currentDate));
    }

    return dates;
} 