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
    // Get the breakdown by category without calculating percentage in SQL
    const query = ch.query({
      query: `
      SELECT
        category,
        sum(transaction_count) AS transaction_count,
        total_expenses
      FROM financials.transactions_by_month_mv_v1
      WHERE user_id = {userId: String}
        ${args.teamId ? 'AND team_id = {teamId: String}' : ''}
        ${args.bankAccountId ? 'AND multiSearchAny(bank_account_id, {bankAccountId: Array(String)}) > 0' : ''}
        AND month_start >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
        AND month_start <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
        AND total_expenses > 0
      GROUP BY category, total_expenses
      ORDER BY total_expenses DESC
      LIMIT {limit: Int}
      `,
      params: transactionParams,
      schema: z.object({
        category: z.string(),
        transaction_count: z.number(),
        total_expenses: z.number(),
      }),
    })

    const result = await query(args)

    if (result.err) {
      return result
    }

    // Calculate total expenses across all categories
    const totalExpenses = result.val!.reduce(
      (sum, item) => sum + item.total_expenses,
      0,
    )

    // Calculate percentage for each category
    const resultsWithPercentage = result.val!.map((item) => ({
      ...item,
      percentage:
        totalExpenses > 0 ? (item.total_expenses / totalExpenses) * 100 : 0,
    }))

    return {
      val: resultsWithPercentage,
      err: null,
    }
  }
}
