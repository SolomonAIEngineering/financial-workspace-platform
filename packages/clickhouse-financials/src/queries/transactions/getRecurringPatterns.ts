import { z } from 'zod'
import type { Querier } from '../../client'
import { transactionParams } from './params'

/**
 * Get recurring transactions patterns
 * @param ch - ClickHouse client instance
 * @returns Function to query recurring transaction patterns
 */
export function getRecurringPatterns(ch: Querier) {
  return async (args: z.input<typeof transactionParams>) => {
    const query = ch.query({
      query: `
      SELECT
        merchant_name,
        month,
        day_of_month,
        occurrences,
        average_amount,
        amount_stddev,
        latest_date,
        first_date,
        date_span_days,
        transactions_per_month,
        transaction_ids
      FROM financials.recurring_pattern_detection_mv_v1
      WHERE user_id = {userId: String}
        ${args.merchantName ? 'AND multiSearchAny(merchant_name, {merchantName: Array(String)}) > 0' : ''}
        AND month >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
        AND month <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
      ORDER BY transactions_per_month DESC, occurrences DESC
      LIMIT {limit: Int}
      `,
      params: transactionParams,
      schema: z.object({
        merchant_name: z.string(),
        month: z.string(),
        day_of_month: z.number(),
        occurrences: z.number(),
        average_amount: z.number(),
        amount_stddev: z.number(),
        latest_date: z.string(),
        first_date: z.string(),
        date_span_days: z.number(),
        transactions_per_month: z.number(),
        transaction_ids: z.array(z.string()),
      }),
    })

    return query(args)
  }
}
