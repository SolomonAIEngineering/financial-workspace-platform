import { z } from 'zod'
import type { Querier } from '../../client'
import { dateTimeToUnix } from '../../util'
import { transactionParams } from './params'

/**
 * Get detailed transaction list
 * @param ch - ClickHouse client instance
 * @returns Function to query raw transactions
 */
export function getTransactions(ch: Querier) {
  const transactionDetailsParams = transactionParams.extend({
    offset: z.number().optional().default(0),
    sortBy: z.enum(['date', 'amount', 'name']).optional().default('date'),
    sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
  })

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
