import { formatAmountValue, formatDate } from './utils'

import type { Transaction } from './types'
import { capitalCase } from 'change-case'
import { v4 as uuidv4 } from 'uuid'

/**
 * Transforms a raw transaction into a standardized format with additional computed properties.
 *
 * @function transform
 *
 * @param {Object} params - The parameters for transformation
 * @param {Transaction} params.transaction - The transaction to transform
 * @param {boolean} params.inverted - Whether to invert the amount (multiply by -1)
 * @param {string} params.timezone - The timezone to use for date formatting
 * @param {number} [params.dateAdjustment] - Optional number of days to adjust the date by
 *
 * @returns {Object} A transformed transaction with standardized properties
 *
 * @example
 * ```typescript
 * const rawTransaction: Transaction = {
 *   date: '2024-03-15',
 *   description: 'Monthly Revenue',
 *   amount: '1500.00',
 *   teamId: 'team_123',
 *   bankAccountId: 'account_456',
 *   currency: 'USD'
 * };
 *
 * const result = transform({
 *   transaction: rawTransaction,
 *   inverted: false,
 *   timezone: 'America/New_York',
 *   dateAdjustment: 1
 * });
 *
 * // Result:
 * // {
 * //   internal_id: 'team_123_uuid...',
 * //   team_id: 'team_123',
 * //   status: 'posted',
 * //   method: 'other',
 * //   date: '2024-03-16',
 * //   amount: 1500.00,
 * //   name: 'Monthly Revenue',
 * //   manual: true,
 * //   category_slug: 'income',
 * //   bank_account_id: 'account_456',
 * //   currency: 'USD'
 * // }
 * ```
 */
export function transform({
  transaction,
  inverted,
  timezone,
  dateAdjustment,
}: {
  transaction: Transaction
  inverted: boolean
  timezone: string
  dateAdjustment?: number
}) {
  return {
    internal_id: `${transaction.teamId}_${uuidv4()}`,
    team_id: transaction.teamId,
    status: 'posted',
    method: 'other',
    date: formatDate(transaction.date, timezone, dateAdjustment),
    amount: formatAmountValue({ amount: transaction.amount, inverted }),
    name: transaction?.description && capitalCase(transaction.description),
    manual: true,
    category_slug:
      formatAmountValue({ amount: transaction.amount, inverted }) > 0
        ? 'income'
        : null,
    bank_account_id: transaction.bankAccountId,
    currency: transaction.currency,
  }
}
