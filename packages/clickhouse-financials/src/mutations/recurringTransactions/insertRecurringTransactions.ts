import { Inserter, MutationResponse } from '../types';
import { RecurringTransaction, recurringTransactionSchema } from '../../types';

/**
 * Insert recurring transactions into the raw recurring transactions table
 * @param ch - ClickHouse client instance
 * @returns Function to insert recurring transactions
 */
export function insertRecurringTransactions(ch: Inserter) {
    return async (transactions: RecurringTransaction[]): Promise<MutationResponse> => {
        try {
            await ch.insert({
                table: 'financials.raw_recurring_transactions_v1',
                values: transactions,
                schema: recurringTransactionSchema,
            });

            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error inserting recurring transactions:', errorMessage);
            return { success: false, error: errorMessage };
        }
    };
} 