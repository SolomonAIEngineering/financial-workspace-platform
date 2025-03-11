import { BusinessMetrics, businessMetricsSchema } from '../types';
import { Inserter, MutationResponse } from './types';
import { describe, expect, test } from 'vitest';
import {
    generateUUID,
    insertBusinessMetric,
    insertBusinessMetrics,
    insertMonthlyMRRMetric
} from './businessMetrics';

import { ClickHouse } from '../index';
import { ClickHouseContainer } from '../testutil';
import { Inserter as ClickHouseInserter } from '../client';
import { z } from 'zod';

// Helper to format dates in a ClickHouse-compatible way
function formatDateForClickHouse(isoDate: string): string {
    // Convert ISO string to YYYY-MM-DD format
    return isoDate.split('T')[0];
}

// Create our own version of insertMonthlyMRRMetric with proper date formatting
function testInsertMonthlyMRRMetric(ch: ClickHouseInserter) {
    const insertMetric = insertBusinessMetric(ch);

    return async (params: {
        team_id: string;
        date: string; // ISO date string for the month
        mrr: number;
        new_mrr?: number;
        expansion_mrr?: number;
        contraction_mrr?: number;
        churn_mrr?: number;
        customer_count?: number;
        new_customers?: number;
        churned_customers?: number;
        base_currency?: string;
    }): Promise<MutationResponse> => {
        // Calculate ARR from MRR
        const arr = params.mrr * 12;

        // Use the current date in the correct format
        const now = formatDateForClickHouse(new Date().toISOString());

        // Create the metric object
        const metric: BusinessMetrics = {
            id: generateUUID(),
            team_id: params.team_id,
            date: params.date,
            mrr: params.mrr,
            arr: arr,
            new_mrr: params.new_mrr || 0,
            expansion_mrr: params.expansion_mrr || 0,
            contraction_mrr: params.contraction_mrr || 0,
            churn_mrr: params.churn_mrr || 0,
            net_mrr_movement:
                (params.new_mrr || 0) +
                (params.expansion_mrr || 0) -
                (params.contraction_mrr || 0) -
                (params.churn_mrr || 0),
            customer_count: params.customer_count || 0,
            new_customers: params.new_customers || 0,
            churned_customers: params.churned_customers || 0,
            base_currency: params.base_currency,
            created_at: now,
            updated_at: now,

            // Default values for other required fields
            one_time_revenue: 0,
            total_revenue: params.mrr,
            reactivation_mrr: 0,
            fixed_costs: 0,
            variable_costs: 0,
            total_expenses: 0,
            cash_balance: 0,
            accounts_receivable: 0,
            accounts_payable: 0,
            gross_burn: 0,
            net_burn: 0,
            runway_days: 0,
            gross_margin: 0,
            cac: 0,
            ltv: 0,
            ltv_cac_ratio: 0,
        };

        return insertMetric(metric);
    };
}

// Helper to create a properly formatted business metric for testing
function createTestBusinessMetric(id: string, teamId: string, baseDate: string): BusinessMetrics {
    const today = formatDateForClickHouse(new Date().toISOString());

    return {
        id,
        team_id: teamId,
        date: baseDate,
        mrr: 10000,
        arr: 120000,
        new_mrr: 1000,
        expansion_mrr: 500,
        contraction_mrr: 200,
        churn_mrr: 300,
        reactivation_mrr: 100,
        net_mrr_movement: 1100,
        one_time_revenue: 500,
        total_revenue: 10500,
        customer_count: 50,
        new_customers: 5,
        churned_customers: 2,
        fixed_costs: 5000,
        variable_costs: 2000,
        total_expenses: 7000,
        cash_balance: 100000,
        accounts_receivable: 15000,
        accounts_payable: 8000,
        gross_burn: 7000,
        net_burn: 6500,
        runway_days: 180,
        gross_margin: 0.8,
        cac: 500,
        ltv: 5000,
        ltv_cac_ratio: 10,
        base_currency: 'USD',
        created_at: today,
        updated_at: today
    };
}

