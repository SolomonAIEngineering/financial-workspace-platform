import type { Querier } from '../../client';
import { dateTimeToUnix } from '../../util';
import { transactionParams } from './params';
import { z } from 'zod';

/**
 * Get transactions by month with monthly aggregations
 * @param ch - ClickHouse client instance
 * @returns Function to query transactions by month
 */
export function getTransactionsByMonth(ch: Querier) {
    return async (args: z.input<typeof transactionParams>) => {
        const query = ch.query({
            query: `
      SELECT
        month_start,
        category,
        transaction_count,
        total_amount,
        total_expenses,
        total_income,
        average_amount
      FROM financials.transactions_by_month_mv_v1
      WHERE user_id = {userId: String}
        ${args.teamId ? 'AND team_id = {teamId: String}' : ''}
        ${args.bankAccountId ? 'AND multiSearchAny(bank_account_id, {bankAccountId: Array(String)}) > 0' : ''}
        ${args.category ? 'AND multiSearchAny(category, {category: Array(String)}) > 0' : ''}
        AND month_start >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
        AND month_start <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
      ORDER BY month_start ASC
      LIMIT {limit: Int}
      `,
            params: transactionParams,
            schema: z.object({
                month_start: z.string(),
                category: z.string(),
                transaction_count: z.number(),
                total_amount: z.number(),
                total_expenses: z.number(),
                total_income: z.number(),
                average_amount: z.number(),
            }),
        });

        return query(args);
    };
} 