import { z } from 'zod'
import type { Querier } from '../../client'
import { businessParams } from './params'

/**
 * Get MRR tracking metrics
 * @param ch - ClickHouse client instance
 * @returns Function to query MRR tracking data
 */
export function getMrrTracking(ch: Querier) {
  return async (args: z.input<typeof businessParams>) => {
    const query = ch.query({
      query: `
      SELECT
        team_id,
        month_date,
        date_year,
        date_month,
        category,
        is_subscription_revenue,
        subscription_revenue,
        one_time_revenue,
        fixed_costs,
        variable_costs,
        mrr,
        arr,
        customer_count
      FROM financials.mrr_tracking_mv_v1
      WHERE team_id = {teamId: String}
        AND month_date >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
        AND month_date <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
      ORDER BY month_date ASC
      LIMIT {limit: Int}
      `,
      params: businessParams,
      schema: z.object({
        team_id: z.string(),
        month_date: z.string(),
        date_year: z.number(),
        date_month: z.number(),
        category: z.string(),
        is_subscription_revenue: z.number(),
        subscription_revenue: z.number(),
        one_time_revenue: z.number(),
        fixed_costs: z.number(),
        variable_costs: z.number(),
        mrr: z.number(),
        arr: z.number(),
        customer_count: z.number(),
      }),
    })

    return query(args)
  }
}
