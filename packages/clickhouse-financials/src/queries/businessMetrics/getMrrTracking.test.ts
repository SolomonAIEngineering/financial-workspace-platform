import { describe, expect, test } from 'vitest'

import { ClickHouse } from '../../index'
import { ClickHouseContainer } from '../../testutil'
import { getMrrTracking } from './getMrrTracking'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

/**
 * Generate sample MRR tracking data for testing
 * @param n Number of MRR tracking records to generate
 * @param teamId Team ID for the MRR tracking records
 * @returns Array of MRR tracking objects
 */
function generateMrrTrackingData(n: number, teamId: string) {
    // Categories for test data
    const categories = [
        'subscription',
        'saas',
        'consulting',
        'product',
        'service',
        'other'
    ]

    // Define the MRR tracking type
    type MrrTrackingData = {
        team_id: string;
        month_date: string;
        date_year: number;
        date_month: number;
        category: string;
        is_subscription_revenue: number;
        subscription_revenue: number;
        one_time_revenue: number;
        fixed_costs: number;
        variable_costs: number;
        mrr: number;
        arr: number;
        customer_count: number;
    };

    const mrrTrackingRecords: MrrTrackingData[] = [];

    // Generate data for the last n months
    const now = new Date();

    for (let i = 0; i < n; i++) {
        // Generate date for i months ago
        const date = new Date(now);
        date.setMonth(now.getMonth() - i);
        const monthDate = date.toISOString().slice(0, 10); // YYYY-MM-DD format
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed

        // Generate multiple categories for each month
        for (const category of categories) {
            const isSubscription = category === 'subscription' || category === 'saas' ? 1 : 0;

            // Generate realistic MRR values with some growth over time
            const baseMrr = Math.floor(Math.random() * 10000) + 1000;
            // Newer months have higher MRR (slight growth)
            const growthFactor = 1 + (n - i) * 0.02;
            const mrr = Math.round(baseMrr * growthFactor);

            // Generate related metrics
            const subscriptionRevenue = isSubscription ? mrr : 0;
            const oneTimeRevenue = isSubscription ? 0 : Math.floor(Math.random() * 5000);
            const fixedCosts = Math.floor(Math.random() * 3000) + 500;
            const variableCosts = Math.floor(Math.random() * 2000) + 300;
            const customerCount = Math.floor(Math.random() * 50) + 5;

            mrrTrackingRecords.push({
                team_id: teamId,
                month_date: monthDate,
                date_year: year,
                date_month: month,
                category: category,
                is_subscription_revenue: isSubscription,
                subscription_revenue: subscriptionRevenue,
                one_time_revenue: oneTimeRevenue,
                fixed_costs: fixedCosts,
                variable_costs: variableCosts,
                mrr: mrr,
                arr: mrr * 12,
                customer_count: customerCount
            });
        }
    }

    return mrrTrackingRecords;
}

