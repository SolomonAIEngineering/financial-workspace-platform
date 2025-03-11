import { describe, expect, test } from 'vitest'

import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { ClickHouse } from '../../index'
import { ClickHouseContainer } from '../../testutil'
import { getMrrMovement } from './getMrrMovement'

/**
 * Generate sample MRR movement data for testing
 * @param n Number of MRR movement records to generate (months)
 * @param teamId Team ID for the MRR movement records
 * @returns Array of MRR movement objects
 */
function generateMrrMovementData(n: number, teamId: string) {
  // Define the MRR movement type
  type MrrMovementData = {
    team_id: string
    month_date: string
    current_month_mrr: number
    previous_month_mrr: number
    new_mrr: number
    new_customers: number
    expansion_mrr: number
    expanded_customers: number
    contraction_mrr: number
    contracted_customers: number
    churned_mrr: number
    churned_customers: number
    net_mrr_movement: number
  }

  const mrrMovementRecords: MrrMovementData[] = []

  // Generate data for the last n months
  const now = new Date()
  let activeCustomers = 100 // Starting customer base
  let previousMonthMrr = 50000 // Starting MRR

  for (let i = 0; i < n; i++) {
    // Generate date for i months ago
    const date = new Date(now)
    date.setMonth(now.getMonth() - i)
    const monthDate = date.toISOString().slice(0, 10) // YYYY-MM-DD format

    // Generate realistic MRR movement values
    // Newer months have higher growth metrics (for a growing business)
    const growthFactor = 1 + (n - i) * 0.01

    // Generate new MRR (customers joining)
    const newMrr = Math.round(
      (Math.floor(Math.random() * 5000) + 1000) * growthFactor,
    )
    const newCustomers = Math.floor(Math.random() * 10) + 2

    // Generate expansion MRR (existing customers paying more)
    const expansionMrr = Math.round(
      (Math.floor(Math.random() * 3000) + 500) * growthFactor,
    )
    const expandedCustomers = Math.floor(Math.random() * 5) + 1

    // Generate contraction MRR (existing customers paying less)
    const contractionMrr = Math.round(Math.floor(Math.random() * 1000) + 100)
    const contractedCustomers = Math.floor(Math.random() * 3) + 1

    // Generate churn MRR (customers leaving)
    const churnMrr = Math.round(Math.floor(Math.random() * 3000) + 500)
    const churnedCustomers = Math.floor(Math.random() * 5) + 1

    // Calculate net MRR movement
    const netMrrMovement = newMrr + expansionMrr - contractionMrr - churnMrr

    // Calculate current month MRR
    const currentMonthMrr = previousMonthMrr + netMrrMovement

    // Create the MRR movement record
    mrrMovementRecords.push({
      team_id: teamId,
      month_date: monthDate,
      current_month_mrr: currentMonthMrr,
      previous_month_mrr: previousMonthMrr,
      new_mrr: newMrr,
      new_customers: newCustomers,
      expansion_mrr: expansionMrr,
      expanded_customers: expandedCustomers,
      contraction_mrr: contractionMrr,
      contracted_customers: contractedCustomers,
      churned_mrr: churnMrr,
      churned_customers: churnedCustomers,
      net_mrr_movement: netMrrMovement,
    })

    // Update for next iteration
    previousMonthMrr = currentMonthMrr
    activeCustomers = activeCustomers + newCustomers - churnedCustomers
  }

  return mrrMovementRecords
}

