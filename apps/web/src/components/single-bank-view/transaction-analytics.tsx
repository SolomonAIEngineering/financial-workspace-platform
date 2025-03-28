import {
  ChartType,
  DateRangeType,
  MonthlyStats as MonthlyStatsType,
} from './types';

import { Button } from '@/registry/default/potion-ui/button';

interface TransactionAnalyticsProps {
  stats: MonthlyStatsType;
  dateRange: DateRangeType;
  setDateRange: (range: DateRangeType) => void;
  activeChartType: ChartType;
  setActiveChartType: (type: ChartType) => void;
}

export function TransactionAnalytics({
  stats,
  dateRange,
  setDateRange,
  activeChartType,
  setActiveChartType,
}: TransactionAnalyticsProps) {
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-indigo-950 dark:text-white">
          Transaction Analytics
        </h2>
        <div className="flex space-x-2">
          <Button
            variant={dateRange === '7d' ? 'default' : 'outline'}
            className="h-8 text-xs"
            onClick={() => setDateRange('7d')}
          >
            7D
          </Button>
          <Button
            variant={dateRange === '30d' ? 'default' : 'outline'}
            className="h-8 text-xs"
            onClick={() => setDateRange('30d')}
          >
            30D
          </Button>
          <Button
            variant={dateRange === '90d' ? 'default' : 'outline'}
            className="h-8 text-xs"
            onClick={() => setDateRange('90d')}
          >
            90D
          </Button>
          <Button
            variant={dateRange === 'ytd' ? 'default' : 'outline'}
            className="h-8 text-xs"
            onClick={() => setDateRange('ytd')}
          >
            YTD
          </Button>
        </div>
      </div>

      {/* Stats Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-4xl font-semibold text-indigo-950 dark:text-white">
            {stats.spending}
          </h3>
          <div className="flex items-center">
            <span
              className={`inline-flex items-center text-sm font-medium ${
                stats.percentChange >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              <svg
                className="mr-1 h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d={
                    stats.percentChange >= 0
                      ? 'M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z'
                      : 'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                  }
                  clipRule="evenodd"
                />
              </svg>
              {Math.abs(stats.percentChange)}% from last month
            </span>
          </div>
        </div>
        <div className="text-gray-600 dark:text-gray-300">
          <p className="text-sm">This Month's Spending</p>
        </div>
      </div>

      {/* Chart Selector */}
      <div className="mb-8 flex space-x-4">
        <button
          className={`rounded-lg px-4 py-2 ${
            activeChartType === 'bar'
              ? 'bg-white font-medium text-indigo-800 shadow-sm dark:bg-gray-700 dark:text-indigo-300'
              : 'text-gray-600 dark:text-gray-300'
          }`}
          onClick={() => setActiveChartType('bar')}
        >
          Bar Chart
        </button>
        <button
          className={`rounded-lg px-4 py-2 ${
            activeChartType === 'line'
              ? 'bg-white font-medium text-indigo-800 shadow-sm dark:bg-gray-700 dark:text-indigo-300'
              : 'text-gray-600 dark:text-gray-300'
          }`}
          onClick={() => setActiveChartType('line')}
        >
          Line Chart
        </button>
        <button
          className={`rounded-lg px-4 py-2 ${
            activeChartType === 'sphere'
              ? 'bg-white font-medium text-indigo-800 shadow-sm dark:bg-gray-700 dark:text-indigo-300'
              : 'text-gray-600 dark:text-gray-300'
          }`}
          onClick={() => setActiveChartType('sphere')}
        >
          AI Sphere
        </button>
      </div>
    </>
  );
}
