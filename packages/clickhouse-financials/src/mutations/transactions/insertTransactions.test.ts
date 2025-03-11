import { Inserter, MutationResponse } from '../types';
import { RawTransaction, rawTransactionSchema } from '../../types';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ClickHouse } from '../../index';
import { ClickHouseContainer } from '../../testutil';
import { Inserter as ClickHouseInserter } from '../../client';
import { insertTransactions } from './insertTransactions';

// Helper to format dates in a ClickHouse-compatible way
function formatDateForClickHouse(isoDate: string): string {
    return isoDate.split('T')[0];
}

// Create an adapter to convert ClickHouse Inserter to Mutations Inserter
function createInserterAdapter(clickhouseInserter: ClickHouseInserter): Inserter {
    return {
        insert: <T extends any>(options: {
            table: string;
            values: T[];
            schema: any;
        }): Promise<void> => {
            return new Promise<void>((resolve, reject) => {
                const inserter = clickhouseInserter.insert({
                    table: options.table,
                    schema: options.schema
                });

                inserter(options.values)
                    .then(result => {
                        if (result.err) {
                            reject(result.err);
                        } else {
                            resolve();
                        }
                    })
                    .catch(reject);
            });
        }
    };
}

describe('insertTransactions', () => {
    // Helper function to create test transactions
    function createTestTransactions(count: number = 2): any[] {
        const transactions: any[] = [];

        for (let i = 0; i < count; i++) {
            transactions.push({
                // Primary identifiers
                id: `test-${i + 1}`,
                user_id: 'user-1',
                team_id: 'team-1',
                bank_account_id: 'account-1',
                plaid_transaction_id: `plaid-tx-${i + 1}`,

                // Transaction details
                amount: 100.00 * (i + 1),
                iso_currency_code: 'USD',
                date: '2023-06-01',
                name: `Test Transaction ${i + 1}`,
                merchant_name: 'Test Merchant',
                description: 'Test description',
                pending: 0,

                // Business categorization
                category: 'Business',
                sub_category: 'Software',
                custom_category: '',
                category_icon_url: '',

                // Business expense classification
                is_cogs: 0,
                is_opex: 1,
                is_capex: 0,
                is_revenue: 0,
                is_refund: 0,
                is_investment: 0,
                is_owner_draw: 0,
                is_tax: 0,
                is_transfer: 0,

                // Merchant data
                merchant_id: 'merchant-1',
                merchant_logo_url: '',
                merchant_category: 'Software',
                merchant_website: 'https://example.com',

                // Payment metadata
                payment_channel: 'online',
                payment_method: 'credit_card',
                transaction_type: 'purchase',
                transaction_method: 'online',

                // Financial attributes
                tax_amount: 0,
                tax_rate: 0,
                vat_amount: 0,
                vat_rate: 0,

                // Business metadata
                department: 'Engineering',
                project: 'Project A',
                cost_center: 'CC001',
                invoice_id: '',
                customer_id: '',
                vendor_id: 'vendor-1',

                // Accounting classification
                accounting_category: 'Software Expense',
                gl_account: '5000',

                // Cash flow classification
                cash_flow_category: 'Operating Expense',

                // Flags
                exclude_from_budget: 0,
                is_recurring: 0,
                recurring_transaction_id: '',
                is_subscription: 0,
                is_manual: 0,
                is_modified: 0,
                is_reconciled: 0,

                // Tags and organization
                tags: ['software', 'expense'],
                labels: ['approved'],

                // Split transaction support
                parent_transaction_id: '',
                is_split: 0,
                split_total: 0,

                // Timestamps
                created_at: '2023-06-01 00:00:00',
                updated_at: '2023-06-01 00:00:00'
            });
        }

        return transactions;
    }

    describe('Integration Tests', () => {
        test(
            'should successfully insert transactions to actual database',
            { timeout: 60_000 },
            async (t) => {
                // Start a real ClickHouse container
                const container = await ClickHouseContainer.start(t);
                const ch = new ClickHouse({ url: container.url() });
                const adapter = createInserterAdapter(ch.inserter);

                // Create the function to test
                const insertFn = insertTransactions(adapter);

                // Create test transactions
                const testTransactions = createTestTransactions(2);

                // Call the function
                const result = await insertFn(testTransactions);

                // Verify result
                expect(result.success).toBe(true);
                expect(result.error).toBeUndefined();

                // Verify data was inserted by querying it back
                const queryResultSchema = rawTransactionSchema.pick({
                    id: true,
                    user_id: true,
                    team_id: true,
                    name: true,
                    amount: true,
                    date: true
                });

                const queryFn = ch.querier.query({
                    query: `
                        SELECT id, user_id, team_id, name, amount, toString(date) as date
                        FROM financials.raw_transactions_v1 
                        WHERE team_id = 'team-1' AND (id = 'test-1' OR id = 'test-2')
                        ORDER BY id ASC
                    `,
                    schema: queryResultSchema,
                });

                const queryResult = await queryFn({});

                expect(queryResult.err).toBeUndefined();
                if (queryResult.val) {
                    expect(queryResult.val).toHaveLength(2);
                    expect(queryResult.val[0].id).toBe('test-1');
                    expect(queryResult.val[1].id).toBe('test-2');
                    expect(queryResult.val[0].name).toBe('Test Transaction 1');
                    expect(queryResult.val[1].name).toBe('Test Transaction 2');
                    expect(queryResult.val[0].amount).toBe(100.00);
                    expect(queryResult.val[1].amount).toBe(200.00);
                } else {
                    throw new Error('Query result value is undefined');
                }
            }
        );

        test(
            'should handle empty array with actual database',
            { timeout: 60_000 },
            async (t) => {
                // Start a real ClickHouse container
                const container = await ClickHouseContainer.start(t);
                const ch = new ClickHouse({ url: container.url() });
                const adapter = createInserterAdapter(ch.inserter);

                // Create the function to test
                const insertFn = insertTransactions(adapter);

                // Call with empty array
                const result = await insertFn([]);

                // Empty array should still succeed
                expect(result.success).toBe(true);
            }
        );
    });

    describe('Error Handling', () => {
        test(
            'should handle database errors',
            { timeout: 60_000 },
            async () => {
                // Create a failing adapter
                const failingAdapter: Inserter = {
                    insert: () => Promise.reject(new Error('Mock database error'))
                };

                // Create the function to test
                const insertFn = insertTransactions(failingAdapter);

                // Create test transactions
                const testTransactions = createTestTransactions(1);

                // Mock console.error to prevent test output pollution
                const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

                // Call the function
                const result = await insertFn(testTransactions);

                // Verify error handling
                expect(result.success).toBe(false);
                expect(result.error).toBe('Mock database error');

                // Restore console.error
                consoleErrorSpy.mockRestore();
            }
        );

        test(
            'should handle unexpected exceptions during insertion',
            async () => {
                // Create an adapter that throws
                const throwingAdapter: Inserter = {
                    insert: () => { throw new Error('Unexpected error'); }
                };

                // Create the function to test
                const insertFn = insertTransactions(throwingAdapter);

                // Create test transactions
                const testTransactions = createTestTransactions(1);

                // Mock console.error to prevent test output pollution
                const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

                // Call the function
                const result = await insertFn(testTransactions);

                // Verify error handling
                expect(result.success).toBe(false);
                expect(result.error).toBe('Unexpected error');

                // Restore console.error
                consoleErrorSpy.mockRestore();
            }
        );
    });
}); 