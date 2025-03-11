import { z } from 'zod'
import type { Querier } from '../../client'
import { dateTimeToUnix } from '../../util'
import { recurringParams } from './params'

/**
 * Get monthly cash flow forecast
 * @param ch - ClickHouse client instance
 * @returns Function to query monthly cash flow forecast
 */
export function getMonthlyCashFlowForecast(ch: Querier) {
  return async (args: z.input<typeof recurringParams>) => {
    const query = ch.query({
      query: `
      SELECT
        user_id,
        bank_account_id,
        month_start,
        is_expense,
        transaction_count,
        total_amount,
        first_transaction_date,
        last_transaction_date,
        transaction_titles
      FROM financials.monthly_cash_flow_forecast_mv_v1
      WHERE user_id = {userId: String}
        ${args.teamId ? 'AND team_id = {teamId: String}' : ''}
        ${args.bankAccountId ? 'AND multiSearchAny(bank_account_id, {bankAccountId: Array(String)}) > 0' : ''}
        AND month_start >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
        AND month_start <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
      ORDER BY month_start ASC, is_expense ASC
      LIMIT {limit: Int}
      `,
      params: recurringParams,
      schema: z.object({
        user_id: z.string(),
        bank_account_id: z.string(),
        month_start: z.string(),
        is_expense: z.number(),
        transaction_count: z.number(),
        total_amount: z.number(),
        first_transaction_date: dateTimeToUnix,
        last_transaction_date: dateTimeToUnix,
        transaction_titles: z.array(z.string()),
      }),
    })

    return query(args)
  }
}
