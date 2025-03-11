import { describe, expect, test } from 'vitest'
import { RecurringTransaction, recurringTransactionSchema } from '../../types'

import { z } from 'zod'
import { Inserter as ClickHouseInserter } from '../../client'
import { ClickHouse } from '../../index'
import { ClickHouseContainer } from '../../testutil'
import { Inserter } from '../types'
import { insertRecurringTransaction } from './insertRecurringTransaction'
import { insertRecurringTransactions } from './insertRecurringTransactions'

// Helper to format dates in a ClickHouse-compatible way
function formatDateForClickHouse(isoDate: string): string {
  // Convert ISO string to YYYY-MM-DD format
  return isoDate.split('T')[0]
}

// Create an adapter to convert ClickHouse Inserter to Mutations Inserter
function createInserterAdapter(
  clickhouseInserter: ClickHouseInserter,
): Inserter {
  return {
    insert: <T extends z.ZodType>(options: {
      table: string
      values: z.infer<T>[]
      schema: T
    }): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        const inserter = clickhouseInserter.insert({
          table: options.table,
          schema: options.schema,
        })

        inserter(options.values)
          .then((result) => {
            if (result.err) {
              reject(result.err)
            } else {
              resolve()
            }
          })
          .catch(reject)
      })
    },
  }
}

// Mock inserter that always fails for error testing
function createFailingInserter(): Inserter {
  return {
    insert: () => {
      return Promise.reject(new Error('Mock database error'))
    },
  }
}

