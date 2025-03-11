import { z } from 'zod'
import type { Querier } from '../../client'
import { dateTimeToUnix } from '../../util'
import { recurringParams } from './params'

/**
 * Get most important recurring transactions (critical and high importance)
 * @param ch - ClickHouse client instance
 * @returns Function to query important recurring transactions
 */
export function getImportantRecurringTransactions(ch: Querier) {
  return async (args: z.input<typeof recurringParams>) => {
    const query = ch.query({
      query: `
      SELECT
        user_id,
        title,
        amount,
        frequency,
        next_scheduled_date,
        importance_level,
        merchant_name,
        execution_count,
        total_executed
      FROM financials.raw_recurring_transactions_v1
      WHERE status = 'active'
        AND user_id = {userId: String}
        ${args.teamId ? 'AND team_id = {teamId: String}' : ''}
        ${args.bankAccountId ? 'AND multiSearchAny(bank_account_id, {bankAccountId: Array(String)}) > 0' : ''}
        AND importance_level IN ('Critical', 'High')
      ORDER BY 
        CASE importance_level
            WHEN 'Critical' THEN 1
            WHEN 'High' THEN 2
            ELSE 3
        END ASC,
        abs(amount) DESC
      LIMIT {limit: Int}
      `,
      params: recurringParams,
      schema: z.object({
        user_id: z.string(),
        title: z.string(),
        amount: z.number(),
        frequency: z.string(),
        next_scheduled_date: dateTimeToUnix.nullable(),
        importance_level: z.string(),
        merchant_name: z.string(),
        execution_count: z.number(),
        total_executed: z.number(),
      }),
    })

    return query(args)
  }
}
