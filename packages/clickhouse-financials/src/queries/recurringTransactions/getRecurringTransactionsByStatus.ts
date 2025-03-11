import type { Querier } from '../../client';
import { dateTimeToUnix } from '../../util';
import { recurringParams } from './params';
import { z } from 'zod';

/**
 * Get recurring transactions by status
 * @param ch - ClickHouse client instance
 * @returns Function to query recurring transactions by status
 */
export function getRecurringTransactionsByStatus(ch: Querier) {
    return async (args: z.input<typeof recurringParams>) => {
        const query = ch.query({
            query: `
      SELECT
        user_id,
        bank_account_id,
        status,
        frequency,
        count,
        variable_count,
        automated_count,
        total_amount
      FROM financials.recurring_transactions_by_status_mv_v1
      WHERE user_id = {userId: String}
        ${args.teamId ? 'AND team_id = {teamId: String}' : ''}
        ${args.bankAccountId ? 'AND multiSearchAny(bank_account_id, {bankAccountId: Array(String)}) > 0' : ''}
        ${args.status ? 'AND multiSearchAny(status, {status: Array(String)}) > 0' : ''}
        ${args.frequency ? 'AND multiSearchAny(frequency, {frequency: Array(String)}) > 0' : ''}
      ORDER BY count DESC
      LIMIT {limit: Int}
      `,
            params: recurringParams,
            schema: z.object({
                user_id: z.string(),
                bank_account_id: z.string(),
                status: z.string(),
                frequency: z.string(),
                count: z.number(),
                variable_count: z.number(),
                automated_count: z.number(),
                total_amount: z.number(),
            }),
        });

        return query(args);
    };
} 