import { Inserter, MutationResponse } from '../types';
import { RawTransaction, rawTransactionSchema } from '../../types';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { generateUUID, getCurrentTimestamp } from './utils';

import { ClickHouse } from '../../index';
import { ClickHouseContainer } from '../../testutil';
import { Inserter as ClickHouseInserter } from '../../client';
import { batchInsertTransactions } from './batchInsertTransactions';
import { z } from 'zod';

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

// Helper function to create test transactions
function createTestTransactions(count: number = 2): any[] {
    const transactions: any[] = [];
    const now = new Date().toISOString();

    for (let i = 0; i < count; i++) {
        transactions.push({
            id: `test-${i + 1}`,
            user_id: 'user-1',
            team_id: 'team-1',
            bank_account_id: 'account-1',
            name: `Test Transaction ${i + 1}`,
            amount: 100.00 * (i + 1),
            iso_currency_code: 'USD',
            date: '2023-06-01',

            // Boolean fields as numbers (0/1)
            pending: 0,
            is_cogs: 0,
            is_opex: 0,
            is_capex: 0,
            is_revenue: 0,
            is_refund: 0,
            is_investment: 0,
            is_owner_draw: 0,
            is_tax: 0,
            is_transfer: 0,
            exclude_from_budget: 0,
            is_recurring: 0,
            is_subscription: 0,
            is_manual: 0,
            is_modified: 0,
            is_reconciled: 0,
            is_split: 0,
            is_internal: 0,
            has_been_notified: 0,
            is_variable_cost: 0,

            // Number fields
            tax_amount: 0,
            tax_rate: 0,
            vat_amount: 0,
            vat_rate: 0,
            split_total: 0,

            // String fields
            merchant_name: '',
            description: '',
            category: '',
            sub_category: '',
            custom_category: '',
            category_icon_url: '',
            merchant_id: '',
            merchant_logo_url: '',
            merchant_category: '',
            merchant_website: '',
            payment_channel: '',
            payment_method: '',
            transaction_type: '',
            transaction_method: '',
            department: '',
            project: '',
            cost_center: '',
            invoice_id: '',
            customer_id: '',
            vendor_id: '',
            accounting_category: '',
            gl_account: '',
            cash_flow_category: '',
            parent_transaction_id: '',

            // Array fields
            tags: [],
            labels: [],

            // Timestamps in ClickHouse format
            created_at: '2023-06-01 00:00:00',
            updated_at: '2023-06-01 00:00:00',
            imported_at: '2023-06-01 00:00:00'
        });
    }

    return transactions;
}

