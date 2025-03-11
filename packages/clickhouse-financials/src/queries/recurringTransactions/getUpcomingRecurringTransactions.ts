import type { Querier } from '../../client';
import { dateTimeToUnix } from '../../util';
import { recurringParams } from './params';
import { z } from 'zod';

/**
 * Get list of upcoming recurring transactions
 * @param ch - ClickHouse client instance
 * @returns Function to query upcoming recurring transactions
 */
export function getUpcomingRecurringTransactions(ch: Querier) {
  return async (args: z.input<typeof recurringParams>) => {
    const query = ch.query({
      query: `
      SELECT
        team_id,
        user_id,
        bank_account_id,
        next_scheduled_date,
        days_to_next_execution,
        upcoming_transactions_count,
        total_amount,
        transaction_titles,
        transaction_ids
      FROM financials.upcoming_recurring_transactions_mv_v1
      WHERE user_id = {userId: String}
        ${args.teamId ? 'AND team_id = {teamId: String}' : ''}
        ${args.bankAccountId ? 'AND multiSearchAny(bank_account_id, {bankAccountId: Array(String)}) > 0' : ''}
        AND next_scheduled_date >= fromUnixTimestamp64Milli({start: Int64})
        AND next_scheduled_date <= fromUnixTimestamp64Milli({end: Int64})
      ORDER BY days_to_next_execution ASC
      LIMIT {limit: Int}
      `,
      params: recurringParams,
      schema: z.object({
        team_id: z.string(),
        user_id: z.string(),
        bank_account_id: z.string(),
        next_scheduled_date: dateTimeToUnix,
        days_to_next_execution: z.number(),
        upcoming_transactions_count: z.number(),
        total_amount: z.number(),
        transaction_titles: z.array(z.string()),
        transaction_ids: z.array(z.string()),
      }),
    });

    return query(args);
  };
} 