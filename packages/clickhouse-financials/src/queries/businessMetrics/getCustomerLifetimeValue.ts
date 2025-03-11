import { z } from 'zod'
import type { Querier } from '../../client'
import { businessParams } from './params'

/**
 * Get customer lifetime value (CLV) metrics
 * @param ch - ClickHouse client instance
 * @returns Function to query CLV data
 */
export function getCustomerLifetimeValue(ch: Querier) {
  return async (args: z.input<typeof businessParams>) => {
    const query = ch.query({
      query: `
      -- Calculate churn rate from mrr_movement_mv_v1
      WITH churn_data AS (
        SELECT
          team_id,
          month_date,
          churned_customers,
          new_customers
        FROM financials.mrr_movement_mv_v1
        WHERE team_id = {teamId: String}
          AND month_date >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
          AND month_date <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
      ),
      -- Calculate average monthly churn rate
      -- Using a simplified approach: total churned / total new customers as an approximation
      churn_rate AS (
        SELECT
          sum(churned_customers) / nullIf(sum(new_customers), 0) AS monthly_churn_rate
        FROM churn_data
      ),
      -- Calculate ARPU from mrr_tracking_mv_v1
      arpu_data AS (
        SELECT
          avg(mrr / nullIf(customer_count, 0)) AS arpu
        FROM financials.mrr_tracking_mv_v1
        WHERE team_id = {teamId: String}
          AND month_date >= toStartOfMonth(fromUnixTimestamp64Milli({start: Int64}))
          AND month_date <= toStartOfMonth(fromUnixTimestamp64Milli({end: Int64}))
      )
      -- Final result
      SELECT
        arpu,
        1 / nullIf(monthly_churn_rate, 0) AS avg_customer_lifetime_months,
        arpu * (1 / nullIf(monthly_churn_rate, 0)) AS customer_lifetime_value,
        monthly_churn_rate
      FROM arpu_data
      CROSS JOIN churn_rate
      `,
      params: businessParams,
      schema: z.object({
        arpu: z.number().nullable(),
        avg_customer_lifetime_months: z.number().nullable(),
        customer_lifetime_value: z.number().nullable(),
        monthly_churn_rate: z.number().nullable(),
      }),
    })

    return query(args)
  }
}
