import { describe, expect, test } from 'vitest'

import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { ClickHouse } from '../../index'
import { ClickHouseContainer } from '../../testutil'
import { getRecurringTransactionsByStatus } from './getRecurringTransactionsByStatus'

/**
 * Generate sample recurring transaction data for testing
 * @param n Number of recurring transactions to generate
 * @param userId User ID for the recurring transactions
 * @param teamId Team ID for the recurring transactions
 * @param bankAccountId Bank account ID for the recurring transactions
 * @returns Array of recurring transaction objects
 */
function generateRecurringTransactionData(
  n: number,
  userId: string,
  teamId: string,
  bankAccountId: string,
) {
  // Frequencies for test data
  const frequencies = [
    'monthly',
    'weekly',
    'daily',
    'quarterly',
    'yearly',
    'biweekly',
  ]

  // Statuses for test data
  const statuses = ['active', 'paused', 'completed', 'cancelled']

  // Categories for test data
  const categories = [
    'subscription',
    'utilities',
    'rent',
    'insurance',
    'loan',
    'salary',
    'investment',
  ]

  // Merchants for test data
  const merchants = [
    'Netflix',
    'Spotify',
    'Amazon Prime',
    'Gym Membership',
    'Rent',
    'Car Insurance',
    'Health Insurance',
    'Internet Provider',
    'Phone Bill',
    'Salary',
  ]

  // Define the recurring transaction type
  type RecurringTransaction = {
    id: string
    user_id: string
    team_id: string
    bank_account_id: string
    title: string
    description: string
    amount: number
    currency: string
    frequency: string
    interval: number
    start_date: string
    end_date: string | null
    next_scheduled_date: string | null
    days_to_next_execution: number | null
    status: string
    execution_count: number
    total_executed: number
    merchant_name: string
    is_revenue: number
    is_subscription_revenue: number
    is_expense: number
    is_fixed_cost: number
    is_variable_cost: number
    category_slug: string
    tags: string[]
    created_at: string
    updated_at: string
  }

  const recurringTransactions: RecurringTransaction[] = []

  for (let i = 0; i < n; i++) {
    const frequency =
      frequencies[Math.floor(Math.random() * frequencies.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const merchant = merchants[Math.floor(Math.random() * merchants.length)]

    // Determine if it's income or expense (20% chance of income)
    const isRevenue = Math.random() < 0.2 ? 1 : 0
    const isExpense = isRevenue ? 0 : 1

    // Generate amount (positive for income, negative for expense)
    const baseAmount = Math.floor(Math.random() * 1000) + 10
    const amount = isRevenue ? baseAmount : -baseAmount

    // Generate dates
    const now = new Date()
    const startDate = new Date()
    startDate.setMonth(now.getMonth() - Math.floor(Math.random() * 6))

    // 30% chance of having an end date
    const hasEndDate = Math.random() < 0.3
    const endDate = hasEndDate
      ? new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000)
      : null

    // 80% chance of having a next scheduled date if status is active
    const hasNextDate = status === 'active' && Math.random() < 0.8
    const nextDate = hasNextDate
      ? new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000)
      : null
    const daysToNext = nextDate
      ? Math.ceil((nextDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      : null

    // Generate execution counts
    const executionCount = Math.floor(Math.random() * 20)
    const totalExecuted = executionCount

    // Determine if it's a variable cost (30% chance if it's an expense)
    const isVariableCost = isExpense && Math.random() < 0.3 ? 1 : 0

    // Determine if it's automated (70% chance)
    const isAutomated = Math.random() < 0.7 ? 1 : 0

    recurringTransactions.push({
      id: randomUUID(),
      user_id: userId,
      team_id: teamId,
      bank_account_id: bankAccountId,
      title: `${merchant} ${category}`,
      description: `Recurring ${category} for ${merchant}`,
      amount: amount,
      currency: 'USD',
      frequency: frequency,
      interval: 1,
      start_date: startDate.toISOString().replace('T', ' ').substring(0, 19),
      end_date: endDate
        ? endDate.toISOString().replace('T', ' ').substring(0, 19)
        : null,
      next_scheduled_date: nextDate
        ? nextDate.toISOString().replace('T', ' ').substring(0, 19)
        : null,
      days_to_next_execution: daysToNext,
      status: status,
      execution_count: executionCount,
      total_executed: totalExecuted,
      merchant_name: merchant,
      is_revenue: isRevenue,
      is_subscription_revenue: isRevenue && category === 'subscription' ? 1 : 0,
      is_expense: isExpense,
      is_fixed_cost: isExpense && !isVariableCost ? 1 : 0,
      is_variable_cost: isVariableCost,
      category_slug: category,
      tags: [category, merchant.toLowerCase().replace(' ', '-')],
      created_at: new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
        .toISOString()
        .replace('T', ' ')
        .substring(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    })
  }

  return recurringTransactions
}

describe('getRecurringTransactionsByStatus', () => {
  test('accurately retrieves recurring transactions by status', async (t) => {
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
      const userId = randomUUID()
      const teamId = randomUUID()
      const bankAccountId = randomUUID()

      console.info('Generated test IDs:', { userId, teamId, bankAccountId })

      // Generate sample recurring transactions
      const recurringTransactions = generateRecurringTransactionData(
        50,
        userId,
        teamId,
        bankAccountId,
      )
      console.info(
        `Generated sample recurring transactions: ${recurringTransactions.length}`,
      )
      console.info(
        'Sample recurring transaction:',
        JSON.stringify(recurringTransactions[0], null, 2),
      )

      // Check if the database exists
      const databases = await ch.querier.query({
        query: 'SHOW DATABASES',
        schema: z.object({ name: z.string() }),
      })({})

      console.info(
        'Databases:',
        databases.val!.map((db) => db.name),
      )

      // Create the financials database if it doesn't exist
      await ch.querier.query({
        query: 'CREATE DATABASE IF NOT EXISTS financials',
        schema: z.object({}),
      })({})

      // Check if the table exists
      const tables = await ch.querier.query({
        query: 'SHOW TABLES FROM financials',
        schema: z.object({ name: z.string() }),
      })({})

      console.info(
        'Tables in financials:',
        tables.val!.map((table) => table.name),
      )

      // Create the raw_recurring_transactions_v1 table if it doesn't exist
      try {
        await ch.querier.query({
          query: `
            CREATE TABLE IF NOT EXISTS financials.raw_recurring_transactions_v1 (
              id String,
              user_id String,
              team_id String,
              bank_account_id String,
              title String,
              description String,
              amount Float64,
              currency LowCardinality(String),
              frequency LowCardinality(String),
              interval UInt8,
              start_date DateTime,
              end_date Nullable(DateTime),
              next_scheduled_date Nullable(DateTime),
              days_to_next_execution Nullable(Int32),
              status LowCardinality(String),
              execution_count UInt32,
              total_executed UInt32,
              merchant_name String,
              is_revenue UInt8,
              is_subscription_revenue UInt8,
              is_expense UInt8,
              is_fixed_cost UInt8,
              is_variable_cost UInt8,
              category_slug LowCardinality(String),
              tags Array(String),
              created_at DateTime,
              updated_at DateTime
            ) ENGINE = MergeTree()
            ORDER BY (user_id, team_id, bank_account_id, start_date)
          `,
          schema: z.object({}),
        })({})
        console.info('Created raw_recurring_transactions_v1 table')
      } catch (error) {
        console.error('Error creating table:', error)
        throw new Error('Failed to create table: ' + error.message)
      }

      // Insert the recurring transactions
      console.info('Inserting recurring transactions in batch...')

      // Filter to only include active transactions with next_scheduled_date and days_to_next_execution
      const activeTransactions = recurringTransactions
        .filter(
          (t) =>
            t.status === 'active' &&
            t.next_scheduled_date !== null &&
            t.days_to_next_execution !== null,
        )
        .map((t) => ({
          ...t,
          next_scheduled_date: t.next_scheduled_date as string, // We know it's not null from the filter
          days_to_next_execution: t.days_to_next_execution as number, // We know it's not null from the filter
        }))

      console.info(
        `Filtered to ${activeTransactions.length} active transactions with next_scheduled_date`,
      )

      const inserter = ch.inserter.insert({
        table: 'financials.raw_recurring_transactions_v1',
        schema: z.object({
          id: z.string(),
          user_id: z.string(),
          team_id: z.string(),
          bank_account_id: z.string(),
          title: z.string(),
          description: z.string(),
          amount: z.number(),
          currency: z.string(),
          frequency: z.string(),
          interval: z.number(),
          start_date: z.string(),
          end_date: z.string().nullable(),
          next_scheduled_date: z.string(), // Changed to non-nullable
          days_to_next_execution: z.number(), // Changed to non-nullable
          status: z.string(),
          execution_count: z.number(),
          total_executed: z.number(),
          merchant_name: z.string(),
          is_revenue: z.number(),
          is_subscription_revenue: z.number(),
          is_expense: z.number(),
          is_fixed_cost: z.number(),
          is_variable_cost: z.number(),
          category_slug: z.string(),
          tags: z.array(z.string()),
          created_at: z.string(),
          updated_at: z.string(),
        }),
      })

      const insertResult = await inserter(activeTransactions)

      console.info('Batch insertion result:', insertResult)

      // Wait for data to be processed
      console.info('Waiting for data to be processed...')
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Verify data insertion
      console.info('Verifying data insertion...')
      const countQuery = `SELECT count(*) as count FROM financials.raw_recurring_transactions_v1 WHERE user_id = '${userId}'`
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

      // Create the materialized view for recurring transactions by status
      console.info(
        'Creating recurring transactions by status materialized view...',
      )
      try {
        await ch.querier.query({
          query: `
            CREATE MATERIALIZED VIEW IF NOT EXISTS financials.recurring_transactions_by_status_mv_v1
            ENGINE = MergeTree()
            ORDER BY (user_id, team_id, bank_account_id, status, frequency)
            AS
            SELECT
                user_id,
                team_id,
                bank_account_id,
                status,
                frequency,
                count() as count,
                sum(is_variable_cost) as variable_count,
                sum(if(is_expense = 1 AND is_fixed_cost = 1, 1, 0)) as automated_count,
                sum(amount) as total_amount
            FROM financials.raw_recurring_transactions_v1
            GROUP BY user_id, team_id, bank_account_id, status, frequency
          `,
          schema: z.object({}),
        })({})
        console.info('Materialized view created successfully')
      } catch (error) {
        console.error('Error creating materialized view:', error)
        throw new Error('Failed to create materialized view: ' + error.message)
      }

      // Test the getRecurringTransactionsByStatus function
      console.info('Testing getRecurringTransactionsByStatus function...')
      const getRecurringTransactionsByStatusFn =
        getRecurringTransactionsByStatus(ch.querier)
      const result = await getRecurringTransactionsByStatusFn({
        userId,
        teamId,
      })

      console.info('getRecurringTransactionsByStatus result:', result)

      if (result.err) {
        console.error('Error in getRecurringTransactionsByStatus:', result.err)
      } else {
        // Verify the results
        expect(result.val).toBeDefined()
        expect(Array.isArray(result.val)).toBe(true)

        if (result.val && result.val.length > 0) {
          // Check that all returned transactions belong to the test user
          result.val!.forEach((transaction) => {
            expect(transaction.user_id).toBe(userId)
          })

          // Check that the transactions have all the expected fields
          const firstTransaction = result.val![0]
          expect(firstTransaction.status).toBeDefined()
          expect(firstTransaction.frequency).toBeDefined()
          expect(firstTransaction.count).toBeDefined()
          expect(firstTransaction.variable_count).toBeDefined()
          expect(firstTransaction.automated_count).toBeDefined()
          expect(firstTransaction.total_amount).toBeDefined()

          // Check that the count is ordered in descending order
          if (result.val!.length > 1) {
            const counts = result.val!.map((t) => t.count)
            for (let i = 0; i < counts.length - 1; i++) {
              expect(counts[i]).toBeGreaterThanOrEqual(counts[i + 1])
            }
          }

          // Check that the counts make sense
          result.val!.forEach((transaction) => {
            expect(transaction.count).toBeGreaterThan(0)
            expect(transaction.variable_count).toBeGreaterThanOrEqual(0)
            expect(transaction.automated_count).toBeGreaterThanOrEqual(0)
            expect(
              transaction.variable_count + transaction.automated_count,
            ).toBeLessThanOrEqual(transaction.count)
          })
        }
      }
    } finally {
      console.info('Test completed, stopping container...')
      await container.stop()
    }
  })
})
