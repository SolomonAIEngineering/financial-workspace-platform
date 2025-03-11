import { describe, expect, test } from 'vitest'

import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { ClickHouse } from '../../index'
import { ClickHouseContainer } from '../../testutil'
import { getMonthlyFinancialSummary } from './getMonthlyFinancialSummary'

/**
 * Generate sample financial summary data for testing
 * @param n Number of months to generate data for
 * @param teamId Team ID for the financial data
 * @returns Array of financial summary data objects
 */
function generateFinancialSummaryData(n: number, teamId: string) {
  type FinancialSummaryData = {
    team_id: string
    month_date: string
    total_revenue: number
    total_expenses: number
    net_income: number
    gross_profit: number
    gross_margin: number
    operating_expenses: number
    operating_income: number
    operating_margin: number
  }

  const financialData: FinancialSummaryData[] = []
  const now = new Date()

  // Base values for revenue and expenses
  let baseRevenue = 50000
  let baseExpenses = 40000

  // Generate data for n months, starting from n months ago
  for (let i = n - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)

    // Add some randomness to the values but keep a trend
    const revenueGrowth = 1 + (Math.random() * 0.1 - 0.02) // -2% to +8% growth
    const expenseGrowth = 1 + Math.random() * 0.05 // 0% to +5% growth

    baseRevenue *= revenueGrowth
    baseExpenses *= expenseGrowth

    const totalRevenue = Math.round(baseRevenue)
    const totalExpenses = Math.round(baseExpenses)

    // Calculate financial metrics
    const netIncome = totalRevenue - totalExpenses

    // Assume cost of goods sold is 40% of revenue
    const costOfGoodsSold = Math.round(totalRevenue * 0.4)
    const grossProfit = totalRevenue - costOfGoodsSold
    const grossMargin = (grossProfit / totalRevenue) * 100

    // Assume operating expenses are 80% of total expenses
    const operatingExpenses = Math.round(totalExpenses * 0.8)
    const operatingIncome = totalRevenue - operatingExpenses
    const operatingMargin = (operatingIncome / totalRevenue) * 100

    financialData.push({
      team_id: teamId,
      month_date: monthDate.toISOString().split('T')[0],
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_income: netIncome,
      gross_profit: grossProfit,
      gross_margin: grossMargin,
      operating_expenses: operatingExpenses,
      operating_income: operatingIncome,
      operating_margin: operatingMargin,
    })
  }

  return financialData
}

