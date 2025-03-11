import { z } from 'zod'
import type { Querier } from '../../client'
import { transactionParams } from './params'

/**
 * Get transactions by day with daily aggregations
 * @param ch - ClickHouse client instance
 * @returns Function to query transactions by day
 */
export function getTransactionsByDay(ch: Querier) {
  return async (args: z.input<typeof transactionParams>) => {
    const query = ch.query({
      query: `
      SELECT
        day,
        category,
        transaction_count,
        total_amount,
        total_expenses,
        total_income,
        average_amount
      FROM financials.transactions_by_day_mv_v1
      WHERE user_id = {userId: String}
        ${args.teamId ? 'AND team_id = {teamId: String}' : ''}
        ${args.bankAccountId ? 'AND multiSearchAny(bank_account_id, {bankAccountId: Array(String)}) > 0' : ''}
        ${args.category ? 'AND multiSearchAny(category, {category: Array(String)}) > 0' : ''}
        AND day >= toDate(fromUnixTimestamp64Milli({start: Int64}))
        AND day <= toDate(fromUnixTimestamp64Milli({end: Int64}))
      ORDER BY day ASC
      LIMIT {limit: Int}
      `,
      params: transactionParams,
      schema: z.object({
        day: z.string(),
        category: z.string(),
        transaction_count: z.number(),
        total_amount: z.number(),
        total_expenses: z.number(),
        total_income: z.number(),
        average_amount: z.number(),
      }),
    })

    return query(args)
  }
}
