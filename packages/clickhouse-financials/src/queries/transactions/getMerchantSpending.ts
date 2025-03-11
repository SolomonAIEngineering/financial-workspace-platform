import type { Querier } from '../../client';
import { dateTimeToUnix } from '../../util';
import { transactionParams } from './params';
import { z } from 'zod';

/**
 * Get merchant spending analysis
 * @param ch - ClickHouse client instance
 * @returns Function to query merchant spending
 */
export function getMerchantSpending(ch: Querier) {
    return async (args: z.input<typeof transactionParams>) => {
        const query = ch.query({
            query: `
      SELECT
        month_start,
        merchant_name,
        transaction_count,
        total_spent,
        first_transaction,
        latest_transaction,
        average_amount
      FROM financials.merchant_spending_mv_v1
      WHERE user_id = {userId: String}
        ${args.teamId ? 'AND team_id = {teamId: String}' : ''}
        ${args.merchantName ? 'AND multiSearchAny(merchant_name, {merchantName: Array(String)}) > 0' : ''}
        AND month_start >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
        AND month_start <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
      ORDER BY month_start ASC, total_spent DESC
      LIMIT {limit: Int}
      `,
            params: transactionParams,
            schema: z.object({
                month_start: z.string(),
                merchant_name: z.string(),
                transaction_count: z.number(),
                total_spent: z.number(),
                first_transaction: z.string(),
                latest_transaction: z.string(),
                average_amount: z.number(),
            }),
        });

        return query(args);
    };
} 