describe('getMonthlyFinancialSummary', () => {
  test('accurately retrieves monthly financial summary data', async (t) => {
    console.info('Starting test...')

    // Start a ClickHouse container
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

      // Generate test ID
      const teamId = randomUUID()
      console.info('Generated test ID:', { teamId })

      // Generate sample financial data
      const financialData = generateFinancialSummaryData(12, teamId)
      console.info('Generated sample financial data:', financialData.length)
      console.info(
        'Sample financial data:',
        JSON.stringify(financialData[0], null, 2),
      )

      // List databases to check if financials exists
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

      // Create monthly_financial_summary_mv_v1 table if it doesn't exist
      await ch.querier.query({
        query: `
                CREATE TABLE IF NOT EXISTS financials.monthly_financial_summary_mv_v1 (
                    team_id String,
                    month_date Date,
                    total_revenue Float64,
                    total_expenses Float64,
                    net_income Float64,
                    gross_profit Float64,
                    gross_margin Float64,
                    operating_expenses Float64,
                    operating_income Float64,
                    operating_margin Float64
                ) ENGINE = MergeTree()
                ORDER BY (team_id, month_date)
                `,
        schema: z.object({}),
      })({})

      console.info('Created monthly_financial_summary_mv_v1 table')

      // Create a Zod schema for the financial data
      const financialDataSchema = z.object({
        team_id: z.string(),
        month_date: z.string(),
        total_revenue: z.number(),
        total_expenses: z.number(),
        net_income: z.number(),
        gross_profit: z.number(),
        gross_margin: z.number(),
        operating_expenses: z.number(),
        operating_income: z.number(),
        operating_margin: z.number(),
      })

      // Insert the financial data
      const insertFn = ch.inserter.insert({
        table: 'financials.monthly_financial_summary_mv_v1',
        schema: financialDataSchema,
      })

      const batchResult = await insertFn(financialData)
      console.info('Batch insertion result:', batchResult)

      // Wait for data to be processed
      console.info('Waiting for data to be processed...')
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Verify data insertion
      console.info('Verifying data insertion...')
      const countQuery = `SELECT count(*) as count FROM financials.monthly_financial_summary_mv_v1 WHERE team_id = '${teamId}'`
      console.info('Count query:', countQuery)

      const count = await ch.querier.query({
        query: countQuery,
        schema: z.object({ count: z.number().int() }),
      })({})

      console.info('Count result:', count)

      if (count.err) {
        console.error('Error in count query:', count.err)
        throw new Error('Error in count query: ' + count.err.message)
      } else {
        console.info('Count value:', count.val)
        // The test should fail if no data was inserted
        expect(count.val!.at(0)!.count).toBeGreaterThan(0)
      }

      // Test the getMonthlyFinancialSummary function
      console.info('Testing getMonthlyFinancialSummary function...')
      const getMonthlyFinancialSummaryFn = getMonthlyFinancialSummary(
        ch.querier,
      )

      try {
        const result = await getMonthlyFinancialSummaryFn({
          teamId,
        })

        console.info('getMonthlyFinancialSummary result:', result)

        if (result.err) {
          console.error('Error in getMonthlyFinancialSummary:', result.err)
          throw new Error(
            'Error in getMonthlyFinancialSummary: ' + result.err.message,
          )
        } else {
          // Verify the results
          expect(result.val).toBeDefined()
          expect(result.val!.length).toBeGreaterThan(0)

          // Check each month's data
          for (const monthData of result.val!) {
            // Check that team_id matches our input
            expect(monthData.team_id).toBe(teamId)

            // Check that month_date is defined
            expect(monthData.month_date).toBeDefined()

            // Check that financial metrics are numbers
            expect(typeof monthData.total_revenue).toBe('number')
            expect(typeof monthData.total_expenses).toBe('number')
            expect(typeof monthData.net_income).toBe('number')
            expect(typeof monthData.gross_profit).toBe('number')
            expect(typeof monthData.gross_margin).toBe('number')
            expect(typeof monthData.operating_expenses).toBe('number')
            expect(typeof monthData.operating_income).toBe('number')
            expect(typeof monthData.operating_margin).toBe('number')

            // Check that net_income is calculated correctly
            expect(monthData.net_income).toBeCloseTo(
              monthData.total_revenue - monthData.total_expenses,
              1,
            )

            // Check that operating_income is calculated correctly
            expect(monthData.operating_income).toBeCloseTo(
              monthData.total_revenue - monthData.operating_expenses,
              1,
            )

            // Check that gross_margin is a percentage
            expect(monthData.gross_margin).toBeGreaterThanOrEqual(0)
            expect(monthData.gross_margin).toBeLessThanOrEqual(100)

            // Check that operating_margin is a percentage
            expect(monthData.operating_margin).toBeLessThanOrEqual(100)
          }

          // Check that the data is ordered by month_date in ascending order
          for (let i = 1; i < result.val!.length; i++) {
            const prevDate = new Date(result.val![i - 1].month_date)
            const currDate = new Date(result.val![i].month_date)
            expect(prevDate.getTime()).toBeLessThan(currDate.getTime())
          }
        }
      } catch (error) {
        console.error('Exception in getMonthlyFinancialSummary:', error)
        throw error
      }
    } finally {
      console.info('Test completed, stopping container...')
      await container.stop()
    }
  }, 30000) // Increase timeout to 30 seconds
})
