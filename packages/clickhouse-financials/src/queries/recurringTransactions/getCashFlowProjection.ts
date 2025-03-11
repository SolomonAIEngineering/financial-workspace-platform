import type { Querier } from '../../client';
import { dateTimeToUnix } from '../../util';
import { recurringParams } from './params';
import { z } from 'zod';

/**
 * Get upcoming cash flow projection
 * @param ch - ClickHouse client instance
 * @returns Function to query upcoming cash flow for a specified period
 */
export function getCashFlowProjection(ch: Querier) {
    const cashFlowParams = recurringParams.extend({
        projectionDays: z.number().optional().default(30),
    });

    return async (args: z.input<typeof cashFlowParams>) => {
        const query = ch.query({
            query: `
      SELECT
        user_id,
        bank_account_id,
        sum(if(amount > 0, amount, 0)) AS projected_income,
        sum(if(amount < 0, abs(amount), 0)) AS projected_expenses,
        sum(amount) AS net_projected_balance,
        count() AS total_recurring_transactions
      FROM financials.raw_recurring_transactions_v1
      WHERE user_id = {userId: String}
        ${args.teamId ? 'AND team_id = {teamId: String}' : ''}
        ${args.bankAccountId ? 'AND multiSearchAny(bank_account_id, {bankAccountId: Array(String)}) > 0' : ''}
        AND status = 'active'
        AND allow_execution = 1
        AND next_scheduled_date IS NOT NULL
        AND next_scheduled_date > today()
        AND next_scheduled_date <= (today() + INTERVAL {projectionDays: Int} DAY)
      GROUP BY user_id, bank_account_id
      ORDER BY user_id, bank_account_id
      `,
            params: cashFlowParams,
            schema: z.object({
                user_id: z.string(),
                bank_account_id: z.string(),
                projected_income: z.number(),
                projected_expenses: z.number(),
                net_projected_balance: z.number(),
                total_recurring_transactions: z.number(),
            }),
        });

        return query(args);
    };
} 