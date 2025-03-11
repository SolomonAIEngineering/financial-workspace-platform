import { z } from 'zod'
import type { Querier } from '../../client'
import { businessParams } from './params'

/**
 * Get MRR movement metrics (new, expansion, contraction, churn)
 * @param ch - ClickHouse client instance
 * @returns Function to query MRR movement data
 */
export function getMrrMovement(ch: Querier) {
  return async (args: z.input<typeof businessParams>) => {
    const query = ch.query({
      query: `
      SELECT
        team_id,
        month_date,
        new_mrr,
        expansion_mrr,
        contraction_mrr,
        churn_mrr,
        reactivation_mrr,
        net_new_mrr,
        new_customers,
        churned_customers,
        active_customers
      FROM financials.mrr_movement_mv_v1
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
        new_mrr: z.number(),
        expansion_mrr: z.number(),
        contraction_mrr: z.number(),
        churn_mrr: z.number(),
        reactivation_mrr: z.number(),
        net_new_mrr: z.number(),
        new_customers: z.number(),
        churned_customers: z.number(),
        active_customers: z.number(),
      }),
    })

    return query(args)
  }
}
