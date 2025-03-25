import { z } from 'zod'

const ZodMetric = z.object({
    Metric: z.string(),
    TimeInterval: z.string(),
})

export type Metric = z.infer<typeof ZodMetric>

const ZodMetricData = z.object({
    Metric: z.string(),
    TimeInterval: z.string(),
    Data: z.array(z.number()),
})

export type MetricData = z.infer<typeof ZodMetricData>

export const ZodParsedMetricPeriod = z.object({
    MetricPeriod: z.string(),
    Timestamp: z.string(),
})

export type ParsedMetricPeriod = z.infer<typeof ZodParsedMetricPeriod>

// New schemas to replace the ones from @polar-sh/client
export const ZodMetricType = z.enum(['currency', 'scalar'])

export const ZodClientMetric = z.object({
    slug: z.string(),
    type: ZodMetricType,
})

export const ZodTimeInterval = z.enum(['hour', 'day', 'week', 'month', 'year'])

export const ZodMetrics = z.record(z.string(), z.any())

// Create a schemas object that mimics the @polar-sh/client structure
export const schemas = {
    Metric: {} as z.infer<typeof ZodClientMetric>,
    TimeInterval: 'day' as z.infer<typeof ZodTimeInterval>,
    Metrics: {} as z.infer<typeof ZodMetrics>
}

// Export the schema types for use in other files
export type SchemasType = {
    Metric: z.infer<typeof ZodClientMetric>;
    TimeInterval: z.infer<typeof ZodTimeInterval>;
    Metrics: z.infer<typeof ZodMetrics>;
}

