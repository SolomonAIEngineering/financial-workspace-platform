import { RawTransaction, rawTransactionSchema } from '../../types';
import { describe, expect, test } from 'vitest';

import { ClickHouse } from '../../index';
import { ClickHouseContainer } from '../../testutil';
import { Inserter as ClickHouseInserter } from '../../client';
import { Inserter } from '../types';
import { MutationResponse } from '../types';
import { updateTransaction } from './updateTransaction';

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
function createTestTransaction(overrides: Partial<any> = {}): any {
    const now = new Date().toISOString();

    const transaction = {
        id: `test-${Date.now()}`,
        user_id: 'user-1',
        team_id: 'team-1',
        bank_account_id: 'account-1',
        name: 'Test Transaction',
        amount: 100.00,
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
    };

    return { ...transaction, ...overrides };
}

describe('updateTransaction', () => {
    describe('Integration Tests', () => {
        test('should handle errors gracefully',
            { timeout: 60_000 },
            async (t) => {
                // Start a real ClickHouse container (needed for a real adapter)
                const container = await ClickHouseContainer.start(t);
                const ch = new ClickHouse({ url: container.url() });
                const adapter = createInserterAdapter(ch.inserter);

                // Create the updateTransaction function with the adapter
                const updateTx = updateTransaction(adapter);

                // Create an invalid transaction (missing required fields)
                const invalidTransaction = {
                    id: 'invalid-transaction',
                    // Missing required fields
                };

                // Call the update function with the invalid transaction
                const result = await updateTx(invalidTransaction as any);

                // Verify error handling
                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
            }
        );
    });
}); 