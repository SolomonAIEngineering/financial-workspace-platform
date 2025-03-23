import { ChartData, DateRangeType, MonthlyStats, Transaction } from './types';

/**
 * CSS to hide scrollbars across different browsers
 * Applied globally to maintain a clean UI without visible scrollbars
 * 
 * @constant
 * @type {string}
 */
export const hideScrollbarCSS = `
::-webkit-scrollbar {
    display: none;
}

html, body {
    scrollbar-width: none;
    -ms-overflow-style: none;
    height: 100%;
    overflow: hidden;
}
`;

/**
 * Processes transaction data to prepare it for chart visualization
 * Filters transactions by date range and aggregates expenses by day
 * 
 * @function
 * @param {Transaction[]} transactions - Array of transaction objects to process
 * @param {DateRangeType} [dateRange='30d'] - Time period to filter the data
 * @returns {ChartData} Object containing labels and values arrays for charts
 */
export function prepareChartData(transactions: Transaction[], dateRange: DateRangeType = '30d'): ChartData {
    if (!transactions.length) return { labels: [], values: [] };

    // Calculate date range based on selected option
    const today = new Date();
    let startDate = new Date();

    switch (dateRange) {
        case '7d':
            startDate.setDate(today.getDate() - 7);
            break;
        case '30d':
            startDate.setDate(today.getDate() - 30);
            break;
        case '90d':
            startDate.setDate(today.getDate() - 90);
            break;
        case 'ytd':
            startDate = new Date(today.getFullYear(), 0, 1); // Jan 1st of current year
            break;
        default:
            startDate.setDate(today.getDate() - 30); // Default to 30 days
    }

    // Create a map for each day
    const dailyData: Record<string, number> = {};

    // Calculate number of days in the range
    const dayDiff = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

    // Initialize each day with 0
    for (let i = 0; i <= dayDiff; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        dailyData[dateKey] = 0;
    }

    // Sum transaction amounts by day
    transactions
        .filter(tx => new Date(tx.date) >= startDate)
        .forEach(tx => {
            const dateKey = tx.date.toISOString().split('T')[0];
            if (dailyData[dateKey] !== undefined) {
                // Only count expenses (negative amounts)
                if (tx.amount < 0) {
                    dailyData[dateKey] += Math.abs(tx.amount);
                }
            }
        });

    // Convert to arrays for the chart
    const labels = Object.keys(dailyData).sort();
    const values = labels.map(date => dailyData[date]);

    return { labels, values };
}

/**
 * Formats a date string to a human-readable representation
 * 
 * @function
 * @param {string} dateString - ISO date string to format
 * @returns {string} Formatted date string (e.g., "Jan 15")
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

/**
 * Calculates monthly financial statistics based on transaction data
 * Includes spending, income, net change and percentage change
 * 
 * @function
 * @param {Transaction[]} transactions - Array of transaction objects to analyze
 * @returns {MonthlyStats} Object containing formatted financial statistics
 */
export function calculateMonthlyStats(transactions: Transaction[]): MonthlyStats {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthTransactions = transactions.filter(tx => new Date(tx.date) >= firstDayOfMonth);

    const spending = thisMonthTransactions
        .filter(tx => tx.amount < 0)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const income = thisMonthTransactions
        .filter(tx => tx.amount > 0)
        .reduce((sum, tx) => sum + tx.amount, 0);

    return {
        spending: spending.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        income: income.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        netChange: (income - spending).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        percentChange: spending > 0 ? Math.round((income - spending) / spending * 100) : 0
    };
} 