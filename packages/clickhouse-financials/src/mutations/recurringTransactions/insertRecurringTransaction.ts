import { Inserter, MutationResponse } from '../types'

import { RecurringTransaction } from '../../types'
import { insertRecurringTransactions } from './insertRecurringTransactions'

/**
 * Insert a single recurring transaction into the raw recurring transactions table
 * @param ch - ClickHouse client instance
 * @returns Function to insert a single recurring transaction
 */
export function insertRecurringTransaction(ch: Inserter) {
  const insertMultiple = insertRecurringTransactions(ch)

  return async (
    transaction: RecurringTransaction,
  ): Promise<MutationResponse> => {
    return insertMultiple([transaction])
  }
}
