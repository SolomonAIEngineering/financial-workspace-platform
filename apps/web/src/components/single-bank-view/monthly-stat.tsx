import { MonthlyStats as MonthlyStatsType } from './types';

/**
 * Props interface for the MonthlyStats component
 * 
 * @interface MonthlyStatsProps
 * @property {MonthlyStatsType} stats - Object containing income, spending, and net change data
 */
interface MonthlyStatsProps {
    stats: MonthlyStatsType;
}

/**
 * MonthlyStats component displays a summary of monthly financial statistics
 * including income, expenses, and net change with appropriate formatting
 * 
 * @component
 * @param {MonthlyStatsProps} props - Component props
 * @returns {JSX.Element} Grid of financial stat cards with monthly summary data
 */
export function MonthlyStats({ stats }: MonthlyStatsProps) {
    return (
        <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Income</p>
                <h4 className="text-2xl font-semibold text-indigo-950 dark:text-white">{stats.income}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This month</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Expenses</p>
                <h4 className="text-2xl font-semibold text-indigo-950 dark:text-white">{stats.spending}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This month</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Net Change</p>
                <h4 className={`text-2xl font-semibold ${parseFloat(stats.netChange.replace(/[^0-9.-]+/g, '')) >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                    }`}>
                    {stats.netChange}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This month</p>
            </div>
        </div>
    );
} 