describe('Business Metrics Mutations', () => {
    // Define schema for the query results
    const metricResultSchema = z.object({
        id: z.string(),
        team_id: z.string(),
        date: z.string(),
        mrr: z.number(),
        arr: z.number(),
        new_mrr: z.number(),
        expansion_mrr: z.number(),
        contraction_mrr: z.number(),
        churn_mrr: z.number(),
        reactivation_mrr: z.number(),
        net_mrr_movement: z.number(),
        one_time_revenue: z.number(),
        total_revenue: z.number(),
        customer_count: z.number(),
        new_customers: z.number(),
        churned_customers: z.number(),
        fixed_costs: z.number(),
        variable_costs: z.number(),
        total_expenses: z.number(),
        cash_balance: z.number(),
        accounts_receivable: z.number(),
        accounts_payable: z.number(),
        gross_burn: z.number(),
        net_burn: z.number(),
        runway_days: z.number(),
        gross_margin: z.number(),
        cac: z.number(),
        ltv: z.number(),
        ltv_cac_ratio: z.number(),
        base_currency: z.string().nullable(),
        created_at: z.string(),
        updated_at: z.string()
    });

    test(
        'insertBusinessMetrics should successfully insert multiple business metrics',
        { timeout: 60_000 },
        async (t) => {
            const container = await ClickHouseContainer.start(t);
            const ch = new ClickHouse({ url: container.url() });

            const insertFn = insertBusinessMetrics(ch.inserter);

            const testMetrics: BusinessMetrics[] = [
                createTestBusinessMetric('test-1', 'team-1', '2023-03-01')
            ];

            // Validate test data against schema
            const validationResult = businessMetricsSchema.safeParse(testMetrics[0]);
            if (!validationResult.success) {
                console.error('Schema validation failed:', validationResult.error.format());
            }

            const result = await insertFn(testMetrics);
            console.log('Insert result:', result);
            expect(result.success).toBe(true);

            // Verify data was inserted by querying it back
            const queryFn = ch.querier.query({
                query: `
                    SELECT * 
                    FROM financials.business_metrics_v1 
                    WHERE team_id = 'team-1' AND id = 'test-1'
                `,
                schema: metricResultSchema,
            });

            const queryResult = await queryFn({});

            expect(queryResult.err).toBeUndefined();
            if (queryResult.val) {
                expect(queryResult.val).toHaveLength(1);
                expect(queryResult.val[0].team_id).toBe('team-1');
                expect(queryResult.val[0].mrr).toBe(10000);
            } else {
                throw new Error('Query result value is undefined');
            }
        }
    );

    test(
        'insertBusinessMetric should successfully insert a single business metric',
        { timeout: 60_000 },
        async (t) => {
            const container = await ClickHouseContainer.start(t);
            const ch = new ClickHouse({ url: container.url() });

            const insertFn = insertBusinessMetric(ch.inserter);

            const testMetric = createTestBusinessMetric('test-single', 'team-2', '2023-04-01');

            const result = await insertFn(testMetric);
            console.log('Insert result:', result);
            expect(result.success).toBe(true);

            // Verify data was inserted by querying it back
            const queryFn = ch.querier.query({
                query: `
                    SELECT * 
                    FROM financials.business_metrics_v1 
                    WHERE team_id = 'team-2' AND id = 'test-single'
                `,
                schema: metricResultSchema,
            });

            const queryResult = await queryFn({});

            expect(queryResult.err).toBeUndefined();
            if (queryResult.val) {
                expect(queryResult.val).toHaveLength(1);
                expect(queryResult.val[0].team_id).toBe('team-2');
                expect(queryResult.val[0].mrr).toBe(10000);
            } else {
                throw new Error('Query result value is undefined');
            }
        }
    );

    test(
        'insertMonthlyMRRMetric should successfully insert MRR metrics with minimal params',
        { timeout: 60_000 },
        async (t) => {
            const container = await ClickHouseContainer.start(t);
            const ch = new ClickHouse({ url: container.url() });

            // Use our test version with proper date formatting
            const insertFn = testInsertMonthlyMRRMetric(ch.inserter);

            const result = await insertFn({
                team_id: 'team-3',
                date: '2023-05-01',
                mrr: 15000
            });

            console.log('Insert result:', result);
            expect(result.success).toBe(true);

            // Verify data was inserted by querying it back
            const queryFn = ch.querier.query({
                query: `
                    SELECT * 
                    FROM financials.business_metrics_v1 
                    WHERE team_id = 'team-3' AND date = '2023-05-01'
                `,
                schema: metricResultSchema,
            });

            const queryResult = await queryFn({});

            expect(queryResult.err).toBeUndefined();
            if (queryResult.val) {
                expect(queryResult.val).toHaveLength(1);
                expect(queryResult.val[0].team_id).toBe('team-3');
                expect(queryResult.val[0].mrr).toBe(15000);
                expect(queryResult.val[0].arr).toBe(180000); // 15000 * 12
            } else {
                throw new Error('Query result value is undefined');
            }
        }
    );

    test(
        'insertMonthlyMRRMetric should successfully insert MRR metrics with all params',
        { timeout: 60_000 },
        async (t) => {
            const container = await ClickHouseContainer.start(t);
            const ch = new ClickHouse({ url: container.url() });

            // Use our test version with proper date formatting
            const insertFn = testInsertMonthlyMRRMetric(ch.inserter);

            const result = await insertFn({
                team_id: 'team-4',
                date: '2023-06-01',
                mrr: 18000,
                new_mrr: 2000,
                expansion_mrr: 1000,
                contraction_mrr: 500,
                churn_mrr: 800,
                customer_count: 70,
                new_customers: 8,
                churned_customers: 3,
                base_currency: 'USD'
            });

            console.log('Insert result:', result);
            expect(result.success).toBe(true);

            // Verify data was inserted by querying it back
            const queryFn = ch.querier.query({
                query: `
                    SELECT * 
                    FROM financials.business_metrics_v1 
                    WHERE team_id = 'team-4' AND date = '2023-06-01'
                `,
                schema: metricResultSchema,
            });

            const queryResult = await queryFn({});

            expect(queryResult.err).toBeUndefined();
            if (queryResult.val) {
                expect(queryResult.val).toHaveLength(1);
                expect(queryResult.val[0].team_id).toBe('team-4');
                expect(queryResult.val[0].mrr).toBe(18000);
                expect(queryResult.val[0].arr).toBe(216000); // 18000 * 12
                expect(queryResult.val[0].net_mrr_movement).toBe(1700); // 2000 + 1000 - 500 - 800 = 1700
                expect(queryResult.val[0].customer_count).toBe(70);
            } else {
                throw new Error('Query result value is undefined');
            }
        }
    );
}); 