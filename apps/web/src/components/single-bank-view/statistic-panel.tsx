import { ChartData, ChartType, DateRangeType, MonthlyStats, Transaction } from './types';

import { ChartVisualization } from './chart-visualization';
import { MonthlyStats as MonthlyStatsComponent } from './monthly-stat';
import { TopCategories } from './top-categories';
import { TransactionAnalytics } from './transaction-analytics';

/**
 * Props interface for the StatisticsPanel component
 * 
 * @interface StatisticsPanelProps
 * @property {Transaction[]} transactions - Array of transaction data to analyze
 * @property {boolean} isLoadingTransactions - Flag indicating if transactions are still loading
 * @property {ChartType} activeChartType - Currently selected chart visualization type
 * @property {function} setActiveChartType - Function to update the active chart type
 * @property {DateRangeType} dateRange - Currently selected date range for filtering
 * @property {function} setDateRange - Function to update the date range
 * @property {ChartData} chartData - Processed data ready for chart visualization
 * @property {MonthlyStats} monthlyStats - Calculated monthly statistics from transactions
 */
interface StatisticsPanelProps {
    transactions: Transaction[];
    isLoadingTransactions: boolean;
    activeChartType: ChartType;
    setActiveChartType: (type: ChartType) => void;
    dateRange: DateRangeType;
    setDateRange: (range: DateRangeType) => void;
    chartData: ChartData;
    monthlyStats: MonthlyStats;
}

/**
 * StatisticsPanel component displays financial analytics and visualizations
 * for a bank account including charts, monthly stats and category breakdown
 * 
 * @component
 * @param {StatisticsPanelProps} props - Component props
 * @returns {JSX.Element} Panel with various financial statistics and visualizations
 */
export function StatisticsPanel({
    transactions,
    isLoadingTransactions,
    activeChartType,
    setActiveChartType,
    dateRange,
    setDateRange,
    chartData,
    monthlyStats
}: StatisticsPanelProps) {
    return (
        <div className="w-full bg-gray-100 dark:bg-gray-800 p-8 overflow-auto no-scrollbar">
            {/* Transaction Analytics Header & Controls */}
            <TransactionAnalytics
                stats={monthlyStats}
                dateRange={dateRange}
                setDateRange={setDateRange}
                activeChartType={activeChartType}
                setActiveChartType={setActiveChartType}
            />

            {/* Chart Visualization */}
            <ChartVisualization
                chartData={chartData}
                isLoading={isLoadingTransactions}
                activeChartType={activeChartType}
            />

            {/* Monthly Stats */}
            <MonthlyStatsComponent stats={monthlyStats} />

            {/* Top Categories */}
            <TopCategories
                transactions={transactions}
                isLoading={isLoadingTransactions}
            />
        </div>
    );
} 