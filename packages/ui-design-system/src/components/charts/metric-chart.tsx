import * as Plot from '@observablehq/plot'

import {
    MetricMarksResolver,
    defaultMetricMarks,
    getTicks,
} from './utils'
import { ParsedMetricPeriod, SchemasType } from './types'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface MetricChartProps {
    data: ParsedMetricPeriod[]
    interval: SchemasType['TimeInterval']
    metric: SchemasType['Metric']
    height?: number
    maxTicks?: number
    onDataIndexHover?: (index: number | undefined) => void
    marks?: MetricMarksResolver
}

const MetricChart: React.FC<MetricChartProps> = ({
    data,
    interval,
    metric,
    height: _height,
    maxTicks: _maxTicks,
    onDataIndexHover,
    marks = defaultMetricMarks,
}) => {
    const [width, setWidth] = useState(0)
    const height = useMemo(() => _height || 150, [_height])
    const maxTicks = useMemo(() => _maxTicks || 10, [_maxTicks])

    const timestamps = useMemo(
        () => data.map(({ Timestamp }) => new Date(Timestamp)),
        [data],
    )
    const ticks = useMemo(
        () => getTicks(timestamps, maxTicks),
        [timestamps, maxTicks],
    )

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
            width,
            height,
            y: {
                grid: true,
            },
            marks: marks({
                data,
                metric,
                interval,
                onDataIndexHover,
                ticks,
            }),
        })
        containerRef.append(plot)

        return () => plot.remove()
    }, [
        data,
        metric,
        containerRef,
        interval,
        ticks,
        width,
        height,
        onDataIndexHover,
        marks,
    ])

    return (
        <div
            className="dark:text-polar-500 w-full text-gray-500"
            ref={setContainerRef}
            onMouseLeave={onMouseLeave}
        />
    )
}

export default MetricChart