describe('getMrrTracking', () => {
    test('accurately retrieves MRR tracking data', async (t) => {
        console.log('Starting test...');

        // Start a ClickHouse container for testing
        const container = await ClickHouseContainer.start(t, { keepContainer: false });
        console.log('ClickHouse container started');

        try {
            // Create a ClickHouse client
            const ch = new ClickHouse({
                url: container.url(),
            });
            console.log(`ClickHouse client created with URL: ${container.url()}`);

            // Generate test IDs
            const teamId = randomUUID();
            console.log('Generated test IDs:', { teamId });

            // Generate sample MRR tracking data
            const mrrTrackingData = generateMrrTrackingData(12, teamId); // 12 months of data
            console.log(`Generated sample MRR tracking data: ${mrrTrackingData.length} records`);
            console.log('Sample MRR tracking record:', JSON.stringify(mrrTrackingData[0], null, 2));

            // Check if the database exists
            const databases = await ch.querier.query({
                query: 'SHOW DATABASES',
                schema: z.object({ name: z.string() }),
            })({});

            console.log('Databases:', databases.val?.map(db => db.name));

            // Create financials database if it doesn't exist
            await ch.querier.query({
                query: 'CREATE DATABASE IF NOT EXISTS financials',
                schema: z.object({}),
            })({});

            // List tables in financials database
            const tables = await ch.querier.query({
                query: 'SHOW TABLES FROM financials',
                schema: z.object({ name: z.string() }),
            })({});

            console.log('Tables in financials:', tables.val?.map(table => table.name));

            // Create mrr_tracking_mv_v1 table if it doesn't exist
            await ch.querier.query({
                query: `
                CREATE TABLE IF NOT EXISTS financials.mrr_tracking_mv_v1 (
                    team_id String,
                    month_date Date,
                    date_year UInt16,
                    date_month UInt8,
                    category String,
                    is_subscription_revenue UInt8,
                    subscription_revenue Float64,
                    one_time_revenue Float64,
                    fixed_costs Float64,
                    variable_costs Float64,
                    mrr Float64,
                    arr Float64,
                    customer_count UInt32
                ) ENGINE = MergeTree()
                ORDER BY (team_id, month_date, category)
                `,
                schema: z.object({}),
            })({});

            console.log('Created mrr_tracking_mv_v1 table');

            // Get the table structure
            const tableStructure = await ch.querier.query({
                query: 'DESCRIBE TABLE financials.mrr_tracking_mv_v1',
                schema: z.object({
                    name: z.string(),
                    type: z.string(),
                }),
            })({});

            console.log('Table structure:', tableStructure.val);

            // Insert the MRR tracking data
            console.log('Inserting MRR tracking data in batch...');

            const inserter = ch.inserter.insert({
                table: 'financials.mrr_tracking_mv_v1',
                schema: z.object({
                    team_id: z.string(),
                    month_date: z.string(),
                    date_year: z.number(),
                    date_month: z.number(),
                    category: z.string(),
                    is_subscription_revenue: z.number(),
                    subscription_revenue: z.number(),
                    one_time_revenue: z.number(),
                    fixed_costs: z.number(),
                    variable_costs: z.number(),
                    mrr: z.number(),
                    arr: z.number(),
                    customer_count: z.number()
                })
            });

            const insertResult = await inserter(mrrTrackingData);
            console.log('Batch insertion result:', insertResult);

            // Wait for data to be processed
            console.log('Waiting for data to be processed...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Verify data insertion
            console.log('Verifying data insertion...');
            const countQuery = `SELECT count(*) as count FROM financials.mrr_tracking_mv_v1 WHERE team_id = '${teamId}'`;
            console.log('Count query:', countQuery);

            const count = await ch.querier.query({
                query: countQuery,
                schema: z.object({ count: z.number().int() }),
            })({});

            console.log('Count result:', count);

            if (count.err) {
                console.error('Error in count query:', count.err);
                throw new Error('Error in count query: ' + count.err.message);
            } else {
                console.log('Count value:', count.val);
                // The test should fail if no data was inserted
                expect(count.val![0].count).toBeGreaterThan(0);
            }

            // Test the getMrrTracking function
            console.log('Testing getMrrTracking function...');
            const getMrrTrackingFn = getMrrTracking(ch.querier);

            try {
                const result = await getMrrTrackingFn({
                    teamId,
                    start: new Date(new Date().setMonth(new Date().getMonth() - 12)).getTime(),
                    end: new Date().getTime(),
                    limit: 100,
                });

                console.log('getMrrTracking result:', result);

                if (result.err) {
                    console.error('Error in getMrrTracking:', result.err);
                    throw result.err;
                } else {
                    // Verify the results
                    expect(result.val).toBeDefined();
                    if (result.val) {
                        expect(Array.isArray(result.val)).toBe(true);
                        expect(result.val.length).toBeGreaterThan(0);

                        // Verify the structure of the returned data
                        const firstRecord = result.val[0];
                        expect(firstRecord.team_id).toBe(teamId);
                        expect(firstRecord.month_date).toBeDefined();
                        expect(firstRecord.mrr).toBeDefined();
                        expect(firstRecord.arr).toBeDefined();
                        expect(firstRecord.customer_count).toBeDefined();
                    }
                }
            } catch (error) {
                console.error('Exception in getMrrTracking:', error);
                throw error;
            }
        } finally {
            console.log('Test completed, stopping container...');
            await container.stop();
        }
    }, 30000); // Increase timeout to 30 seconds
}); 