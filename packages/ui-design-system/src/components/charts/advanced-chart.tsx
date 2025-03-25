import * as Plot from '@observablehq/plot'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { getTickFormat, getTicks, getValueFormatter } from './utils'

export type ChartType = 'bar' | 'scatter'

interface DataPoint {
    x: number | Date
    y: number
    category?: string
}

export interface AdvancedChartProps {
    data: DataPoint[]
    type: ChartType
    height?: number
    width?: number
    maxTicks?: number
    xLabel?: string
    yLabel?: string
    color?: string | ((d: DataPoint) => string)
    onPointHover?: (point: DataPoint | null) => void
    formatX?: (value: any) => string
    formatY?: (value: number) => string
}

const AdvancedChart = ({
    data,
    type,
    height: _height = 300,
    width: _width,
    maxTicks = 10,
    xLabel,
    yLabel,
    color = 'rgb(0 98 255)',
    onPointHover,
    formatX,
    formatY,
}: AdvancedChartProps) => {
    const [containerWidth, setContainerWidth] = useState(0)
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)

    const width = _width || containerWidth
    const height = _height

    // Setup resize observer
    useEffect(() => {
        if (!containerRef) return

        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]) {
                setContainerWidth(entries[0].contentRect.width)
            }
        })

        resizeObserver.observe(containerRef)
        return () => resizeObserver.disconnect()
    }, [containerRef])

    // Determine if x-axis is temporal
    const isTemporal = useMemo(() => {
        return data.length > 0 && data[0].x instanceof Date
    }, [data])

    // Get ticks for temporal data
    const xTicks = useMemo(() => {
        if (!isTemporal) return undefined
        return getTicks(data.map(d => d.x as Date), maxTicks)
    }, [data, isTemporal, maxTicks])

    // Create marks based on chart type
    const getMarks = useCallback(() => {
        const baseMarks: Plot.Markish[] = [
            Plot.axisX({
                label: xLabel || null,
                tickFormat: isTemporal && xTicks
                    ? getTickFormat('day', xTicks)
                    : formatX,
                ticks: xTicks,
            }),
            Plot.axisY({
                label: yLabel || null,
                tickFormat: formatY || (value => value.toString()),
            }),
            Plot.gridX(),
            Plot.gridY(),
        ]

        switch (type) {
            case 'bar':
                return [
                    ...baseMarks,
                    Plot.barY(data, {
                        x: 'x',
                        y: 'y',
                        fill: typeof color === 'function' ? color : color,
                        title: (d) => `${d.x}: ${d.y}${d.category ? ` (${d.category})` : ''}`,
                    }),
                ]
            case 'scatter':
                return [
                    ...baseMarks,
                    Plot.dot(data, {
                        x: 'x',
                        y: 'y',
                        fill: typeof color === 'function' ? color : color,
                        r: 4,
                        title: (d) => `${d.x}: ${d.y}${d.category ? ` (${d.category})` : ''}`,
                    }),
                ]
            default:
                return baseMarks
        }
    }, [type, data, color, xLabel, yLabel, formatX, formatY, isTemporal, xTicks])

    // Handle hover events
    const onMouseLeave = useCallback(() => {
        if (onPointHover) {
            onPointHover(null)
        }
    }, [onPointHover])

    // Render plot
    useEffect(() => {
        if (!containerRef || !width) {
            return
        }

        try {
            const plot = Plot.plot({
                style: {
                    background: 'none',
                    color: 'currentColor',
                },
                width,
                height,
                margin: 40,
                marks: getMarks(),
            })

            containerRef.innerHTML = ''
            containerRef.append(plot)

            return () => plot.remove()
        } catch (error) {
            console.error('Error rendering plot:', error)
        }
    }, [containerRef, width, height, getMarks])

    return (
        <div
            className="w-full min-h-[300px] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 p-4"
            ref={setContainerRef}
            onMouseLeave={onMouseLeave}
        />
    )
}

export default AdvancedChart 