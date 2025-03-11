import { Inserter, MutationResponse } from '../types'

import { RawTransaction } from '../../types'
import { insertTransactions } from './insertTransactions'

/**
 * Insert a single transaction into the raw transactions table
 * @param ch - ClickHouse client instance
 * @returns Function to insert a single transaction
 */
export function insertTransaction(ch: Inserter) {
  const insertMultiple = insertTransactions(ch)

  return async (transaction: RawTransaction): Promise<MutationResponse> => {
    return insertMultiple([transaction])
  }
}
