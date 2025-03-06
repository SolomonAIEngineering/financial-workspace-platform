import { describe, expect, it, vi } from 'vitest'

import { transform } from './transform'
import type { Transaction } from './types'

// Mock uuid module
vi.mock('uuid', () => ({
  v4: () => 'mocked-uuid',
}))

describe('transform', () => {
  const baseTransaction: Transaction = {
    date: '2024-03-15T12:00:00Z',
    description: 'Test Transaction',
    amount: '1234.56',
    teamId: 'team_123',
    bankAccountId: 'account_456',
    currency: 'USD',
  }

  const baseParams = {
    transaction: baseTransaction,
    inverted: false,
    timezone: 'UTC',
  }

  it('should transform a basic transaction correctly', () => {
    const result = transform(baseParams)

    expect(result).toEqual({
      internal_id: 'team_123_mocked-uuid',
      team_id: 'team_123',
      status: 'posted',
      method: 'other',
      date: '2024-03-15',
      amount: 1234.56,
      name: 'Test Transaction',
      manual: true,
      category_slug: 'income',
      bank_account_id: 'account_456',
      currency: 'USD',
    })
  })

  it('should handle inverted amounts', () => {
    const result = transform({
      ...baseParams,
      inverted: true,
    })

    expect(result.amount).toBe(-1234.56)
    expect(result.category_slug).toBeNull()
  })

  it('should handle date adjustments', () => {
    const result = transform({
      ...baseParams,
      dateAdjustment: 1,
    })

    expect(result.date).toBe('2024-03-16')
  })

  it('should handle different number formats', () => {
    const testCases = [
      { input: '1,234.56', expected: 1234.56 },
      { input: '1.234,56', expected: 1234.56 },
      { input: '1234.56', expected: 1234.56 },
      { input: '1234', expected: 1234 },
    ]

    testCases.forEach(({ input, expected }) => {
      const result = transform({
        ...baseParams,
        transaction: {
          ...baseTransaction,
          amount: input,
        },
      })

      expect(result.amount).toBe(expected)
    })
  })

  it('should handle different date formats', () => {
    const testCases = [
      { input: '2024-03-15', expected: '2024-03-15' },
      { input: '15/03/2024', expected: '2024-03-15' },
      { input: '03/15/2024', expected: '2024-03-15' },
      { input: '15.03.2024', expected: '2024-03-15' },
      { input: '2024-03-15T12:00:00', expected: '2024-03-15' },
    ]

    testCases.forEach(({ input, expected }) => {
      const result = transform({
        ...baseParams,
        transaction: {
          ...baseTransaction,
          date: input,
        },
      })

      expect(result.date).toBe(expected)
    })
  })

  it('should handle different timezones', () => {
    const result = transform({
      ...baseParams,
      timezone: 'Europe/London',
      transaction: {
        ...baseTransaction,
        date: '2024-03-15T23:00:00Z',
      },
    })

    expect(result.date).toBe('2024-03-15')
  })

  it('should handle missing or empty description', () => {
    const result = transform({
      ...baseParams,
      transaction: {
        ...baseTransaction,
        description: '',
      },
    })

    expect(result.name).toBeFalsy()
  })

  it('should format description in capital case', () => {
    const testCases = [
      { input: 'test transaction', expected: 'Test Transaction' },
      { input: 'TEST_TRANSACTION', expected: 'Test Transaction' },
      { input: 'test-transaction', expected: 'Test Transaction' },
      { input: 'testTransaction', expected: 'Test Transaction' },
    ]

    testCases.forEach(({ input, expected }) => {
      const result = transform({
        ...baseParams,
        transaction: {
          ...baseTransaction,
          description: input,
        },
      })

      expect(result.name).toBe(expected)
    })
  })

  it('should set category_slug based on amount', () => {
    const testCases = [
      { amount: '100', inverted: false, expected: 'income' },
      { amount: '100', inverted: true, expected: null },
      { amount: '-100', inverted: false, expected: null },
      { amount: '-100', inverted: true, expected: 'income' },
    ]

    testCases.forEach(({ amount, inverted, expected }) => {
      const result = transform({
        ...baseParams,
        inverted,
        transaction: {
          ...baseTransaction,
          amount,
        },
      })

      expect(result.category_slug).toBe(expected)
    })
  })

  it('should maintain consistent output structure', () => {
    const result = transform(baseParams)

    const expectedKeys = [
      'internal_id',
      'team_id',
      'status',
      'method',
      'date',
      'amount',
      'name',
      'manual',
      'category_slug',
      'bank_account_id',
      'currency',
    ]

    expect(Object.keys(result).sort()).toEqual(expectedKeys.sort())
  })
})
