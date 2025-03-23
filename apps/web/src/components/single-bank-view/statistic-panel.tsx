import { ChartData, ChartType, DateRangeType, MonthlyStats, Transaction } from './types';

import { ChartVisualization } from './chart-visualization';
import { MonthlyStats as MonthlyStatsComponent } from './monthly-stat';
import { TopCategories } from './top-categories';
import { TransactionAnalytics } from './transaction-analytics';

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