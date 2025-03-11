import { z } from 'zod'
import type { Querier } from '../../client'
import { dateTimeToUnix } from '../../util'
import { recurringParams } from './params'

/**
 * Retrieves a paginated list of recurring transactions with comprehensive details.
 *
 * This query function fetches recurring transaction data from the ClickHouse database
 * with filtering, sorting, and pagination capabilities. It allows clients to retrieve
 * recurring transaction records based on various criteria such as date range, bank account,
 * status, and frequency.
 *
 * Recurring transactions represent scheduled, repeating financial activities such as
 * subscriptions, regular bills, or recurring revenue streams. This function provides
 * access to all attributes of these transactions including their scheduling information,
 * execution status, and categorization.
 *
 * @param ch - ClickHouse client instance that provides query execution capabilities
 * @returns A function that accepts filter parameters and returns recurring transaction data
 *
 * @example
 * ```typescript
 * const recurringQuery = getRecurringTransactions(clickhouseClient);
 * const result = await recurringQuery({
 *   userId: 'user-123',
 *   teamId: 'team-456',
 *   start: 1609459200000, // Jan 1, 2021 in milliseconds
 *   end: 1640995199000,   // Dec 31, 2021 in milliseconds
 *   status: ['active', 'pending'],
 *   limit: 50,
 *   offset: 0,
 *   sortBy: 'start_date',
 *   sortDir: 'desc'
 * });
 * ```
 */
export function getRecurringTransactions(ch: Querier) {
  /**
   * Extended parameters schema for recurring transaction queries with additional sorting and pagination options
   */
  const detailedRecurringParams = recurringParams.extend({
    offset: z.number().optional().default(0),
    sortBy: z
      .enum(['start_date', 'amount', 'title', 'frequency'])
      .optional()
      .default('start_date'),
    sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
  })

  /**
   * Query function that retrieves recurring transaction data based on provided parameters
   *
   * @param args - Query parameters including filters, sorting options, and pagination
   * @returns Promise resolving to recurring transaction data or error
   */
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
      ORDER BY start_date DESC
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
