import type { Querier } from '../../client'
import { businessParams } from './params'
import { z } from 'zod'

/**
 * Get cash runway metrics
 * @param ch - ClickHouse client instance
 * @returns Function to query cash runway data
 */
export function getCashRunway(ch: Querier) {
  const cashRunwayParams = businessParams.extend({
    currentCash: z.number(),
    burnRate: z.number().optional(),
  })

  return async (args: z.input<typeof cashRunwayParams>) => {
    // First, get the financial data for the last 12 months
    const financialDataQuery = ch.query({
      query: `
      SELECT
        month_date,
        total_revenue,
        total_expenses,
        total_expenses - total_revenue AS monthly_burn
      FROM financials.monthly_financial_summary_mv_v1
      WHERE team_id = {teamId: String}
        AND month_date >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
        AND month_date <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
      ORDER BY month_date DESC
      LIMIT 12
      `,
      params: businessParams,
      schema: z.object({
        month_date: z.string(),
        total_revenue: z.number(),
        total_expenses: z.number(),
        monthly_burn: z.number(),
      }),
    })

    const financialData = await financialDataQuery(args)

    if (financialData.err) {
      return financialData
    }

    // Calculate average burn rate from the last 3 months
    const data = financialData.val || []
    const recentMonths = data.slice(0, 3)

    // Calculate average burn rate
    const avgBurnRate = recentMonths.length > 0
      ? recentMonths.reduce((sum, month) => sum + month.monthly_burn, 0) / recentMonths.length
      : 0

    // Calculate growth rates if we have enough data
    let revenueGrowth: number | null = null
    let expenseGrowth: number | null = null

    if (data.length >= 2) {
      const current = data[0]
      const previous = data[1]

      // Calculate revenue growth
      if (previous.total_revenue !== 0) {
        revenueGrowth = (current.total_revenue - previous.total_revenue) / previous.total_revenue
      }

      // Calculate expense growth
      if (previous.total_expenses !== 0) {
        expenseGrowth = (current.total_expenses - previous.total_expenses) / previous.total_expenses
      }
    }

    // Use provided burn rate or calculated average
    const burnRate = args.burnRate || avgBurnRate

    // Calculate runway months
    const runwayMonths = burnRate > 0 ? args.currentCash / burnRate : 0

    // Return the results
    return {
      val: [{
        runway_months: runwayMonths,
        current_cash: args.currentCash,
        burn_rate: burnRate,
        monthly_revenue_growth: revenueGrowth,
        monthly_expense_growth: expenseGrowth,
      }]
    }
  }
}
