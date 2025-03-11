import { Inserter, MutationResponse } from '../types';
import { RecurringTransaction, recurringTransactionSchema } from '../../types';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ClickHouse } from '../../index';
import { ClickHouseContainer } from '../../testutil';
import { Inserter as ClickHouseInserter } from '../../client';
import { insertRecurringTransaction } from './insertRecurringTransaction';
import { insertRecurringTransactions } from './insertRecurringTransactions';

// Keep this mock for the unit tests that don't need the container
vi.mock('./insertRecurringTransactions', () => ({
    insertRecurringTransactions: vi.fn()
}));

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

describe('insertRecurringTransaction', () => {
    describe('Unit Tests', () => {
        // Variables for the unit tests
        let mockInserter: Inserter;
        let mockInsertMultiple: ReturnType<typeof vi.fn>;

        beforeEach(() => {
            // Reset mocks before each test
            vi.resetAllMocks();

            // Create a mock inserter
            mockInserter = {} as Inserter;

            // Create a mock for the insertRecurringTransactions function
            mockInsertMultiple = vi.fn();
            (insertRecurringTransactions as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertMultiple);
        });

        test('should call insertRecurringTransactions with an array containing the single transaction', async () => {
            // Setup a successful response
            mockInsertMultiple.mockResolvedValue({ success: true });

            // Create the function to test
            const insertFn = insertRecurringTransaction(mockInserter);

            // Create a test transaction
            const testTransaction: RecurringTransaction = {
                id: 'test-1',
                user_id: 'user-1',
                team_id: 'team-1',
                bank_account_id: 'account-1',
                title: 'Test Transaction',
                amount: 100.00,
                start_date: '2023-06-01',
                created_at: '2023-06-01T12:00:00.000Z',
                updated_at: '2023-06-01T12:00:00.000Z'
            } as RecurringTransaction;

            // Call the function
            const result = await insertFn(testTransaction);

            // Verify insertRecurringTransactions was called correctly
            expect(insertRecurringTransactions).toHaveBeenCalledWith(mockInserter);
            expect(mockInsertMultiple).toHaveBeenCalledWith([testTransaction]);

            // Verify the result is passed through
            expect(result).toEqual({ success: true });
        });

        test('should pass through error responses from insertRecurringTransactions', async () => {
            // Setup an error response
            mockInsertMultiple.mockResolvedValue({
                success: false,
                error: 'Test error message'
            });

            // Create the function to test
            const insertFn = insertRecurringTransaction(mockInserter);

            // Create a test transaction
            const testTransaction = {
                id: 'test-error',
                user_id: 'user-1',
                team_id: 'team-1'
            } as RecurringTransaction;

            // Call the function
            const result = await insertFn(testTransaction);

            // Verify error is passed through
            expect(result).toEqual({
                success: false,
                error: 'Test error message'
            });
        });
    });

    describe('Integration Tests', () => {
        test(
            'should successfully insert a single transaction to actual database',
            { timeout: 60_000 },
            async (t) => {
                // Start a real ClickHouse container
                const container = await ClickHouseContainer.start(t);
                const ch = new ClickHouse({ url: container.url() });
                const adapter = createInserterAdapter(ch.inserter);

                // Create the function to test with the actual implementation
                const insertFn = insertRecurringTransaction(adapter);

                // Create a test transaction
                const now = new Date().toISOString();
                const testTransaction = {
                    id: 'single-test-1',
                    user_id: 'user-single-1',
                    team_id: 'team-single-1',
                    bank_account_id: 'account-single-1',
                    title: 'Single Test Transaction',
                    description: 'Test description',
                    amount: 150.00,
                    is_revenue: 0,
                    is_subscription_revenue: 0,
                    is_expense: 1,
                    is_fixed_cost: 1,
                    is_variable_cost: 0,
                    is_mrr_component: 0,
                    initial_mrr_amount: 0,
                    current_mrr_amount: 0,
                    arr_multiplier: 12,
                    initial_account_balance: 1000.00,
                    frequency: 'MONTHLY',
                    interval: 1,
                    start_date: '2023-05-01',
                    next_scheduled_date: '2023-06-01',
                    skip_weekends: 0,
                    adjust_for_holidays: 0,
                    allow_execution: 1,
                    execution_days: [],
                    affect_available_balance: 1,
                    execution_count: 0,
                    total_executed: 0,
                    insufficient_funds_count: 0,
                    notify_on_execution: 1,
                    notify_on_failure: 1,
                    status: 'active',
                    is_automated: 1,
                    requires_approval: 0,
                    is_variable: 0,
                    created_at: now,
                    updated_at: now
                } as unknown as RecurringTransaction;

                // Call the function
                const result = await insertFn(testTransaction);

                // Verify result
                expect(result.success).toBe(true);

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
                        WHERE id = 'single-test-1'
                    `,
                    schema: queryResultSchema,
                });

                const queryResult = await queryFn({});

                expect(queryResult.err).toBeUndefined();
                if (queryResult.val) {
                    expect(queryResult.val).toHaveLength(1);
                    expect(queryResult.val[0].id).toBe('single-test-1');
                    expect(queryResult.val[0].user_id).toBe('user-single-1');
                    expect(queryResult.val[0].team_id).toBe('team-single-1');
                    expect(queryResult.val[0].title).toBe('Single Test Transaction');
                    expect(queryResult.val[0].amount).toBe(150.00);
                    expect(queryResult.val[0].start_date).toContain('2023-05-01');
                } else {
                    throw new Error('Query result value is undefined');
                }
            }
        );
    });
}); 