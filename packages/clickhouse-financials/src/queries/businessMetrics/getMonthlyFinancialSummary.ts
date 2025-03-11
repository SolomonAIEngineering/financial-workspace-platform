import { z } from 'zod'
import type { Querier } from '../../client'
import { businessParams } from './params'

/**
 * Get monthly financial summary
 * @param ch - ClickHouse client instance
 * @returns Function to query monthly financial summary data
 */
export function getMonthlyFinancialSummary(ch: Querier) {
  return async (args: z.input<typeof businessParams>) => {
    const query = ch.query({
      query: `
      SELECT
        team_id,
        month_date,
        total_revenue,
        total_expenses,
        net_income,
        gross_profit,
        gross_margin,
        operating_expenses,
        operating_income,
        operating_margin
      FROM financials.monthly_financial_summary_mv_v1
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
        total_revenue: z.number(),
        total_expenses: z.number(),
        net_income: z.number(),
        gross_profit: z.number(),
        gross_margin: z.number(),
        operating_expenses: z.number(),
        operating_income: z.number(),
        operating_margin: z.number(),
      }),
    })

    return query(args)
  }
}