describe('batchInsertTransactions', () => {
    describe('Unit Tests with Mocked Inserter', () => {
        test('should successfully insert transactions with minimum required fields', async () => {
            // Create a mocked inserter that always succeeds
            const mockInserter: Inserter = {
                insert: vi.fn().mockResolvedValue(undefined)
            };

            // Create the function to test
            const insertFn = batchInsertTransactions(mockInserter);

            // Create minimal test transactions with only required fields
            const minimalTransactions: any[] = [
                {
                    user_id: 'user-batch-1',
                    team_id: 'team-batch-1',
                    bank_account_id: 'account-batch-1',
                    name: 'Minimal Transaction 1',
                    amount: 100.00,
                    iso_currency_code: 'USD',
                    date: '2023-06-01'
                },
                {
                    user_id: 'user-batch-1',
                    team_id: 'team-batch-1',
                    bank_account_id: 'account-batch-1',
                    name: 'Minimal Transaction 2',
                    amount: 200.00,
                    iso_currency_code: 'USD',
                    date: '2023-06-02'
                }
            ];

            // Call the function
            const result = await insertFn(minimalTransactions);

            // Verify success
            expect(result.success).toBe(true);

            // Verify inserter was called
            expect(mockInserter.insert).toHaveBeenCalledTimes(1);

            // Verify tags and labels are initialized as empty arrays
            const calledWith = (mockInserter.insert as any).mock.calls[0][0];
            expect(calledWith.values[0].tags).toEqual([]);
            expect(calledWith.values[0].labels).toEqual([]);
        });

        test('should keep custom fields when provided', async () => {
            // Create a mocked inserter that always succeeds
            const mockInserter: Inserter = {
                insert: vi.fn().mockResolvedValue(undefined)
            };

            // Create the function to test
            const insertFn = batchInsertTransactions(mockInserter);

            // Transaction with custom fields
            const customTransaction: any = {
                user_id: 'user-custom-1',
                team_id: 'team-custom-1',
                bank_account_id: 'account-custom-1',
                name: 'Custom Transaction',
                amount: 150.00,
                iso_currency_code: 'USD',
                date: '2023-06-01',
                id: 'custom-id-1',
                tags: ['tag1', 'tag2'],
                labels: ['label1'],
                created_at: '2023-06-01T10:00:00.000Z',
                updated_at: '2023-06-01T10:00:00.000Z'
            };

            // Call the function
            const result = await insertFn([customTransaction]);

            // Verify success
            expect(result.success).toBe(true);

            // Verify custom values are preserved
            const calledWith = (mockInserter.insert as any).mock.calls[0][0];
            expect(calledWith.values[0].id).toBe('custom-id-1');
            expect(calledWith.values[0].tags).toEqual(['tag1', 'tag2']);
            expect(calledWith.values[0].labels).toEqual(['label1']);
            expect(calledWith.values[0].created_at).toBe('2023-06-01T10:00:00.000Z');
            expect(calledWith.values[0].updated_at).toBe('2023-06-01T10:00:00.000Z');
        });
    });

    describe('Error Handling', () => {
        test('should handle database insertion errors', async () => {
            // Create an inserter that rejects
            const failingInserter: Inserter = {
                insert: vi.fn().mockRejectedValue(new Error('Database error'))
            };

            // Create the function to test
            const insertFn = batchInsertTransactions(failingInserter);

            // Minimal transaction
            const transaction: any = {
                user_id: 'user-error-1',
                team_id: 'team-error-1',
                bank_account_id: 'account-error-1',
                name: 'Error Transaction',
                amount: 100.00,
                iso_currency_code: 'USD',
                date: '2023-06-01'
            };

            // Mock console.error to prevent test output pollution
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            // Call the function
            const result = await insertFn([transaction]);

            // Verify error handling
            expect(result.success).toBe(false);
            expect(result.error).toBe('Database error');

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });

        test('should handle empty transaction array', async () => {
            // Create a mocked inserter
            const mockInserter: Inserter = {
                insert: vi.fn().mockResolvedValue(undefined)
            };

            // Create the function to test
            const insertFn = batchInsertTransactions(mockInserter);

            // Call with empty array
            const result = await insertFn([]);

            // Should succeed but still call insert with empty array (current implementation behavior)
            expect(result.success).toBe(true);
            expect(mockInserter.insert).toHaveBeenCalledTimes(1);
            expect(mockInserter.insert).toHaveBeenCalledWith(expect.objectContaining({
                values: []
            }));
        });
    });

    describe('Integration Tests', () => {
        test(
            'should successfully insert transactions with minimum required fields to actual database',
            { timeout: 60_000 },
            async (t) => {
                // Start a real ClickHouse container
                const container = await ClickHouseContainer.start(t);
                const ch = new ClickHouse({ url: container.url() });
                const adapter = createInserterAdapter(ch.inserter);

                // Create the function to test
                const insertFn = batchInsertTransactions(adapter);

                // Create test transactions with all required fields
                const testTransactions = createTestTransactions(2);

                // Customize the transactions for this test
                testTransactions[0].user_id = 'user-batch-1';
                testTransactions[0].team_id = 'team-batch-1';
                testTransactions[0].name = 'Minimal Transaction 1';
                testTransactions[0].amount = 100.00;

                testTransactions[1].user_id = 'user-batch-1';
                testTransactions[1].team_id = 'team-batch-1';
                testTransactions[1].name = 'Minimal Transaction 2';
                testTransactions[1].amount = 200.00;
                testTransactions[1].date = '2023-06-02';

                // Call the function
                const result = await insertFn(testTransactions);

                // Verify success
                expect(result.success).toBe(true);

                // Query to verify data was inserted
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
                        WHERE team_id = 'team-batch-1' AND user_id = 'user-batch-1'
                        ORDER BY date ASC
                    `,
                    schema: queryResultSchema,
                });

                const queryResult = await queryFn({});

                expect(queryResult.err).toBeUndefined();
                if (queryResult.val) {
                    expect(queryResult.val).toHaveLength(2);
                    // Verify first transaction
                    expect(queryResult.val[0].user_id).toBe('user-batch-1');
                    expect(queryResult.val[0].team_id).toBe('team-batch-1');
                    expect(queryResult.val[0].name).toBe('Minimal Transaction 1');
                    expect(queryResult.val[0].amount).toBe(100.00);
                    expect(queryResult.val[0].date).toContain('2023-06-01');

                    // Verify second transaction
                    expect(queryResult.val[1].user_id).toBe('user-batch-1');
                    expect(queryResult.val[1].team_id).toBe('team-batch-1');
                    expect(queryResult.val[1].name).toBe('Minimal Transaction 2');
                    expect(queryResult.val[1].amount).toBe(200.00);
                    expect(queryResult.val[1].date).toContain('2023-06-02');
                } else {
                    throw new Error('Query result value is undefined');
                }
            }
        );
    });
}); 