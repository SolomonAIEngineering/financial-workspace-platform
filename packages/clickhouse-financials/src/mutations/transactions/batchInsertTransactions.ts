import { Inserter, MutationResponse } from '../types';
import { generateUUID, getCurrentTimestamp } from './utils';

import { rawTransactionSchema } from '../../types';
import { z } from 'zod';

/**
 * Batch insert transactions with validation but minimal required fields
 * @param ch - ClickHouse client instance
 * @returns Function to insert transactions with partial data
 */
export function batchInsertTransactions(ch: Inserter) {
    // Define a partial schema with required fields
    const partialTransactionSchema = rawTransactionSchema.partial({
        id: true,
        merchant_id: true,
        merchant_logo_url: true,
        merchant_category: true,
        merchant_website: true,
        created_at: true,
        updated_at: true,
    }).required({
        user_id: true,
        team_id: true,
        bank_account_id: true,
        amount: true,
        iso_currency_code: true,
        date: true,
        name: true,
    });

    type PartialTransaction = z.infer<typeof partialTransactionSchema>;

    return async (transactions: PartialTransaction[]): Promise<MutationResponse> => {
        try {
            // Add timestamps and generate IDs if missing
            const enrichedTransactions = transactions.map(t => ({
                ...t,
                id: t.id || generateUUID(),
                created_at: t.created_at || getCurrentTimestamp(),
                updated_at: t.updated_at || getCurrentTimestamp(),
                tags: t.tags || [],
                labels: t.labels || [],
            }));

            await ch.insert({
                table: 'financials.raw_transactions_v1',
                values: enrichedTransactions,
                schema: rawTransactionSchema,
            });

            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error batch inserting transactions:', errorMessage);
            return { success: false, error: errorMessage };
        }
    };
} 