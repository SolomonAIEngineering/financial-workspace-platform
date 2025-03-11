import { z } from 'zod'

/**
 * Common parameters schema for business metrics queries.
 *
 * This schema defines the standard parameters used across all business metrics-related
 * query functions. It provides a consistent interface for filtering and analyzing
 * business performance data.
 *
 * Business metrics queries focus on aggregated financial data and key performance indicators
 * that provide insights into business health and performance. These parameters allow for
 * specifying the time range and scope of the analysis.
 *
 * Unlike transaction queries, business metrics queries require a team ID rather than a user ID,
 * as they typically analyze data at the business/team level rather than individual user level.
 *
 * @property teamId - Required. The unique identifier of the team/business to analyze
 * @property start - Unix timestamp in milliseconds for the start date of the query range (defaults to 12 months ago)
 * @property end - Unix timestamp in milliseconds for the end date of the query range (defaults to current time)
 * @property limit - Maximum number of time periods to return (defaults to 12, typically representing 12 months)
 */
export const businessParams = z.object({
  teamId: z.string(),
  start: z.number().default(() => {
    // Default to 12 months ago
    const date = new Date()
    date.setMonth(date.getMonth() - 12)
    return date.getTime()
  }),
  end: z.number().default(() => Date.now()),
  limit: z.number().optional().default(12),
})
