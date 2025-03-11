import { describe, expect, test, vi } from 'vitest'
import { recurringTransactionSchema } from '../../types'
import { Inserter } from '../types'

import { z } from 'zod'
import { Inserter as ClickHouseInserter } from '../../client'
import { batchInsertRecurringTransactions } from './batchInsertRecurringTransactions'

// Helper to format dates in a ClickHouse-compatible way
function formatDateForClickHouse(isoDate: string): string {
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

// Define the type that batchInsertRecurringTransactions uses internally
const partialRecurringSchema = recurringTransactionSchema
  .partial({
    id: true,
    merchant_id: true,
    execution_days: true,
    transaction_template: true,
    created_at: true,
    updated_at: true,
  })
  .required({
    user_id: true,
    team_id: true,
    bank_account_id: true,
    title: true,
    amount: true,
    frequency: true,
    start_date: true,
  })

type PartialRecurringTransaction = z.infer<typeof partialRecurringSchema>

describe('batchInsertRecurringTransactions', () => {
  describe('Unit Tests with Mocked Inserter', () => {
    test('should successfully insert transactions with minimum required fields', async () => {
      // Create a mocked inserter that always succeeds
      const mockInserter: Inserter = {
        insert: vi.fn().mockResolvedValue(undefined),
      }

      // Create the function to test
      const insertFn = batchInsertRecurringTransactions(mockInserter)

      // Create minimal test transactions with only required fields
      const minimalTransactions = [
        {
          user_id: 'user-batch-1',
          team_id: 'team-batch-1',
          bank_account_id: 'account-batch-1',
          title: 'Minimal Transaction 1',
          amount: 100.0,
          frequency: 'MONTHLY',
          start_date: '2023-06-01',
        },
        {
          user_id: 'user-batch-1',
          team_id: 'team-batch-1',
          bank_account_id: 'account-batch-1',
          title: 'Minimal Transaction 2',
          amount: 200.0,
          frequency: 'WEEKLY',
          start_date: '2023-07-01',
        },
      ] as any[] // Type assertion to bypass type checking

      // Call the function
      const result = await insertFn(minimalTransactions)

      // Verify result
      expect(result.success).toBe(true)

      // Verify insert was called with enriched transactions
      expect(mockInserter.insert).toHaveBeenCalledTimes(1)
      expect(mockInserter.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          table: 'financials.raw_recurring_transactions_v1',
        }),
      )

      // Verify the transactions were enriched before being passed to the inserter
      const insertCall = vi.mocked(mockInserter.insert).mock.calls[0][0]
      const passedValues = insertCall.values

      // Check that IDs and other fields were auto-generated
      expect(passedValues).toHaveLength(2)
      expect(passedValues[0].id).toBeTruthy()
      expect(passedValues[0].created_at).toBeTruthy()
      expect(passedValues[0].updated_at).toBeTruthy()
      expect(passedValues[0].status).toBe('active')
      expect(passedValues[0].title).toBe('Minimal Transaction 1')
      expect(passedValues[1].title).toBe('Minimal Transaction 2')
    })

    test('should keep custom fields when provided', async () => {
      // Create a mocked inserter that always succeeds
      const mockInserter: Inserter = {
        insert: vi.fn().mockResolvedValue(undefined),
      }

      // Create the function to test
      const insertFn = batchInsertRecurringTransactions(mockInserter)

      // Transaction with custom fields
      const customId = 'custom-id-123'
      const transactionWithCustomFields = {
        id: customId,
        user_id: 'user-custom',
        team_id: 'team-custom',
        bank_account_id: 'account-custom',
        title: 'Custom Transaction',
        amount: 300.0,
        frequency: 'MONTHLY',
        start_date: '2023-08-01',
        status: 'paused',
      } as any // Type assertion to bypass type checking

      const result = await insertFn([transactionWithCustomFields])
      expect(result.success).toBe(true)

      // Verify insert was called with enriched transactions
      expect(mockInserter.insert).toHaveBeenCalledTimes(1)

      // Verify the custom values were preserved
      const insertCall = vi.mocked(mockInserter.insert).mock.calls[0][0]
      const passedValues = insertCall.values

      expect(passedValues).toHaveLength(1)
      expect(passedValues[0].id).toBe(customId) // Original ID kept
      expect(passedValues[0].status).toBe('paused')
      expect(passedValues[0].title).toBe('Custom Transaction')
    })
  })

  describe('Error Handling', () => {
    test('should handle database insertion errors', async () => {
      // Create a failing adapter
      const failingAdapter: Inserter = {
        insert: () => Promise.reject(new Error('Mock database error')),
      }

      // Create the function to test
      const insertFn = batchInsertRecurringTransactions(failingAdapter)

      const testTransaction = {
        user_id: 'user-error',
        team_id: 'team-error',
        bank_account_id: 'account-error',
        title: 'Error Transaction',
        amount: 100.0,
        frequency: 'MONTHLY',
        start_date: '2023-08-01',
      } as any // Type assertion to bypass type checking

      // Mock console.error to prevent test output pollution
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const result = await insertFn([testTransaction])

      // Verify the error is handled
      expect(result.success).toBe(false)
      expect(result.error).toBe('Mock database error')

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error batch inserting recurring transactions:',
        'Mock database error',
      )

      // Restore console.error
      consoleErrorSpy.mockRestore()
    })

    test('should handle empty transaction array', async () => {
      // Create a mocked inserter
      const mockInserter: Inserter = {
        insert: vi.fn().mockResolvedValue(undefined),
      }

      // Create the function to test
      const insertFn = batchInsertRecurringTransactions(mockInserter)

      const result = await insertFn([])

      // Empty array should still succeed
      expect(result.success).toBe(true)

      // Insert should still be called with an empty array
      expect(mockInserter.insert).toHaveBeenCalledTimes(1)
      const insertCall = vi.mocked(mockInserter.insert).mock.calls[0][0]
      expect(insertCall.values).toEqual([])
    })
  })
})
