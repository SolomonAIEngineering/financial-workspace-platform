import { describe, expect, test } from 'vitest'

import { ClickHouse } from '../../index'
import { ClickHouseContainer } from '../../testutil'
import { getCustomerLifetimeValue } from './getCustomerLifetimeValue'
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
        const monthDate = date.toISOString().split('T')[0];
        const dateYear = date.getFullYear();
        const dateMonth = date.getMonth() + 1;

        // Generate data for each category
        for (const category of categories) {
            const isSubscription = ['subscription', 'saas'].includes(category) ? 1 : 0;

            // Generate random values
            const subscriptionRevenue = isSubscription ? Math.floor(Math.random() * 10000) + 1000 : 0;
            const oneTimeRevenue = !isSubscription ? Math.floor(Math.random() * 5000) + 100 : 0;
            const fixedCosts = Math.floor(Math.random() * 3000) + 500;
            const variableCosts = Math.floor(Math.random() * 2000) + 300;

            // MRR is either subscription revenue or a calculated value for non-subscription
            const mrr = isSubscription ?
                subscriptionRevenue :
                Math.floor(Math.random() * 10000) + 1000;

            // ARR is MRR * 12
            const arr = mrr * 12;

            // Random customer count
            const customerCount = Math.floor(Math.random() * 50) + 5;

            mrrTrackingRecords.push({
                team_id: teamId,
                month_date: monthDate,
                date_year: dateYear,
                date_month: dateMonth,
                category,
                is_subscription_revenue: isSubscription,
                subscription_revenue: subscriptionRevenue,
                one_time_revenue: oneTimeRevenue,
                fixed_costs: fixedCosts,
                variable_costs: variableCosts,
                mrr,
                arr,
                customer_count: customerCount
            });
        }
    }

    return mrrTrackingRecords;
}

/**
 * Generate sample MRR movement data for testing
 * @param n Number of months to generate data for
 * @param teamId Team ID for the MRR movement records
 * @returns Array of MRR movement objects
 */
function generateMrrMovementData(n: number, teamId: string) {
    type MrrMovementData = {
        team_id: string;
        month_date: string;
        current_month_mrr: number;
        previous_month_mrr: number;
        new_mrr: number;
        expansion_mrr: number;
        contraction_mrr: number;
        churned_mrr: number;
        reactivation_mrr: number;
        net_mrr_movement: number;
        active_customers: number;
        new_customers: number;
        churned_customers: number;
    };

    const mrrMovementRecords: MrrMovementData[] = [];
    const now = new Date();

    let previousMonthMrr = 50000; // Starting MRR
    let activeCustomers = 100; // Starting active customers

    for (let i = 0; i < n; i++) {
        // Generate date for i months ago
        const date = new Date(now);
        date.setMonth(now.getMonth() - i);
        const monthDate = date.toISOString().split('T')[0];

        // Generate random values with some realistic constraints
        const newMrr = Math.floor(Math.random() * 5000) + 1000;
        const expansionMrr = Math.floor(Math.random() * 3000) + 500;
        const contractionMrr = Math.floor(Math.random() * 2000) + 200;
        const churnedMrr = Math.floor(Math.random() * 3000) + 300;
        const reactivationMrr = Math.floor(Math.random() * 1000) + 100;

        // Calculate net MRR movement
        const netMrrMovement = newMrr + expansionMrr - contractionMrr - churnedMrr + reactivationMrr;

        // Calculate current month MRR
        const currentMonthMrr = previousMonthMrr + netMrrMovement;

        // Update previous month MRR for next iteration
        previousMonthMrr = currentMonthMrr;

        // Generate customer counts
        const newCustomers = Math.floor(Math.random() * 20) + 5;
        const churnedCustomers = Math.floor(Math.random() * 10) + 1;

        // Update active customers
        activeCustomers = activeCustomers + newCustomers - churnedCustomers;

        mrrMovementRecords.push({
            team_id: teamId,
            month_date: monthDate,
            current_month_mrr: currentMonthMrr,
            previous_month_mrr: previousMonthMrr - netMrrMovement,
            new_mrr: newMrr,
            expansion_mrr: expansionMrr,
            contraction_mrr: contractionMrr,
            churned_mrr: churnedMrr,
            reactivation_mrr: reactivationMrr,
            net_mrr_movement: netMrrMovement,
            active_customers: activeCustomers,
            new_customers: newCustomers,
            churned_customers: churnedCustomers
        });
    }

    return mrrMovementRecords;
}

