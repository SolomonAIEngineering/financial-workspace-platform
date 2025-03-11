import { describe, expect, test } from 'vitest'

import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { ClickHouse } from '../../index'
import { ClickHouseContainer } from '../../testutil'
import { getExpensesByCostType } from './getExpensesByCostType'

/**
 * Generate sample MRR tracking data for testing
 * @param n Number of MRR tracking records to generate
 * @param teamId Team ID for the MRR tracking records
 * @returns Array of MRR tracking objects
 */
function generateMrrTrackingData(n: number, teamId: string) {
  // Categories for test data
  const categories = [
    'subscription',
    'saas',
    'consulting',
    'product',
    'service',
    'other',
  ]

  // Define the MRR tracking type
  type MrrTrackingData = {
    team_id: string
    month_date: string
    date_year: number
    date_month: number
    category: string
    is_subscription_revenue: number
    subscription_revenue: number
    one_time_revenue: number
    fixed_costs: number
    variable_costs: number
    mrr: number
    arr: number
    customer_count: number
  }

  const mrrTrackingRecords: MrrTrackingData[] = []

  // Generate data for the last n months
  const now = new Date()

  for (let i = 0; i < n; i++) {
    // Generate date for i months ago
    const date = new Date(now)
    date.setMonth(now.getMonth() - i)
    const monthDate = date.toISOString().split('T')[0]
    const dateYear = date.getFullYear()
    const dateMonth = date.getMonth() + 1

    // Generate data for each category
    for (const category of categories) {
      const isSubscription = ['subscription', 'saas'].includes(category) ? 1 : 0

      // Generate random values
      const subscriptionRevenue = isSubscription
        ? Math.floor(Math.random() * 10000) + 1000
        : 0
      const oneTimeRevenue = !isSubscription
        ? Math.floor(Math.random() * 5000) + 100
        : 0

      // Generate fixed and variable costs with specific patterns
      // Make fixed costs higher for subscription businesses and variable costs higher for non-subscription
      const fixedCosts = isSubscription
        ? Math.floor(Math.random() * 5000) + 2000
        : Math.floor(Math.random() * 2000) + 500

      const variableCosts = !isSubscription
        ? Math.floor(Math.random() * 4000) + 1000
        : Math.floor(Math.random() * 1500) + 300

      // MRR is either subscription revenue or a calculated value for non-subscription
      const mrr = isSubscription
        ? subscriptionRevenue
        : Math.floor(Math.random() * 10000) + 1000

      // ARR is MRR * 12
      const arr = mrr * 12

      // Random customer count
      const customerCount = Math.floor(Math.random() * 50) + 5

      mrrTrackingRecords.push({
        team_id: teamId,
        month_date: monthDate,
        date_year: dateYear,
        date_month: dateMonth,
        category,
        is_subscription_revenue: isSubscription,
        subscription_revenue: subscriptionRevenue,
        one_time_revenue: oneTimeRevenue,
        fixed_costs: fixedCosts,
        variable_costs: variableCosts,
        mrr,
        arr,
        customer_count: customerCount,
      })
    }
  }

  return mrrTrackingRecords
}

