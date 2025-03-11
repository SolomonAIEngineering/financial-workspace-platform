import type { Querier } from '../../client';
import { businessParams } from './params';
import { dateTimeToUnix } from '../../util';
import { z } from 'zod';

/**
 * Get cash runway metrics
 * @param ch - ClickHouse client instance
 * @returns Function to query cash runway data
 */
export function getCashRunway(ch: Querier) {
    const cashRunwayParams = businessParams.extend({
        currentCash: z.number(),
        burnRate: z.number().optional(),
    });

    return async (args: z.input<typeof cashRunwayParams>) => {
        const query = ch.query({
            query: `
      WITH 
        {currentCash: Float64} AS starting_cash,
        avg(monthly_burn) OVER (ORDER BY month_date DESC ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING) AS avg_burn_rate,
        monthly_revenue_growth,
        monthly_expense_growth
      FROM (
        SELECT
          month_date,
          total_revenue,
          total_expenses,
          total_expenses - total_revenue AS monthly_burn,
          (total_revenue - lag(total_revenue) OVER (ORDER BY month_date)) / 
            nullIf(lag(total_revenue) OVER (ORDER BY month_date), 0) AS monthly_revenue_growth,
          (total_expenses - lag(total_expenses) OVER (ORDER BY month_date)) / 
            nullIf(lag(total_expenses) OVER (ORDER BY month_date), 0) AS monthly_expense_growth
        FROM financials.monthly_financial_summary_mv_v1
        WHERE team_id = {teamId: String}
          AND month_date >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
          AND month_date <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
        ORDER BY month_date DESC
        LIMIT 12
      )
      SELECT
        starting_cash / ${args.burnRate ? '{burnRate: Float64}' : 'avg_burn_rate'} AS runway_months,
        starting_cash AS current_cash,
        ${args.burnRate ? '{burnRate: Float64}' : 'avg_burn_rate'} AS burn_rate,
        monthly_revenue_growth,
        monthly_expense_growth
      LIMIT 1
      `,
            params: cashRunwayParams,
            schema: z.object({
                runway_months: z.number(),
                current_cash: z.number(),
                burn_rate: z.number(),
                monthly_revenue_growth: z.number().nullable(),
                monthly_expense_growth: z.number().nullable(),
            }),
        });

        return query(args);
    };
} 