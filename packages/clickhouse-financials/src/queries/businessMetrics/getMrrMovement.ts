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
        current_month_mrr,
        previous_month_mrr,
        new_mrr,
        new_customers,
        expansion_mrr,
        expanded_customers,
        contraction_mrr,
        contracted_customers,
        churned_mrr,
        churned_customers,
        net_mrr_movement
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
        current_month_mrr: z.number(),
        previous_month_mrr: z.number(),
        new_mrr: z.number(),
        new_customers: z.number(),
        expansion_mrr: z.number(),
        expanded_customers: z.number(),
        contraction_mrr: z.number(),
        contracted_customers: z.number(),
        churned_mrr: z.number(),
        churned_customers: z.number(),
        net_mrr_movement: z.number(),
      }),
    })

    return query(args)
  }
}