describe('Recurring Transactions Mutations', () => {
  // Define schema for the query results (simplified)
  const recurringTransactionResultSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    team_id: z.string(),
    title: z.string(),
    amount: z.number(),
    start_date: z.string(),
  })

  describe('Basic Functionality', () => {
    test(
      'insertRecurringTransactions should successfully insert multiple transactions',
      { timeout: 60_000 },
      async (t) => {
        const container = await ClickHouseContainer.start(t)
        const ch = new ClickHouse({ url: container.url() })
        const adapter = createInserterAdapter(ch.inserter)

        const insertFn = insertRecurringTransactions(adapter)

        const now = formatDateForClickHouse(new Date().toISOString())

        // Create valid recurring transactions with proper schema
        const testTransactions = [
          {
            id: 'test-1',
            user_id: 'user-1',
            team_id: 'team-1',
            bank_account_id: 'account-1',
            title: 'Test Transaction 1',
            description: 'Test description',
            amount: 100.0,
            currency: 'USD',

            // Boolean fields as numbers
            is_revenue: 0,
            is_subscription_revenue: 0,
            is_expense: 1,
            is_fixed_cost: 1,
            is_variable_cost: 0,
            is_mrr_component: 0,
            is_automated: 1,
            is_variable: 0,
            skip_weekends: 0,
            adjust_for_holidays: 0,
            allow_execution: 1,
            affect_available_balance: 1,
            notify_on_execution: 1,
            notify_on_failure: 1,
            requires_approval: 0,

            // Required number fields
            initial_mrr_amount: 0,
            current_mrr_amount: 0,
            arr_multiplier: 12,
            initial_account_balance: 1000.0,
            interval: 1,
            execution_count: 0,
            total_executed: 0,
            insufficient_funds_count: 0,
            day_of_month: 1,
            day_of_week: 0,
            week_of_month: 0,
            month_of_year: 0,
            min_balance_required: 0,
            expected_amount: 0,
            allowed_variance: 0,
            confidence_score: 0,

            // String fields
            start_date: '2023-03-01',
            end_date: '2024-03-01',
            next_scheduled_date: '2023-04-01',
            last_executed_at: now,
            reminder_sent_at: now,
            frequency: 'MONTHLY',
            status: 'active',
            department: '',
            project: '',
            cost_center: '',
            gl_account: '',
            vendor_id: '',
            customer_id: '',
            mrr_currency: 'USD',
            transaction_template: '',
            category_slug: '',
            notes: '',
            custom_fields: '',
            target_account_id: '',
            variance_action: '',
            source: '',
            merchant_id: '',
            merchant_name: '',
            transaction_type: '',
            importance_level: 'Medium',
            last_execution_status: '',
            last_execution_error: '',
            overspend_action: 'block',

            // Array fields
            execution_days: [],
            tags: [],
            reminder_days: [],

            // Always required timestamps
            created_at: now,
            updated_at: now,
            last_modified_by: '',
          },
          {
            id: 'test-2',
            user_id: 'user-1',
            team_id: 'team-1',
            bank_account_id: 'account-1',
            title: 'Test Transaction 2',
            description: 'Test description',
            amount: 200.0,
            currency: 'USD',

            // Boolean fields as numbers
            is_revenue: 0,
            is_subscription_revenue: 0,
            is_expense: 1,
            is_fixed_cost: 1,
            is_variable_cost: 0,
            is_mrr_component: 0,
            is_automated: 1,
            is_variable: 0,
            skip_weekends: 0,
            adjust_for_holidays: 0,
            allow_execution: 1,
            affect_available_balance: 1,
            notify_on_execution: 1,
            notify_on_failure: 1,
            requires_approval: 0,

            // Required number fields
            initial_mrr_amount: 0,
            current_mrr_amount: 0,
            arr_multiplier: 12,
            initial_account_balance: 1000.0,
            interval: 1,
            execution_count: 0,
            total_executed: 0,
            insufficient_funds_count: 0,
            day_of_month: 1,
            day_of_week: 0,
            week_of_month: 0,
            month_of_year: 0,
            min_balance_required: 0,
            expected_amount: 0,
            allowed_variance: 0,
            confidence_score: 0,

            // String fields
            start_date: '2023-04-01',
            end_date: '2024-04-01',
            next_scheduled_date: '2023-05-01',
            last_executed_at: now,
            reminder_sent_at: now,
            frequency: 'MONTHLY',
            status: 'active',
            department: '',
            project: '',
            cost_center: '',
            gl_account: '',
            vendor_id: '',
            customer_id: '',
            mrr_currency: 'USD',
            transaction_template: '',
            category_slug: '',
            notes: '',
            custom_fields: '',
            target_account_id: '',
            variance_action: '',
            source: '',
            merchant_id: '',
            merchant_name: '',
            transaction_type: '',
            importance_level: 'Medium',
            last_execution_status: '',
            last_execution_error: '',
            overspend_action: 'block',

            // Array fields
            execution_days: [],
            tags: [],
            reminder_days: [],

            // Always required timestamps
            created_at: now,
            updated_at: now,
            last_modified_by: '',
          },
        ]

        // Validate test data against schema
        for (const transaction of testTransactions) {
          const validationResult =
            recurringTransactionSchema.safeParse(transaction)
          if (!validationResult.success) {
            console.error(
              'Schema validation failed:',
              validationResult.error.format(),
            )
            throw new Error('Schema validation failed')
          }
        }

        const result = await insertFn(
          testTransactions as unknown as RecurringTransaction[],
        )
        console.info('Insert result:', result)
        expect(result.success).toBe(true)

        // Verify data was inserted by querying it back
        const queryFn = ch.querier.query({
          query: `
                        SELECT id, user_id, team_id, title, amount, toString(start_date) as start_date
                        FROM financials.raw_recurring_transactions_v1 
                        WHERE team_id = 'team-1' AND (id = 'test-1' OR id = 'test-2')
                        ORDER BY start_date ASC
                    `,
          schema: recurringTransactionResultSchema,
        })

        const queryResult = await queryFn({})

        expect(queryResult.err).toBeUndefined()
        if (queryResult.val) {
          expect(queryResult.val).toHaveLength(2)
          expect(queryResult.val[0].team_id).toBe('team-1')
          expect(queryResult.val[0].title).toBe('Test Transaction 1')
          expect(queryResult.val[0].amount).toBe(100.0)
          // The dates may include time component, so use substring checking
          expect(queryResult.val[1].start_date).toContain('2023-04-01')
        } else {
          throw new Error('Query result value is undefined')
        }
      },
    )

    test(
      'insertRecurringTransaction should successfully insert a single transaction',
      { timeout: 60_000 },
      async (t) => {
        const container = await ClickHouseContainer.start(t)
        const ch = new ClickHouse({ url: container.url() })
        const adapter = createInserterAdapter(ch.inserter)

        const insertFn = insertRecurringTransaction(adapter)

        const now = formatDateForClickHouse(new Date().toISOString())

        // Create a valid recurring transaction
        const testTransaction = {
          id: 'test-single',
          user_id: 'user-2',
          team_id: 'team-2',
          bank_account_id: 'account-2',
          title: 'Single Test Transaction',
          description: 'Test description',
          amount: 150.0,
          is_revenue: 0,
          is_subscription_revenue: 0,
          is_expense: 1,
          is_fixed_cost: 1,
          is_variable_cost: 0,
          is_mrr_component: 0,
          initial_mrr_amount: 0,
          current_mrr_amount: 0,
          arr_multiplier: 12,
          initial_account_balance: 1000.0,
          frequency: 'MONTHLY',
          interval: 1,
          start_date: '2023-05-01',
          next_scheduled_date: '2023-06-01',
          skip_weekends: 0,
          adjust_for_holidays: 0,
          allow_execution: 1,
          execution_days: [],
          affect_available_balance: 1,
          execution_count: 0,
          total_executed: 0,
          insufficient_funds_count: 0,
          notify_on_execution: 1,
          notify_on_failure: 1,
          status: 'active',
          is_automated: 1,
          requires_approval: 0,
          is_variable: 0,
          created_at: now,
          updated_at: now,
        }

        // Validate test data against schema
        const validationResult =
          recurringTransactionSchema.safeParse(testTransaction)
        if (!validationResult.success) {
          console.error(
            'Schema validation failed:',
            validationResult.error.format(),
          )
          throw new Error('Schema validation failed')
        }

        const result = await insertFn(
          testTransaction as unknown as RecurringTransaction,
        )
        console.info('Insert result:', result)
        expect(result.success).toBe(true)

        // Verify data was inserted by querying it back
        const queryFn = ch.querier.query({
          query: `
                        SELECT id, user_id, team_id, title, amount, toString(start_date) as start_date
                        FROM financials.raw_recurring_transactions_v1 
                        WHERE team_id = 'team-2' AND id = 'test-single'
                    `,
          schema: recurringTransactionResultSchema,
        })

        const queryResult = await queryFn({})

        expect(queryResult.err).toBeUndefined()
        if (queryResult.val) {
          expect(queryResult.val).toHaveLength(1)
          expect(queryResult.val[0].team_id).toBe('team-2')
          expect(queryResult.val[0].title).toBe('Single Test Transaction')
          expect(queryResult.val[0].amount).toBe(150.0)
          expect(queryResult.val[0].start_date).toContain('2023-05-01')
        } else {
          throw new Error('Query result value is undefined')
        }
      },
    )
  })

  describe('Error Handling', () => {
    test(
      'should handle database insertion errors gracefully',
      { timeout: 60_000 },
      async () => {
        // Create a mock inserter that always fails
        const failingInserter = createFailingInserter()
        const insertFn = insertRecurringTransaction(failingInserter)

        const now = formatDateForClickHouse(new Date().toISOString())

        // Create a minimal valid recurring transaction
        const testTransaction = {
          id: 'error-test',
          user_id: 'user-error',
          team_id: 'team-error',
          bank_account_id: 'account-error',
          title: 'Error Test Transaction',
          amount: 100.0,
          start_date: '2023-08-01',
          next_scheduled_date: '2023-09-01',
          created_at: now,
          updated_at: now,
        } as unknown as RecurringTransaction

        const result = await insertFn(testTransaction)

        // Verify that the error is handled properly
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
        expect(result.error).toContain('Mock database error')
      },
    )

    test(
      'should handle unexpected exceptions during insertion',
      { timeout: 60_000 },
      async () => {
        // Create a mock inserter that throws an exception
        const explodingInserter: Inserter = {
          insert: () => {
            throw new Error('Unexpected error')
          },
        }

        const insertFn = insertRecurringTransaction(explodingInserter)

        const now = formatDateForClickHouse(new Date().toISOString())

        // Create a minimal valid recurring transaction
        const testTransaction = {
          id: 'exception-test',
          user_id: 'user-error',
          team_id: 'team-error',
          bank_account_id: 'account-error',
          title: 'Exception Test Transaction',
          amount: 100.0,
          start_date: '2023-08-02',
          next_scheduled_date: '2023-09-02',
          created_at: now,
          updated_at: now,
        } as unknown as RecurringTransaction

        const result = await insertFn(testTransaction)

        // Verify that the exception is caught and handled
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
        expect(result.error).toContain('Unexpected error')
      },
    )
  })
})
