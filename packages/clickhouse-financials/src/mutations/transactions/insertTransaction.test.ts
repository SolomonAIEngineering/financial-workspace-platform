import { describe, expect, test } from 'vitest'
import { rawTransactionSchema } from '../../types'

import { Inserter as ClickHouseInserter } from '../../client'
import { ClickHouse } from '../../index'
import { ClickHouseContainer } from '../../testutil'
import { Inserter } from '../types'
import { insertTransaction } from './insertTransaction'

// Create an adapter to convert ClickHouse Inserter to Mutations Inserter
function createInserterAdapter(
  clickhouseInserter: ClickHouseInserter,
): Inserter {
  return {
    insert: <T extends any>(options: {
      table: string
      values: T[]
      schema: any
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

// Helper function to create test transactions
function createTestTransaction(overrides: Partial<any> = {}): any {
  const transaction = {
    id: `test-${Date.now()}`,
    user_id: 'user-1',
    team_id: 'team-1',
    bank_account_id: 'account-1',
    name: 'Test Transaction',
    amount: 100.0,
    iso_currency_code: 'USD',
    date: '2023-06-01',

    // Boolean fields as numbers (0/1)
    pending: 0,
    is_cogs: 0,
    is_opex: 0,
    is_capex: 0,
    is_revenue: 0,
    is_refund: 0,
    is_investment: 0,
    is_owner_draw: 0,
    is_tax: 0,
    is_transfer: 0,
    exclude_from_budget: 0,
    is_recurring: 0,
    is_subscription: 0,
    is_manual: 0,
    is_modified: 0,
    is_reconciled: 0,
    is_split: 0,
    is_internal: 0,
    has_been_notified: 0,
    is_variable_cost: 0,

    // Number fields
    tax_amount: 0,
    tax_rate: 0,
    vat_amount: 0,
    vat_rate: 0,
    split_total: 0,

    // String fields
    merchant_name: '',
    description: '',
    category: '',
    sub_category: '',
    custom_category: '',
    category_icon_url: '',
    merchant_id: '',
    merchant_logo_url: '',
    merchant_category: '',
    merchant_website: '',
    payment_channel: '',
    payment_method: '',
    transaction_type: '',
    transaction_method: '',
    department: '',
    project: '',
    cost_center: '',
    invoice_id: '',
    customer_id: '',
    vendor_id: '',
    accounting_category: '',
    gl_account: '',
    cash_flow_category: '',
    parent_transaction_id: '',

    // Array fields
    tags: [],
    labels: [],

    // Timestamps in ClickHouse format
    created_at: '2023-06-01 00:00:00',
    updated_at: '2023-06-01 00:00:00',
    imported_at: '2023-06-01 00:00:00',
  }

  return { ...transaction, ...overrides }
}

describe('insertTransaction', () => {
  describe('Integration Tests', () => {
    test(
      'should successfully insert a single transaction to the database',
      { timeout: 60_000 },
      async (t) => {
        // Start a real ClickHouse container
        const container = await ClickHouseContainer.start(t)
        const ch = new ClickHouse({ url: container.url() })
        const adapter = createInserterAdapter(ch.inserter)

        // Create the insertTransaction function with the adapter
        const insertTx = insertTransaction(adapter)

        // Create a unique transaction ID for this test
        const transactionId = `test-insert-${Date.now()}`

        // Create a test transaction
        const testTransaction = createTestTransaction({
          id: transactionId,
          user_id: 'user-insert',
          team_id: 'team-insert',
          name: 'Test Insert Transaction',
          amount: 150.0,
        })

        // Call the function with the transaction
        const result = await insertTx(testTransaction)

        // Verify success
        expect(result.success).toBe(true)

        // Query to verify the transaction was inserted
        const queryResultSchema = rawTransactionSchema.pick({
          id: true,
          user_id: true,
          team_id: true,
          name: true,
          amount: true,
        })

        const queryFn = ch.querier.query({
          query: `
                        SELECT id, user_id, team_id, name, amount
                        FROM financials.raw_transactions_v1 
                        WHERE id = '${transactionId}'
                    `,
          schema: queryResultSchema,
        })

        const queryResult = await queryFn({})

        // Verify the transaction was inserted in the database
        expect(queryResult.err).toBeUndefined()
        if (queryResult.val) {
          expect(queryResult.val).toHaveLength(1)
          expect(queryResult.val[0].id).toBe(transactionId)
          expect(queryResult.val[0].user_id).toBe('user-insert')
          expect(queryResult.val[0].team_id).toBe('team-insert')
          expect(queryResult.val[0].name).toBe('Test Insert Transaction')
          expect(queryResult.val[0].amount).toBe(150.0)
        } else {
          throw new Error('Query result value is undefined')
        }
      },
    )

    test('should handle errors gracefully', { timeout: 60_000 }, async (t) => {
      // Start a real ClickHouse container
      const container = await ClickHouseContainer.start(t)
      const ch = new ClickHouse({ url: container.url() })
      const adapter = createInserterAdapter(ch.inserter)

      // Create the insertTransaction function with the adapter
      const insertTx = insertTransaction(adapter)

      // Create an invalid transaction (missing required fields)
      const invalidTransaction = {
        id: 'invalid-transaction',
        // Missing required fields
      }

      // Call the function with the invalid transaction
      const result = await insertTx(invalidTransaction as any)

      // Verify error handling
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
