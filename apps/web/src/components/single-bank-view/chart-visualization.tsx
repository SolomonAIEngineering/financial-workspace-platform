import { ChartData, ChartType } from './types';

import { Plus } from 'lucide-react';
import { formatDate } from './utils';

interface ChartVisualizationProps {
    chartData: ChartData;
    isLoading: boolean;
    activeChartType: ChartType;
}

export function ChartVisualization({ chartData, isLoading, activeChartType }: ChartVisualizationProps) {
    return (
        <>
            {activeChartType === 'sphere' ? (
                /* AI Sphere Visualization */
                <div className="relative h-72 flex items-center justify-center mb-8">
                    <div className="w-48 h-48 bg-gradient-to-b from-sky-100 to-white dark:from-gray-700 dark:to-gray-800 rounded-full shadow-lg flex items-center justify-center">
                        <div className="w-40 h-40 bg-gradient-to-br from-gray-300 to-gray-100 dark:from-gray-600 dark:to-gray-400 rounded-full transform rotate-45 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-200/80 to-white/30 dark:from-gray-500/80 dark:to-gray-300/30"></div>
                            <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-gray-100/10 to-white/30 dark:via-gray-400/10 dark:to-gray-200/30"></div>
                        </div>
                    </div>

                    <button className="absolute top-2 right-2 h-8 w-8 bg-white dark:bg-gray-700 rounded-full shadow-md flex items-center justify-center">
                        <Plus className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
            ) : (
                /* Chart Visualization */
                <div className="bg-white dark:bg-gray-700 rounded-lg p-6 mb-8 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Daily Transaction Activity</h3>
                    </div>

                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-pulse space-y-4">
                                <div className="bg-gray-200 dark:bg-gray-600 h-4 w-32 rounded"></div>
                                <div className="bg-gray-200 dark:bg-gray-600 h-40 w-full rounded"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64">
                            <div className="flex flex-col h-full">
                                <div className="flex-grow flex items-end space-x-1">
                                    {chartData.values.slice(0, 31).reverse().map((value, i) => {
                                        // Calculate height percentage (max 95%)
                                        const maxValue = Math.max(...chartData.values);
                                        const heightPercent = maxValue > 0
                                            ? Math.max(5, (value / maxValue) * 95)
                                            : 5;

                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center group">
                                                <div className="w-full flex justify-center mb-1">
                                                    <div className="px-2 py-1 bg-gray-800 dark:bg-gray-900 rounded text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-8">
                                                        ${value.toFixed(2)}
                                                    </div>
                                                </div>

                                                <div
                                                    className={`w-full ${activeChartType === 'bar' ? 'rounded-t-sm' : 'rounded-full w-2 mx-auto'} 
            bg-indigo-500 dark:bg-indigo-400 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500
            transition-all duration-200`}
                                                    style={{ height: `${heightPercent}%` }}
                                                ></div>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="flex text-xs text-gray-500 dark:text-gray-400 mt-2 justify-between">
                                    <span>{formatDate(chartData.labels[chartData.labels.length - 1])}</span>
                                    <span>{formatDate(chartData.labels[Math.floor(chartData.labels.length / 2)])}</span>
                                    <span>{formatDate(chartData.labels[0])}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
} 