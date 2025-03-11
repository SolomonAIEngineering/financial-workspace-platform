import type { Querier } from '../../client'
import { businessParams } from './params'
import { z } from 'zod'

/**
 * Get expenses breakdown by cost type (fixed vs variable)
 * @param ch - ClickHouse client instance
 * @returns Function to query expenses by cost type
 */
export function getExpensesByCostType(ch: Querier) {
  return async (args: z.input<typeof businessParams>) => {
    // Query to get the raw expense data by month
    const expenseQuery = ch.query({
      query: `
      SELECT
        month_date,
        sum(fixed_costs) AS fixed_costs,
        sum(variable_costs) AS variable_costs
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
      }),
    })

    // Execute the query
    const expenseResult = await expenseQuery(args)

    if (!expenseResult.val) {
      return expenseResult
    }

    // Process the results to calculate total costs and percentages
    const processedResults = expenseResult.val.map(item => {
      const totalCosts = item.fixed_costs + item.variable_costs
      return {
        month_date: item.month_date,
        fixed_costs: item.fixed_costs,
        variable_costs: item.variable_costs,
        total_costs: totalCosts,
        fixed_cost_percentage: totalCosts > 0 ? (item.fixed_costs / totalCosts) * 100 : 0,
        variable_cost_percentage: totalCosts > 0 ? (item.variable_costs / totalCosts) * 100 : 0,
      }
    })

    return {
      val: processedResults,
      err: null
    }
  }
}
