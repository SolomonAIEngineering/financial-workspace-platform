"use client";

import { BaseChartSchema, TimelineChartSchema } from "./core/schema";
import { Card, CardContent, CardHeader } from "../../primitives/card";
import { LEVELS, getLevelColor } from "./core/constants";
import React, { useMemo } from "react";

import { cn } from "../../lib/utils";
import { format } from "date-fns";

/**
 * Props for the TimelineChart component
 */
export interface TimelineChartProps {
    /**
     * Data for the timeline chart
     */
    data: BaseChartSchema[];

    /**
     * Title for the chart
     * @default "Timeline"
     */
    title?: string;

    /**
     * Height of the chart
     * @default "180px"
     */
    height?: string;

    /**
     * Optional class name for the component
     */
    className?: string;
}

/**
 * Format a timestamp for display on the chart
 */
function formatTimestamp(timestamp: number): string {
    return format(new Date(timestamp), "HH:mm:ss");
}

/**
 * Calculate the maximum count value across all data points and levels
 */
function calculateMaxCount(data: BaseChartSchema[]): number {
    let max = 0;

    data.forEach((item) => {
        // Sum all level counts for this timestamp
        const sum = LEVELS.reduce((acc, level) => {
            return acc + (item[level] || 0);
        }, 0);

        max = Math.max(max, sum);
    });

    return max;
}

/**
 * Calculate the y-axis position for a value
 */
function calculateYPosition(value: number, max: number, height: number): number {
    if (max === 0) return 0;
    const percentage = value / max;
    return height - percentage * height;
}

/**
 * Calculate the x-axis position for a data point
 */
function calculateXPosition(index: number, totalPoints: number, width: number): number {
    if (totalPoints <= 1) return 0;
    return (index / (totalPoints - 1)) * width;
}

/**
 * TimelineChart component for visualizing time-based data
 * 
 * @example
 * ```tsx
 * <TimelineChart data={chartData} height="200px" />
 * ```
 */
export function TimelineChart({
    data,
    title = "Timeline",
    height = "180px",
    className,
}: TimelineChartProps) {
    // Skip rendering if no data
    if (!data || data.length === 0) {
        return (
            <Card className={cn("overflow-hidden", className)}>
                <CardHeader className="py-2">
                    <h4 className="text-sm font-medium">{title}</h4>
                </CardHeader>
                <CardContent className="px-2 py-0">
                    <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                        No data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Sort data by timestamp
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => a.timestamp - b.timestamp);
    }, [data]);

    const maxCount = useMemo(() => calculateMaxCount(sortedData), [sortedData]);

    // Calculate actual height based on provided height prop
    const chartHeight = parseInt(height, 10) || 180;
    const chartWidth = 1000; // This will be scaled by SVG's viewBox

    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="py-2">
                <h4 className="text-sm font-medium">{title}</h4>
            </CardHeader>
            <CardContent className="px-0 pt-0 pb-2">
                <div className="relative" style={{ height }}>
                    <svg
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        preserveAspectRatio="none"
                        className="overflow-visible"
                    >
                        {/* Background grid lines */}
                        {Array.from({ length: 5 }).map((_, i) => {
                            const y = (i + 1) * (chartHeight / 5);
                            return (
                                <line
                                    key={`grid-${i}`}
                                    x1="0"
                                    y1={y}
                                    x2={chartWidth}
                                    y2={y}
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    className="text-muted-foreground/20"
                                />
                            );
                        })}

                        {/* Level areas */}
                        {LEVELS.map((level, levelIndex) => {
                            const { bg } = getLevelColor(level);

                            // Calculate points for this level
                            const points: string[] = [];

                            // Start at the bottom
                            points.push(`0,${chartHeight}`);

                            // Add points for each data point
                            sortedData.forEach((item, dataIndex) => {
                                const levelValues = LEVELS.slice(0, levelIndex + 1);
                                const cumulativeValue = levelValues.reduce((acc, lev) => acc + (item[lev] || 0), 0);
                                const previousLevelsValue = levelValues.slice(0, -1).reduce((acc, lev) => acc + (item[lev] || 0), 0);

                                const x = calculateXPosition(dataIndex, sortedData.length, chartWidth);
                                const yBottom = calculateYPosition(previousLevelsValue, maxCount, chartHeight);
                                const yTop = calculateYPosition(cumulativeValue, maxCount, chartHeight);

                                points.push(`${x},${yTop}`);
                            });

                            // Add the last point at the bottom right
                            points.push(`${chartWidth},${chartHeight}`);

                            return (
                                <polygon
                                    key={`area-${level}`}
                                    points={points.join(" ")}
                                    fill={`hsl(var(--${bg.replace('bg-', '')}))`}
                                    fillOpacity="0.2"
                                    stroke={`hsl(var(--${bg.replace('bg-', '')}))`}
                                    strokeWidth="1"
                                />
                            );
                        })}

                        {/* X axis */}
                        <line
                            x1="0"
                            y1={chartHeight}
                            x2={chartWidth}
                            y2={chartHeight}
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-muted-foreground/50"
                        />

                        {/* Timestamps (only show a few to avoid overcrowding) */}
                        {sortedData.filter((_, i) => i % Math.max(1, Math.floor(sortedData.length / 5)) === 0).map((item, i) => (
                            <g key={`time-${i}`} transform={`translate(${calculateXPosition(
                                sortedData.indexOf(item),
                                sortedData.length,
                                chartWidth
                            )}, ${chartHeight + 15})`}>
                                <text
                                    fontSize="10"
                                    textAnchor="middle"
                                    className="text-muted-foreground fill-muted-foreground text-[10px]"
                                >
                                    {formatTimestamp(item.timestamp)}
                                </text>
                            </g>
                        ))}
                    </svg>

                    {/* Legend */}
                    <div className="absolute bottom-0 right-2 flex gap-2 p-2 bg-background/80 rounded text-xs">
                        {LEVELS.map((level) => {
                            const { bg, text } = getLevelColor(level);
                            return (
                                <div key={level} className="flex items-center gap-1">
                                    <div className={cn("h-2 w-2 rounded-full", bg)} />
                                    <span className={cn(text)}>{level}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 