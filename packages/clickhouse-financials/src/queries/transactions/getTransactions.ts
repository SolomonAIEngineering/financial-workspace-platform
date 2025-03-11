import { z } from 'zod'
import type { Querier } from '../../client'
import { dateTimeToUnix } from '../../util'
import { transactionParams } from './params'

/**
 * Retrieves a paginated list of financial transactions with detailed information.
 *
 * This query function fetches transaction data from the ClickHouse database with
 * filtering, sorting, and pagination capabilities. It allows clients to retrieve
 * transaction records based on various criteria such as date range, bank account,
 * category, and merchant name.
 *
 * @param ch - ClickHouse client instance that provides query execution capabilities
 * @returns A function that accepts filter parameters and returns transaction data
 *
 * @example
 * ```typescript
 * const transactionQuery = getTransactions(clickhouseClient);
 * const result = await transactionQuery({
 *   userId: 'user-123',
 *   teamId: 'team-456',
 *   start: 1609459200000, // Jan 1, 2021 in milliseconds
 *   end: 1640995199000,   // Dec 31, 2021 in milliseconds
 *   limit: 100,
 *   offset: 0,
 *   sortBy: 'date',
 *   sortDir: 'desc'
 * });
 * ```
 */
export function getTransactions(ch: Querier) {
  /**
   * Extended parameters schema for transaction queries with additional sorting and pagination options
   */
  const transactionDetailsParams = transactionParams.extend({
    offset: z.number().optional().default(0),
    sortBy: z.enum(['date', 'amount', 'name']).optional().default('date'),
    sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
  })

  /**
   * Query function that retrieves transaction data based on provided parameters
   *
   * @param args - Query parameters including filters, sorting options, and pagination
   * @returns Promise resolving to transaction data or error
   */
  return async (args: z.input<typeof transactionDetailsParams>) => {
    const query = ch.query({
      query: `
      SELECT
        id,
        user_id,
        team_id,
        bank_account_id,
        amount,
        iso_currency_code,
        date,
        name,
        merchant_name,
        description,
        category,
        sub_category,
        is_recurring,
        recurring_transaction_id,
        tags,
        created_at,
        updated_at
      FROM financials.raw_transactions_v1
      WHERE user_id = {userId: String}
        ${args.teamId ? 'AND team_id = {teamId: String}' : ''}
        ${args.bankAccountId ? 'AND multiSearchAny(bank_account_id, {bankAccountId: Array(String)}) > 0' : ''}
        ${args.category ? 'AND multiSearchAny(category, {category: Array(String)}) > 0' : ''}
        ${args.merchantName ? 'AND multiSearchAny(merchant_name, {merchantName: Array(String)}) > 0' : ''}
        AND date >= fromUnixTimestamp64Milli({start: Int64})
        AND date <= fromUnixTimestamp64Milli({end: Int64})
      ORDER BY ${args.sortBy} ${args.sortDir}
      LIMIT {limit: Int} OFFSET {offset: Int}
      `,
      params: transactionDetailsParams,
      schema: z.object({
        id: z.string(),
        user_id: z.string(),
        team_id: z.string(),
        bank_account_id: z.string(),
        amount: z.number(),
        iso_currency_code: z.string(),
        date: dateTimeToUnix,
        name: z.string(),
        merchant_name: z.string(),
        description: z.string(),
        category: z.string(),
        sub_category: z.string(),
        is_recurring: z.number(),
        recurring_transaction_id: z.string().nullable(),
        tags: z.array(z.string()),
        created_at: dateTimeToUnix,
        updated_at: dateTimeToUnix,
      }),
    })

    return query(args)
  }
}
