import * as Plot from '@observablehq/plot'
import * as d3 from 'd3'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { SchemasType } from './types'
import { getValueFormatter } from './utils'

const getTicks = (timestamps: Date[], maxTicks: number = 10): Date[] => {
    const step = Math.ceil(timestamps.length / maxTicks)
    return timestamps.filter((_, index) => index % step === 0)
}

const getTickFormat = (
    interval: SchemasType['TimeInterval'],
    ticks: Date[],
): ((t: Date, i: number) => any) | string => {
    switch (interval) {
        case 'hour':
            return (t: Date, i: number) => {
                const previousDate = ticks[i - 1]
                if (!previousDate || previousDate.getDate() < t.getDate()) {
                    return d3.timeFormat('%a %H:%M')(t)
                }
                return d3.timeFormat('%H:%M')(t)
            }
        case 'day':
            return '%b %d'
        case 'week':
            return '%b %d'
        case 'month':
            return '%b %y'
        case 'year':
            return '%Y'
        default:
            return '%b %d'
    }
}

interface ChartProps {
    data: {
        timestamp: Date
        value: number
    }[]
    interval: SchemasType['TimeInterval']
    metric: SchemasType['Metric']
    height?: number
    maxTicks?: number
    onDataIndexHover?: (index: number | undefined) => void
}

export const Chart: React.FC<ChartProps> = ({
    data,
    interval,
    metric,
    height: _height,
    maxTicks: _maxTicks,
    onDataIndexHover,
}) => {
    const [width, setWidth] = useState(0)
    const height = useMemo(() => _height || 300, [_height])
    const maxTicks = useMemo(() => _maxTicks || 10, [_maxTicks])

    const timestamps = useMemo(
        () => data.map(({ timestamp }) => timestamp),
        [data],
    )
    const ticks = useMemo(
        () => getTicks(timestamps, maxTicks),
        [timestamps, maxTicks],
    )
    const valueFormatter = useMemo(() => getValueFormatter(metric), [metric])

    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)

    useEffect(() => {
        const resizeObserver = new ResizeObserver((_entries) => {
            if (containerRef) {
                setWidth(containerRef.clientWidth ?? 0)
            }
        })

        if (containerRef) {
            resizeObserver.observe(containerRef)
        }

        return () => {
            if (containerRef) {
                resizeObserver.unobserve(containerRef)
            }
        }
    }, [containerRef])

    const onMouseLeave = useCallback(() => {
        if (onDataIndexHover) {
            onDataIndexHover(undefined)
        }
    }, [onDataIndexHover])

    useEffect(() => {
        if (!containerRef) {
            return
        }

        const plot = Plot.plot({
            style: {
                background: 'none',
            },
            height,
            marks: [
                Plot.axisX({
                    tickFormat: getTickFormat(interval, ticks),
                    ticks,
                    label: null,
                    stroke: 'none',
                    fontFamily: 'var(--font-geist-mono)',
                }),
                Plot.axisY({
                    label: 'Growth',
                    stroke: 'none',
                    fontFamily: 'var(--font-geist-mono)',
                }),
                Plot.lineY(data, {
                    x: 'timestamp',
                    y: metric.slug,
                    stroke: 'currentColor',
                    strokeWidth: 1,
                    marker: 'circle-fill',
                }),
                Plot.ruleX(data, {
                    x: 'timestamp',
                    stroke: 'currentColor',
                    strokeWidth: 1,
                    strokeOpacity: 0.1,
                }),
            ],
        })
        containerRef.append(plot)

        return () => plot.remove()
    }, [
        data,
        metric,
        containerRef,
        interval,
        ticks,
        valueFormatter,
        width,
        height,
        onDataIndexHover,
    ])

    return (
        <div
            className="text-polar-500 border-polar-700 w-full border p-4"
            ref={setContainerRef}
            onMouseLeave={onMouseLeave}
        />
    )
}