describe('getExpensesByCostType', () => {
  test('accurately retrieves expenses by cost type', async (t) => {
    console.info('Starting test...')

    // Start a ClickHouse container for testing
    const container = await ClickHouseContainer.start(t, {
      keepContainer: false,
    })
    console.info('ClickHouse container started')

    try {
      // Create a ClickHouse client
      const ch = new ClickHouse({
        url: container.url(),
      })
      console.info(`ClickHouse client created with URL: ${container.url()}`)

      // Generate test IDs
      const teamId = randomUUID()
      console.info('Generated test ID:', { teamId })

      // Generate sample MRR tracking data
      const mrrTrackingData = generateMrrTrackingData(12, teamId) // 12 months of data
      console.info(
        `Generated sample MRR tracking data: ${mrrTrackingData.length} records`,
      )
      console.info(
        'Sample MRR tracking record:',
        JSON.stringify(mrrTrackingData[0], null, 2),
      )

      // Check if the database exists
      const databases = await ch.querier.query({
        query: 'SHOW DATABASES',
        schema: z.object({ name: z.string() }),
      })({})

      console.info(
        'Databases:',
        databases.val?.map((db) => db.name),
      )

      // Create financials database if it doesn't exist
      await ch.querier.query({
        query: 'CREATE DATABASE IF NOT EXISTS financials',
        schema: z.object({}),
      })({})

      // List tables in financials database
      const tables = await ch.querier.query({
        query: 'SHOW TABLES FROM financials',
        schema: z.object({ name: z.string() }),
      })({})

      console.info(
        'Tables in financials:',
        tables.val?.map((table) => table.name),
      )

      // Create mrr_tracking_mv_v1 table if it doesn't exist
      await ch.querier.query({
        query: `
                CREATE TABLE IF NOT EXISTS financials.mrr_tracking_mv_v1 (
                    team_id String,
                    month_date Date,
                    date_year UInt16,
                    date_month UInt8,
                    category String,
                    is_subscription_revenue UInt8,
                    subscription_revenue Float64,
                    one_time_revenue Float64,
                    fixed_costs Float64,
                    variable_costs Float64,
                    mrr Float64,
                    arr Float64,
                    customer_count UInt64
                ) ENGINE = MergeTree()
                ORDER BY (team_id, month_date, category)
                `,
        schema: z.object({}),
      })({})

      console.info('Created mrr_tracking_mv_v1 table')

      // Create a Zod schema for the MRR tracking data
      const mrrTrackingSchema = z.object({
        team_id: z.string(),
        month_date: z.string(),
        date_year: z.number(),
        date_month: z.number(),
        category: z.string(),
        is_subscription_revenue: z.number(),
        subscription_revenue: z.number(),
        one_time_revenue: z.number(),
        fixed_costs: z.number(),
        variable_costs: z.number(),
        mrr: z.number(),
        arr: z.number(),
        customer_count: z.number(),
      })

      // Insert the MRR tracking data
      const insertTrackingFn = ch.inserter.insert({
        table: 'financials.mrr_tracking_mv_v1',
        schema: mrrTrackingSchema,
      })

      const trackingBatchResult = await insertTrackingFn(mrrTrackingData)
      console.info('MRR tracking batch insertion result:', trackingBatchResult)

      // Wait for data to be processed
      console.info('Waiting for data to be processed...')
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Verify MRR tracking data insertion
      console.info('Verifying MRR tracking data insertion...')
      const trackingCountQuery = `SELECT count(*) as count FROM financials.mrr_tracking_mv_v1 WHERE team_id = '${teamId}'`

      const trackingCount = await ch.querier.query({
        query: trackingCountQuery,
        schema: z.object({ count: z.number().int() }),
      })({})

      console.info('MRR tracking count result:', trackingCount)
      expect(trackingCount.val!.at(0)!.count).toBeGreaterThan(0)

      // Test the getExpensesByCostType function
      console.info('Testing getExpensesByCostType function...')
      const getExpensesByCostTypeFn = getExpensesByCostType(ch.querier)

      try {
        const result = await getExpensesByCostTypeFn({
          teamId,
        })

        console.info('getExpensesByCostType result:', result)

        if (result.err) {
          console.error('Error in getExpensesByCostType:', result.err)
          throw new Error(
            'Error in getExpensesByCostType: ' + result.err.message,
          )
        } else {
          // Verify the results
          expect(result.val).toBeDefined()
          expect(result.val!.length).toBeGreaterThan(0)

          // Check each month's data
          for (const monthData of result.val!) {
            // Check that month_date is defined
            expect(monthData.month_date).toBeDefined()

            // Check that fixed_costs and variable_costs are numbers
            expect(typeof monthData.fixed_costs).toBe('number')
            expect(typeof monthData.variable_costs).toBe('number')

            // Check that total_costs is the sum of fixed_costs and variable_costs
            expect(monthData.total_costs).toBeCloseTo(
              monthData.fixed_costs + monthData.variable_costs,
              1,
            )

            // Check that percentages are calculated correctly
            if (monthData.total_costs > 0) {
              expect(monthData.fixed_cost_percentage).toBeCloseTo(
                (monthData.fixed_costs / monthData.total_costs) * 100,
                1,
              )

              expect(monthData.variable_cost_percentage).toBeCloseTo(
                (monthData.variable_costs / monthData.total_costs) * 100,
                1,
              )

              // Check that percentages add up to 100%
              expect(
                monthData.fixed_cost_percentage +
                  monthData.variable_cost_percentage,
              ).toBeCloseTo(100, 1)
            }
          }

          // Check that the data is ordered by month_date in ascending order
          for (let i = 1; i < result.val!.length; i++) {
            const prevDate = new Date(result.val![i - 1].month_date)
            const currDate = new Date(result.val![i].month_date)
            expect(prevDate.getTime()).toBeLessThan(currDate.getTime())
          }
        }
      } catch (error) {
        console.error('Exception in getExpensesByCostType:', error)
        throw error
      }
    } finally {
      console.info('Test completed, stopping container...')
      await container.stop()
    }
  }, 30000) // Increase timeout to 30 seconds
})
