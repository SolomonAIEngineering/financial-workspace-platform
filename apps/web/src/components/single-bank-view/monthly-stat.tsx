import { MonthlyStats as MonthlyStatsType } from './types';

/**
 * Props interface for the MonthlyStats component
 *
 * @property {MonthlyStatsType} stats - Object containing income, spending, and
 *   net change data
 * @interface MonthlyStatsProps
 */
interface MonthlyStatsProps {
  stats: MonthlyStatsType;
}

/**
 * MonthlyStats component displays a summary of monthly financial statistics
 * including income, expenses, and net change with appropriate formatting
 *
 * @param {MonthlyStatsProps} props - Component props
 * @returns {JSX.Element} Grid of financial stat cards with monthly summary data
 * @component
 */
export function MonthlyStats({ stats }: MonthlyStatsProps) {
  return (
    <div className="mb-8 grid grid-cols-3 gap-4">
      <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700">
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Income</p>
        <h4 className="text-2xl font-semibold text-indigo-950 dark:text-white">
          {stats.income}
        </h4>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          This month
        </p>
      </div>
      <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700">
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          Expenses
        </p>
        <h4 className="text-2xl font-semibold text-indigo-950 dark:text-white">
          {stats.spending}
        </h4>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          This month
        </p>
      </div>
      <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700">
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          Net Change
        </p>
        <h4
          className={`text-2xl font-semibold ${
            parseFloat(stats.netChange.replace(/[^0-9.-]+/g, '')) >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {stats.netChange}
        </h4>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          This month
        </p>
      </div>
    </div>
  );
}
