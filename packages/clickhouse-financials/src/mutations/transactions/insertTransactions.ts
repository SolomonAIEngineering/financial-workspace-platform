import { Inserter, MutationResponse } from '../types';
import { RawTransaction, rawTransactionSchema } from '../../types';

/**
 * Insert transactions into the raw transactions table
 * @param ch - ClickHouse client instance
 * @returns Function to insert transactions
 */
export function insertTransactions(ch: Inserter) {
    return async (transactions: RawTransaction[]): Promise<MutationResponse> => {
        try {
            await ch.insert({
                table: 'financials.raw_transactions_v1',
                values: transactions,
                schema: rawTransactionSchema,
            });

            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error inserting transactions:', errorMessage);
            return { success: false, error: errorMessage };
        }
    };
} 