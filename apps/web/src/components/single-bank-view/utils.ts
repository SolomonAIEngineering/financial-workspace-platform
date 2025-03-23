import { ChartData, MonthlyStats, Transaction } from './types';

// Add CSS to hide scrollbars
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

// Process transaction data for the chart
export function prepareChartData(transactions: Transaction[]): ChartData {
    if (!transactions.length) return { labels: [], values: [] };

    // For demonstration, we'll create daily aggregated data for the last 31 days
    const today = new Date();
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(today.getDate() - 30);

    // Create a map for each day
    const dailyData: Record<string, number> = {};

    // Initialize each day with 0
    for (let i = 0; i <= 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        dailyData[dateKey] = 0;
    }

    // Sum transaction amounts by day
    transactions
        .filter(tx => new Date(tx.date) >= thirtyOneDaysAgo)
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

// Format a date to display format
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

// Calculate total spending, income, and balance this month
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