describe('getMrrMovement', () => {
  test('accurately retrieves MRR movement data', async (t) => {
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
      console.info('Generated test IDs:', { teamId })

      // Generate sample MRR movement data
      const mrrMovementData = generateMrrMovementData(12, teamId) // 12 months of data
      console.info(
        `Generated sample MRR movement data: ${mrrMovementData.length} records`,
      )
      console.info(
        'Sample MRR movement record:',
        JSON.stringify(mrrMovementData[0], null, 2),
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

      // Create mrr_movement_mv_v1 table if it doesn't exist
      await ch.querier.query({
        query: `
                CREATE TABLE IF NOT EXISTS financials.mrr_movement_mv_v1 (
                    team_id String,
                    month_date Date,
                    current_month_mrr Float64,
                    previous_month_mrr Float64,
                    new_mrr Float64,
                    new_customers UInt64,
                    expansion_mrr Float64,
                    expanded_customers UInt64,
                    contraction_mrr Float64,
                    contracted_customers UInt64,
                    churned_mrr Float64,
                    churned_customers UInt64,
                    net_mrr_movement Float64
                ) ENGINE = MergeTree()
                ORDER BY (team_id, month_date)
                `,
        schema: z.object({}),
      })({})

      console.info('Created mrr_movement_mv_v1 table')

      // Get the table structure
      const tableStructure = await ch.querier.query({
        query: 'DESCRIBE TABLE financials.mrr_movement_mv_v1',
        schema: z.object({
          name: z.string(),
          type: z.string(),
        }),
      })({})

      console.info('Table structure:', tableStructure.val)

      // Insert the MRR movement data
      console.info('Inserting MRR movement data in batch...')

      const inserter = ch.inserter.insert({
        table: 'financials.mrr_movement_mv_v1',
        schema: z.object({
          team_id: z.string(),
          month_date: z.string(),
          current_month_mrr: z.number(),
          previous_month_mrr: z.number(),
          new_mrr: z.number(),
          new_customers: z.number(),
          expansion_mrr: z.number(),
          expanded_customers: z.number(),
          contraction_mrr: z.number(),
          contracted_customers: z.number(),
          churned_mrr: z.number(),
          churned_customers: z.number(),
          net_mrr_movement: z.number(),
        }),
      })

      const insertResult = await inserter(mrrMovementData)
      console.info('Batch insertion result:', insertResult)

      // Wait for data to be processed
      console.info('Waiting for data to be processed...')
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Verify data insertion
      console.info('Verifying data insertion...')
      const countQuery = `SELECT count(*) as count FROM financials.mrr_movement_mv_v1 WHERE team_id = '${teamId}'`
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
        expect(count.val![0].count).toBeGreaterThan(0)
      }

      // Test the getMrrMovement function
      console.info('Testing getMrrMovement function...')
      const getMrrMovementFn = getMrrMovement(ch.querier)

      try {
        const result = await getMrrMovementFn({
          teamId,
          start: new Date(
            new Date().setMonth(new Date().getMonth() - 12),
          ).getTime(),
          end: new Date().getTime(),
          limit: 100,
        })

        console.info('getMrrMovement result:', result)

        if (result.err) {
          console.error('Error in getMrrMovement:', result.err)
          throw result.err
        } else {
          // Verify the results
          expect(result.val).toBeDefined()
          if (result.val) {
            expect(Array.isArray(result.val)).toBe(true)
            expect(result.val.length).toBeGreaterThan(0)

            // Verify the structure of the returned data
            const firstRecord = result.val[0]
            expect(firstRecord.team_id).toBe(teamId)
            expect(firstRecord.month_date).toBeDefined()
            expect(firstRecord.current_month_mrr).toBeDefined()
            expect(firstRecord.previous_month_mrr).toBeDefined()
            expect(firstRecord.new_mrr).toBeDefined()
            expect(firstRecord.new_customers).toBeDefined()
            expect(firstRecord.expansion_mrr).toBeDefined()
            expect(firstRecord.expanded_customers).toBeDefined()
            expect(firstRecord.contraction_mrr).toBeDefined()
            expect(firstRecord.contracted_customers).toBeDefined()
            expect(firstRecord.churned_mrr).toBeDefined()
            expect(firstRecord.churned_customers).toBeDefined()
            expect(firstRecord.net_mrr_movement).toBeDefined()
          }
        }
      } catch (error) {
        console.error('Exception in getMrrMovement:', error)
        throw error
      }
    } finally {
      console.info('Test completed, stopping container...')
      await container.stop()
    }
  }, 30000) // Increase timeout to 30 seconds
})
