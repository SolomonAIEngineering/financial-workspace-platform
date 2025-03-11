import { z } from 'zod'
import type { Querier } from '../../client'
import { transactionParams } from './params'

/**
 * Get category spending breakdown
 * @param ch - ClickHouse client instance
 * @returns Function to query category spending
 */
export function getCategorySpending(ch: Querier) {
  return async (args: z.input<typeof transactionParams>) => {
    const query = ch.query({
      query: `
      SELECT
        category,
        sum(transaction_count) AS transaction_count,
        sum(total_expenses) AS total_expenses,
        sum(total_expenses) / sum(sum(total_expenses)) OVER () * 100 AS percentage
      FROM financials.transactions_by_month_mv_v1
      WHERE user_id = {userId: String}
        ${args.teamId ? 'AND team_id = {teamId: String}' : ''}
        ${args.bankAccountId ? 'AND multiSearchAny(bank_account_id, {bankAccountId: Array(String)}) > 0' : ''}
        AND month_start >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
        AND month_start <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
        AND total_expenses > 0
      GROUP BY category
      ORDER BY total_expenses DESC
      LIMIT {limit: Int}
      `,
      params: transactionParams,
      schema: z.object({
        category: z.string(),
        transaction_count: z.number(),
        total_expenses: z.number(),
        percentage: z.number(),
      }),
    })

    return query(args)
  }
}
