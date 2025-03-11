import { Inserter, MutationResponse } from '../types';

import { RawTransaction } from '../../types';
import { getCurrentTimestamp } from './utils';
import { insertTransaction } from './insertTransaction';

/**
 * Update a transaction in the raw transactions table
 * @param ch - ClickHouse client instance
 * @returns Function to update a transaction
 */
export function updateTransaction(ch: Inserter) {
    const insertTx = insertTransaction(ch);

    return async (transaction: RawTransaction): Promise<MutationResponse> => {
        // Make sure we have the updated_at field set to now
        const updatedTransaction = {
            ...transaction,
            updated_at: getCurrentTimestamp(),
        };

        // In ClickHouse, updates are done as new inserts with the updated data
        // The ReplacingMergeTree engine will replace older versions during merges
        return insertTx(updatedTransaction);
    };
} 