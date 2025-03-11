import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest';
import { insertRecurringTransactions } from './insertRecurringTransactions';
import { Inserter, MutationResponse } from '../types';
import { RecurringTransaction, recurringTransactionSchema } from '../../types';

import { ClickHouse } from '../../index';
import { ClickHouseContainer } from '../../testutil';
import { Inserter as ClickHouseInserter } from '../../client';

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

describe('insertRecurringTransactions', () => {
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
                title: `Test Transaction ${i + 1}`,
                description: 'Test description',
                amount: 100.00 * (i + 1),
                currency: 'USD',

                // Boolean fields as numbers
                is_revenue: 0,
                is_subscription_revenue: 0,
                is_expense: 1,
                is_fixed_cost: 1,
                is_variable_cost: 0,
                is_mrr_component: 0,
                is_automated: 1,
                is_variable: 0,
                skip_weekends: 0,
                adjust_for_holidays: 0,
                allow_execution: 1,
                affect_available_balance: 1,
                notify_on_execution: 1,
                notify_on_failure: 1,
                requires_approval: 0,

                // Required number fields
                initial_mrr_amount: 0,
                current_mrr_amount: 0,
                arr_multiplier: 12,
                initial_account_balance: 1000.00,
                interval: 1,
                execution_count: 0,
                total_executed: 0,
                insufficient_funds_count: 0,
                day_of_month: 1,
                day_of_week: 0,
                week_of_month: 0,
                month_of_year: 0,
                min_balance_required: 0,
                expected_amount: 0,
                allowed_variance: 0,
                confidence_score: 0,

                // String fields
                start_date: '2023-06-01',
                end_date: '2024-06-01',
                next_scheduled_date: '2023-07-01',
                last_executed_at: '2023-06-01 00:00:00',
                reminder_sent_at: '2023-06-01 00:00:00',
                frequency: 'MONTHLY',
                status: 'active',
                department: '',
                project: '',
                cost_center: '',
                gl_account: '',
                vendor_id: '',
                customer_id: '',
                mrr_currency: 'USD',
                transaction_template: '',
                category_slug: '',
                notes: '',
                custom_fields: '',
                target_account_id: '',
                variance_action: '',
                source: '',
                merchant_id: '',
                merchant_name: '',
                transaction_type: '',
                importance_level: 'Medium',
                last_execution_status: '',
                last_execution_error: '',
                overspend_action: 'block',

                // Array fields
                execution_days: [],
                tags: [],
                reminder_days: [],

                // Always required timestamps
                created_at: '2023-06-01 00:00:00',
                updated_at: '2023-06-01 00:00:00',
                last_modified_by: ''
            });
        }

        return transactions;
    }

    describe('Integration Tests', () => {
        test(
            'should successfully insert recurring transactions to actual database',
            { timeout: 60_000 },
            async (t) => {
                // Start a real ClickHouse container
                const container = await ClickHouseContainer.start(t);
                const ch = new ClickHouse({ url: container.url() });
                const adapter = createInserterAdapter(ch.inserter);

                // Create the function to test
                const insertFn = insertRecurringTransactions(adapter);

                // Create test transactions
                const testTransactions = createTestTransactions(2);

                // Call the function
                const result = await insertFn(testTransactions);

                // Verify result
                expect(result.success).toBe(true);
                expect(result.error).toBeUndefined();

                // Verify data was inserted by querying it back
                const queryResultSchema = recurringTransactionSchema.pick({
                    id: true,
                    user_id: true,
                    team_id: true,
                    title: true,
                    amount: true,
                    start_date: true
                });

                const queryFn = ch.querier.query({
                    query: `
                        SELECT id, user_id, team_id, title, amount, toString(start_date) as start_date
                        FROM financials.raw_recurring_transactions_v1 
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
                    expect(queryResult.val[0].title).toBe('Test Transaction 1');
                    expect(queryResult.val[1].title).toBe('Test Transaction 2');
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
                const insertFn = insertRecurringTransactions(adapter);

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
                const insertFn = insertRecurringTransactions(failingAdapter);

                // Create test transactions
                const testTransactions = createTestTransactions(1);

                // Mock console.error to prevent test output pollution
                const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

                // Call the function
                const result = await insertFn(testTransactions);

                // Verify error handling
                expect(result.success).toBe(false);
                expect(result.error).toBe('Mock database error');

                // Verify error was logged
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Error inserting recurring transactions:',
                    'Mock database error'
                );

                // Restore console.error
                consoleErrorSpy.mockRestore();
            }
        );

        test(
            'should handle unexpected exceptions',
            { timeout: 60_000 },
            async () => {
                // Create an adapter that throws a string error
                const explodingAdapter: Inserter = {
                    insert: () => { throw 'String error'; }
                };

                // Create the function to test
                const insertFn = insertRecurringTransactions(explodingAdapter);

                // Create test transactions
                const testTransactions = createTestTransactions(1);

                // Mock console.error
                const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

                // Call the function
                const result = await insertFn(testTransactions);

                // Verify error handling for non-Error object
                expect(result.success).toBe(false);
                expect(result.error).toBe('String error');

                // Restore console.error
                consoleErrorSpy.mockRestore();
            }
        );
    });
}); 