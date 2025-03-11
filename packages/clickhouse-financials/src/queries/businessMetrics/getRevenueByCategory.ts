import { z } from 'zod'
import type { Querier } from '../../client'
import { businessParams } from './params'

/**
 * Get revenue breakdown by category
 * @param ch - ClickHouse client instance
 * @returns Function to query revenue by category data
 */
export function getRevenueByCategory(ch: Querier) {
  return async (args: z.input<typeof businessParams>) => {
    // First, get the total revenue
    const totalQuery = ch.query({
      query: `
      SELECT
        sum(subscription_revenue + one_time_revenue) AS total
      FROM financials.mrr_tracking_mv_v1
      WHERE team_id = {teamId: String}
        AND month_date >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
        AND month_date <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
      `,
      params: businessParams,
      schema: z.object({
        total: z.number(),
      }),
    })

    const totalResult = await totalQuery(args)

    if (totalResult.err) {
      return { err: totalResult.err }
    }

    const total = totalResult.val?.[0]?.total || 0

    // Then, get the revenue by category
    const query = ch.query({
      query: `
      SELECT
        category,
        sum(subscription_revenue) AS subscription_revenue,
        sum(one_time_revenue) AS one_time_revenue,
        sum(subscription_revenue + one_time_revenue) AS total_revenue
      FROM financials.mrr_tracking_mv_v1
      WHERE team_id = {teamId: String}
        AND month_date >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
        AND month_date <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
      GROUP BY category
      ORDER BY total_revenue DESC
      LIMIT {limit: Int}
      `,
      params: businessParams,
      schema: z.object({
        category: z.string(),
        subscription_revenue: z.number(),
        one_time_revenue: z.number(),
        total_revenue: z.number(),
      }),
    })

    const result = await query(args)

    if (result.err) {
      return { err: result.err }
    }

    // Calculate percentage manually
    const resultsWithPercentage = result.val?.map((item) => ({
      ...item,
      percentage: total > 0 ? (item.total_revenue / total) * 100 : 0,
    }))

    return { val: resultsWithPercentage }
  }
}
