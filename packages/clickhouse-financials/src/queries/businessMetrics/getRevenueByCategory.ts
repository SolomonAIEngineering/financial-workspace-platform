import type { Querier } from '../../client';
import { businessParams } from './params';
import { dateTimeToUnix } from '../../util';
import { z } from 'zod';

/**
 * Get revenue breakdown by category
 * @param ch - ClickHouse client instance
 * @returns Function to query revenue by category data
 */
export function getRevenueByCategory(ch: Querier) {
    return async (args: z.input<typeof businessParams>) => {
        const query = ch.query({
            query: `
      SELECT
        category,
        sum(subscription_revenue) AS subscription_revenue,
        sum(one_time_revenue) AS one_time_revenue,
        sum(subscription_revenue + one_time_revenue) AS total_revenue,
        sum(subscription_revenue + one_time_revenue) / sum(sum(subscription_revenue + one_time_revenue)) OVER () * 100 AS percentage
      FROM financials.mrr_tracking_mv_v1
      WHERE team_id = {teamId: String}
        AND month_date >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
        AND month_date <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
      GROUP BY category
      ORDER BY total_revenue DESC
      LIMIT {limit: Int}
      `,
            params: businessParams,
            schema: z.object({
                category: z.string(),
                subscription_revenue: z.number(),
                one_time_revenue: z.number(),
                total_revenue: z.number(),
                percentage: z.number(),
            }),
        });

        return query(args);
    };
} 