import { z } from 'zod'
import type { Querier } from '../../client'
import { dateTimeToUnix } from '../../util'
import { recurringParams } from './params'

/**
 * Get detailed list of recurring transactions
 * @param ch - ClickHouse client instance
 * @returns Function to query raw recurring transactions
 */
export function getRecurringTransactions(ch: Querier) {
  const detailedRecurringParams = recurringParams.extend({
    offset: z.number().optional().default(0),
    sortBy: z
      .enum(['start_date', 'amount', 'title', 'frequency'])
      .optional()
      .default('start_date'),
    sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
  })

  return async (args: z.input<typeof detailedRecurringParams>) => {
    const query = ch.query({
      query: `
      SELECT
        id,
        user_id,
        team_id,
        bank_account_id,
        title,
        description,
        amount,
        currency,
        frequency,
        interval,
        start_date,
        end_date,
        next_scheduled_date,
        days_to_next_execution,
        status,
        execution_count,
        total_executed,
        merchant_name,
        is_revenue,
        is_subscription_revenue,
        is_expense,
        is_fixed_cost,
        is_variable_cost,
        category_slug,
        tags,
        created_at,
        updated_at
      FROM financials.raw_recurring_transactions_v1
      WHERE user_id = {userId: String}
        ${args.teamId ? 'AND team_id = {teamId: String}' : ''}
        ${args.bankAccountId ? 'AND multiSearchAny(bank_account_id, {bankAccountId: Array(String)}) > 0' : ''}
        ${args.status ? 'AND multiSearchAny(status, {status: Array(String)}) > 0' : ''}
        ${args.frequency ? 'AND multiSearchAny(frequency, {frequency: Array(String)}) > 0' : ''}
        AND start_date >= fromUnixTimestamp64Milli({start: Int64})
        AND (end_date IS NULL OR end_date <= fromUnixTimestamp64Milli({end: Int64}))
      ORDER BY ${args.sortBy} ${args.sortDir}
      LIMIT {limit: Int} OFFSET {offset: Int}
      `,
      params: detailedRecurringParams,
      schema: z.object({
        id: z.string(),
        user_id: z.string(),
        team_id: z.string(),
        bank_account_id: z.string(),
        title: z.string(),
        description: z.string(),
        amount: z.number(),
        currency: z.string(),
        frequency: z.string(),
        interval: z.number(),
        start_date: dateTimeToUnix,
        end_date: dateTimeToUnix.nullable(),
        next_scheduled_date: dateTimeToUnix.nullable(),
        days_to_next_execution: z.number().nullable(),
        status: z.string(),
        execution_count: z.number(),
        total_executed: z.number(),
        merchant_name: z.string(),
        is_revenue: z.number(),
        is_subscription_revenue: z.number(),
        is_expense: z.number(),
        is_fixed_cost: z.number(),
        is_variable_cost: z.number(),
        category_slug: z.string(),
        tags: z.array(z.string()),
        created_at: dateTimeToUnix,
        updated_at: dateTimeToUnix,
      }),
    })

    return query(args)
  }
}
