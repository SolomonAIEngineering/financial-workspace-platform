import type { Querier } from '../../client';
import { businessParams } from './params';
import { dateTimeToUnix } from '../../util';
import { z } from 'zod';

/**
 * Get customer lifetime value (CLV) metrics
 * @param ch - ClickHouse client instance
 * @returns Function to query CLV data
 */
export function getCustomerLifetimeValue(ch: Querier) {
    return async (args: z.input<typeof businessParams>) => {
        const query = ch.query({
            query: `
      WITH
        churn_rate AS (
          SELECT
            avg(churned_customers / nullIf(lag_active_customers, 0)) AS monthly_churn_rate
          FROM (
            SELECT
              month_date,
              churned_customers,
              lag(active_customers) OVER (ORDER BY month_date) AS lag_active_customers
            FROM financials.mrr_movement_mv_v1
            WHERE team_id = {teamId: String}
              AND month_date >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
              AND month_date <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
          )
        ),
        metrics AS (
          SELECT
            avg(mrr / nullIf(customer_count, 0)) AS arpu,
            1 / nullIf(monthly_churn_rate, 0) AS avg_customer_lifetime_months
          FROM financials.mrr_tracking_mv_v1
          CROSS JOIN churn_rate
          WHERE team_id = {teamId: String}
            AND month_date >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
            AND month_date <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
        )
      SELECT
        arpu,
        avg_customer_lifetime_months,
        arpu * avg_customer_lifetime_months AS customer_lifetime_value,
        monthly_churn_rate
      FROM metrics
      CROSS JOIN churn_rate
      `,
            params: businessParams,
            schema: z.object({
                arpu: z.number().nullable(),
                avg_customer_lifetime_months: z.number().nullable(),
                customer_lifetime_value: z.number().nullable(),
                monthly_churn_rate: z.number().nullable(),
            }),
        });

        return query(args);
    };
} 