import { ChartData, ChartType } from './types';

import { Plus } from 'lucide-react';
import { formatDate } from './utils';

interface ChartVisualizationProps {
  chartData: ChartData;
  isLoading: boolean;
  activeChartType: ChartType;
}

export function ChartVisualization({
  chartData,
  isLoading,
  activeChartType,
}: ChartVisualizationProps) {
  return (
    <>
      {activeChartType === 'sphere' ? (
        /* AI Sphere Visualization */
        <div className="relative mb-8 flex h-72 items-center justify-center">
          <div className="flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-b from-sky-100 to-white shadow-lg dark:from-gray-700 dark:to-gray-800">
            <div className="relative h-40 w-40 rotate-45 transform overflow-hidden rounded-full bg-gradient-to-br from-gray-300 to-gray-100 dark:from-gray-600 dark:to-gray-400">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200/80 to-white/30 dark:from-gray-500/80 dark:to-gray-300/30"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-gray-100/10 to-white/30 dark:via-gray-400/10 dark:to-gray-200/30"></div>
            </div>
          </div>

          <button className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md dark:bg-gray-700">
            <Plus className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      ) : (
        /* Chart Visualization */
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-700">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Daily Transaction Activity
            </h3>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-600"></div>
                <div className="h-40 w-full rounded bg-gray-200 dark:bg-gray-600"></div>
              </div>
            </div>
          ) : (
            <div className="h-64">
              <div className="flex h-full flex-col">
                <div className="flex flex-grow items-end space-x-1">
                  {chartData.values
                    .slice(0, 31)
                    .reverse()
                    .map((value, i) => {
                      // Calculate height percentage (max 95%)
                      const maxValue = Math.max(...chartData.values);
                      const heightPercent =
                        maxValue > 0 ? Math.max(5, (value / maxValue) * 95) : 5;

                      return (
                        <div
                          key={i}
                          className="group flex flex-1 flex-col items-center"
                        >
                          <div className="mb-1 flex w-full justify-center">
                            <div className="absolute -mt-8 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-900">
                              ${value.toFixed(2)}
                            </div>
                          </div>

                          <div
                            className={`w-full ${activeChartType === 'bar' ? 'rounded-t-sm' : 'mx-auto w-2 rounded-full'} bg-indigo-500 transition-all duration-200 group-hover:bg-indigo-600 dark:bg-indigo-400 dark:group-hover:bg-indigo-500`}
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                        </div>
                      );
                    })}
                </div>

                <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {formatDate(chartData.labels[chartData.labels.length - 1])}
                  </span>
                  <span>
                    {formatDate(
                      chartData.labels[Math.floor(chartData.labels.length / 2)]
                    )}
                  </span>
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
