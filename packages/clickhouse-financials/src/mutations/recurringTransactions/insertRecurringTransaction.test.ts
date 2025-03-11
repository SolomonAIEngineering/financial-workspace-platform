import * as insertRecurringTransactionsModule from './insertRecurringTransactions'

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { RecurringTransaction } from '../../types'
import { Inserter, MutationResponse } from '../types'

import { Inserter as ClickHouseInserter } from '../../client'
import { insertRecurringTransaction } from './insertRecurringTransaction'

// Helper to format dates in a ClickHouse-compatible way
function formatDateForClickHouse(isoDate: string): string {
  return isoDate.split('T')[0]
}

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

describe('insertRecurringTransaction', () => {
  describe('Unit Tests', () => {
    // Variables for the unit tests
    let mockInserter: Inserter
    let mockInsertMultiple: ReturnType<typeof vi.fn>
    let originalInsertRecurringTransactions: typeof insertRecurringTransactionsModule.insertRecurringTransactions

    beforeEach(() => {
      // Save the original implementation
      originalInsertRecurringTransactions =
        insertRecurringTransactionsModule.insertRecurringTransactions

      // Create a mock inserter
      mockInserter = {} as Inserter

      // Create a mock for the insertRecurringTransactions function
      mockInsertMultiple = vi.fn()
      vi.spyOn(
        insertRecurringTransactionsModule,
        'insertRecurringTransactions',
      ).mockImplementation(() => {
        return mockInsertMultiple as unknown as (
          transactions: RecurringTransaction[],
        ) => Promise<MutationResponse>
      })
    })

    afterEach(() => {
      // Restore the original implementation
      vi.spyOn(
        insertRecurringTransactionsModule,
        'insertRecurringTransactions',
      ).mockRestore()
    })

    test('should call insertRecurringTransactions with an array containing the single transaction', async () => {
      // Setup a successful response
      mockInsertMultiple.mockResolvedValue({ success: true })

      // Create the function to test
      const insertFn = insertRecurringTransaction(mockInserter)

      // Create a test transaction
      const testTransaction: RecurringTransaction = {
        id: 'test-1',
        user_id: 'user-1',
        team_id: 'team-1',
        bank_account_id: 'account-1',
        title: 'Test Transaction',
        amount: 100.0,
        start_date: '2023-06-01',
        created_at: '2023-06-01T12:00:00.000Z',
        updated_at: '2023-06-01T12:00:00.000Z',
      } as RecurringTransaction

      // Call the function
      const result = await insertFn(testTransaction)

      // Verify insertRecurringTransactions was called correctly
      expect(
        insertRecurringTransactionsModule.insertRecurringTransactions,
      ).toHaveBeenCalledWith(mockInserter)
      expect(mockInsertMultiple).toHaveBeenCalledWith([testTransaction])

      // Verify the result is passed through
      expect(result).toEqual({ success: true })
    })

    test('should pass through error responses from insertRecurringTransactions', async () => {
      // Setup an error response
      mockInsertMultiple.mockResolvedValue({
        success: false,
        error: 'Test error message',
      })

      // Create the function to test
      const insertFn = insertRecurringTransaction(mockInserter)

      // Create a test transaction
      const testTransaction = {
        id: 'test-error',
        user_id: 'user-1',
        team_id: 'team-1',
      } as RecurringTransaction

      // Call the function
      const result = await insertFn(testTransaction)

      // Verify error is passed through
      expect(result).toEqual({
        success: false,
        error: 'Test error message',
      })
    })
  })
})
