import { z } from 'zod'
import type { Querier } from '../../client'
import { businessParams } from './params'

/**
 * Get expenses breakdown by cost type (fixed vs variable)
 * @param ch - ClickHouse client instance
 * @returns Function to query expenses by cost type
 */
export function getExpensesByCostType(ch: Querier) {
  return async (args: z.input<typeof businessParams>) => {
    const query = ch.query({
      query: `
      SELECT
        month_date,
        sum(fixed_costs) AS fixed_costs,
        sum(variable_costs) AS variable_costs,
        sum(fixed_costs) + sum(variable_costs) AS total_costs,
        sum(fixed_costs) / (sum(fixed_costs) + sum(variable_costs)) * 100 AS fixed_cost_percentage,
        sum(variable_costs) / (sum(fixed_costs) + sum(variable_costs)) * 100 AS variable_cost_percentage
      FROM financials.mrr_tracking_mv_v1
      WHERE team_id = {teamId: String}
        AND month_date >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
        AND month_date <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
      GROUP BY month_date
      ORDER BY month_date ASC
      LIMIT {limit: Int}
      `,
      params: businessParams,
      schema: z.object({
        month_date: z.string(),
        fixed_costs: z.number(),
        variable_costs: z.number(),
        total_costs: z.number(),
        fixed_cost_percentage: z.number(),
        variable_cost_percentage: z.number(),
      }),
    })

    return query(args)
  }
}