describe('getCustomerLifetimeValue', () => {
    test('accurately calculates customer lifetime value metrics', async (t) => {
        console.info('Starting test...');

        // Start a ClickHouse container for testing
        const container = await ClickHouseContainer.start(t, { keepContainer: false });
        console.info('ClickHouse container started');

        try {
            // Create a ClickHouse client
            const ch = new ClickHouse({
                url: container.url(),
            });
            console.info(`ClickHouse client created with URL: ${container.url()}`);

            // Generate test IDs
            const teamId = randomUUID();
            console.info('Generated test ID:', { teamId });

            // Generate sample MRR tracking data
            const mrrTrackingData = generateMrrTrackingData(12, teamId); // 12 months of data
            console.info(`Generated sample MRR tracking data: ${mrrTrackingData.length} records`);
            console.info('Sample MRR tracking record:', JSON.stringify(mrrTrackingData[0], null, 2));

            // Generate sample MRR movement data
            const mrrMovementData = generateMrrMovementData(12, teamId); // 12 months of data
            console.info(`Generated sample MRR movement data: ${mrrMovementData.length} records`);
            console.info('Sample MRR movement record:', JSON.stringify(mrrMovementData[0], null, 2));

            // Check if the database exists
            const databases = await ch.querier.query({
                query: 'SHOW DATABASES',
                schema: z.object({ name: z.string() }),
            })({});

            console.info('Databases:', databases.val?.map(db => db.name));

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

            console.info('Tables in financials:', tables.val?.map(table => table.name));

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
                    customer_count UInt64
                ) ENGINE = MergeTree()
                ORDER BY (team_id, month_date, category)
                `,
                schema: z.object({}),
            })({});

            console.info('Created mrr_tracking_mv_v1 table');

            // Create mrr_movement_mv_v1 table if it doesn't exist
            await ch.querier.query({
                query: `
                CREATE TABLE IF NOT EXISTS financials.mrr_movement_mv_v1 (
                    team_id String,
                    month_date Date,
                    current_month_mrr Float64,
                    previous_month_mrr Float64,
                    new_mrr Float64,
                    expansion_mrr Float64,
                    contraction_mrr Float64,
                    churned_mrr Float64,
                    reactivation_mrr Float64,
                    net_mrr_movement Float64,
                    active_customers UInt64,
                    new_customers UInt64,
                    churned_customers UInt64
                ) ENGINE = MergeTree()
                ORDER BY (team_id, month_date)
                `,
                schema: z.object({}),
            })({});

            console.info('Created mrr_movement_mv_v1 table');

            // Create a Zod schema for the MRR tracking data
            const mrrTrackingSchema = z.object({
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
            });

            // Create a Zod schema for the MRR movement data
            const mrrMovementSchema = z.object({
                team_id: z.string(),
                month_date: z.string(),
                current_month_mrr: z.number(),
                previous_month_mrr: z.number(),
                new_mrr: z.number(),
                expansion_mrr: z.number(),
                contraction_mrr: z.number(),
                churned_mrr: z.number(),
                reactivation_mrr: z.number(),
                net_mrr_movement: z.number(),
                active_customers: z.number(),
                new_customers: z.number(),
                churned_customers: z.number()
            });

            // Insert the MRR tracking data
            const insertTrackingFn = ch.inserter.insert({
                table: 'financials.mrr_tracking_mv_v1',
                schema: mrrTrackingSchema
            });

            const trackingBatchResult = await insertTrackingFn(mrrTrackingData);
            console.info('MRR tracking batch insertion result:', trackingBatchResult);

            // Insert the MRR movement data
            const insertMovementFn = ch.inserter.insert({
                table: 'financials.mrr_movement_mv_v1',
                schema: mrrMovementSchema
            });

            const movementBatchResult = await insertMovementFn(mrrMovementData);
            console.info('MRR movement batch insertion result:', movementBatchResult);

            // Wait for data to be processed
            console.info('Waiting for data to be processed...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Verify MRR tracking data insertion
            console.info('Verifying MRR tracking data insertion...');
            const trackingCountQuery = `SELECT count(*) as count FROM financials.mrr_tracking_mv_v1 WHERE team_id = '${teamId}'`;

            const trackingCount = await ch.querier.query({
                query: trackingCountQuery,
                schema: z.object({ count: z.number().int() }),
            })({});

            console.info('MRR tracking count result:', trackingCount);
            expect(trackingCount.val!.at(0)!.count).toBeGreaterThan(0);

            // Verify MRR movement data insertion
            console.info('Verifying MRR movement data insertion...');
            const movementCountQuery = `SELECT count(*) as count FROM financials.mrr_movement_mv_v1 WHERE team_id = '${teamId}'`;

            const movementCount = await ch.querier.query({
                query: movementCountQuery,
                schema: z.object({ count: z.number().int() }),
            })({});

            console.info('MRR movement count result:', movementCount);
            expect(movementCount.val!.at(0)!.count).toBeGreaterThan(0);

            // Test the getCustomerLifetimeValue function
            console.info('Testing getCustomerLifetimeValue function...');
            const getCustomerLifetimeValueFn = getCustomerLifetimeValue(ch.querier);

            try {
                const result = await getCustomerLifetimeValueFn({
                    teamId
                });

                console.info('getCustomerLifetimeValue result:', result);

                if (result.err) {
                    console.error('Error in getCustomerLifetimeValue:', result.err);
                    throw new Error('Error in getCustomerLifetimeValue: ' + result.err.message);
                } else {
                    // Verify the results
                    expect(result.val).toBeDefined();
                    if (result.val && result.val.length > 0) {
                        const clvMetrics = result.val[0];

                        // Check that ARPU is calculated
                        expect(clvMetrics.arpu).toBeDefined();
                        if (clvMetrics.arpu !== null) {
                            expect(clvMetrics.arpu).toBeGreaterThan(0);
                        }

                        // Check that monthly churn rate is calculated
                        expect(clvMetrics.monthly_churn_rate).toBeDefined();
                        if (clvMetrics.monthly_churn_rate !== null) {
                            expect(clvMetrics.monthly_churn_rate).toBeGreaterThanOrEqual(0);
                            expect(clvMetrics.monthly_churn_rate).toBeLessThanOrEqual(1);
                        }

                        // Check that average customer lifetime months is calculated
                        expect(clvMetrics.avg_customer_lifetime_months).toBeDefined();
                        if (clvMetrics.avg_customer_lifetime_months !== null && clvMetrics.monthly_churn_rate !== null && clvMetrics.monthly_churn_rate > 0) {
                            // Should be approximately 1 / churn_rate
                            expect(clvMetrics.avg_customer_lifetime_months).toBeCloseTo(1 / clvMetrics.monthly_churn_rate, 1);
                        }

                        // Check that customer lifetime value is calculated
                        expect(clvMetrics.customer_lifetime_value).toBeDefined();
                        if (clvMetrics.customer_lifetime_value !== null && clvMetrics.arpu !== null && clvMetrics.avg_customer_lifetime_months !== null) {
                            // Should be ARPU * avg_customer_lifetime_months
                            expect(clvMetrics.customer_lifetime_value).toBeCloseTo(clvMetrics.arpu * clvMetrics.avg_customer_lifetime_months, 1);
                        }
                    }
                }
            } catch (error) {
                console.error('Exception in getCustomerLifetimeValue:', error);
                throw error;
            }
        } finally {
            console.info('Test completed, stopping container...');
            await container.stop();
        }
    }, 30000); // Increase timeout to 30 seconds
}); 