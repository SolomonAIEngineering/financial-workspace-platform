import { Inserter, MutationResponse } from '../types';
import { generateUUID, getCurrentTimestamp } from './utils';

import { recurringTransactionSchema } from '../../types';
import { z } from 'zod';

/**
 * Batch insert recurring transactions with validation but minimal required fields
 * Useful for creating recurring rules from detected patterns
 * @param ch - ClickHouse client instance
 * @returns Function to insert recurring transactions with partial data
 */
export function batchInsertRecurringTransactions(ch: Inserter) {
    // Define a partial schema with required fields
    const partialRecurringSchema = recurringTransactionSchema.partial({
        id: true,
        merchant_id: true,
        execution_days: true,
        transaction_template: true,
        created_at: true,
        updated_at: true,
    }).required({
        user_id: true,
        team_id: true,
        bank_account_id: true,
        title: true,
        amount: true,
        frequency: true,
        start_date: true,
    });

    type PartialRecurringTransaction = z.infer<typeof partialRecurringSchema>;

    return async (transactions: PartialRecurringTransaction[]): Promise<MutationResponse> => {
        try {
            // Add timestamps and generate IDs if missing
            const enrichedTransactions = transactions.map(t => ({
                ...t,
                id: t.id || generateUUID(),
                created_at: t.created_at || getCurrentTimestamp(),
                updated_at: t.updated_at || getCurrentTimestamp(),
                status: t.status || 'active',
                execution_days: t.execution_days || [],
                tags: t.tags || [],
            }));

            await ch.insert({
                table: 'financials.raw_recurring_transactions_v1',
                values: enrichedTransactions,
                schema: recurringTransactionSchema,
            });

            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error batch inserting recurring transactions:', errorMessage);
            return { success: false, error: errorMessage };
        }
    };
} 