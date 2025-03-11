import { describe, expect, test } from 'vitest'

import { ClickHouse } from '../../index'
import { ClickHouseContainer } from '../../testutil'
import { getMrrMovement } from './getMrrMovement'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

/**
 * Generate sample MRR movement data for testing
 * @param n Number of MRR movement records to generate (months)
 * @param teamId Team ID for the MRR movement records
 * @returns Array of MRR movement objects
 */
function generateMrrMovementData(n: number, teamId: string) {
    // Define the MRR movement type
    type MrrMovementData = {
        team_id: string;
        month_date: string;
        new_mrr: number;
        expansion_mrr: number;
        contraction_mrr: number;
        churn_mrr: number;
        reactivation_mrr: number;
        net_new_mrr: number;
        new_customers: number;
        churned_customers: number;
        active_customers: number;
    };

    const mrrMovementRecords: MrrMovementData[] = [];

    // Generate data for the last n months
    const now = new Date();
    let activeCustomers = 100; // Starting customer base

    for (let i = 0; i < n; i++) {
        // Generate date for i months ago
        const date = new Date(now);
        date.setMonth(now.getMonth() - i);
        const monthDate = date.toISOString().slice(0, 10); // YYYY-MM-DD format

        // Generate realistic MRR movement values
        // Newer months have higher growth metrics (for a growing business)
        const growthFactor = 1 + (n - i) * 0.01;

        // Generate new MRR (customers joining)
        const newMrr = Math.round((Math.floor(Math.random() * 5000) + 1000) * growthFactor);
        const newCustomers = Math.floor(Math.random() * 10) + 2;

        // Generate expansion MRR (existing customers spending more)
        const expansionMrr = Math.round((Math.floor(Math.random() * 3000) + 500) * growthFactor);

        // Generate contraction MRR (existing customers spending less)
        const contractionMrr = Math.floor(Math.random() * 2000) + 200;

        // Generate churn MRR (customers leaving)
        const churnMrr = Math.floor(Math.random() * 3000) + 300;
        const churnedCustomers = Math.floor(Math.random() * 5) + 1;

        // Generate reactivation MRR (customers coming back)
        const reactivationMrr = Math.floor(Math.random() * 1000) + 100;

        // Calculate net new MRR
        const netNewMrr = newMrr + expansionMrr + reactivationMrr - contractionMrr - churnMrr;

        // Update active customers
        activeCustomers = activeCustomers + newCustomers - churnedCustomers;
        if (activeCustomers < 0) activeCustomers = 0;

        mrrMovementRecords.push({
            team_id: teamId,
            month_date: monthDate,
            new_mrr: newMrr,
            expansion_mrr: expansionMrr,
            contraction_mrr: contractionMrr,
            churn_mrr: churnMrr,
            reactivation_mrr: reactivationMrr,
            net_new_mrr: netNewMrr,
            new_customers: newCustomers,
            churned_customers: churnedCustomers,
            active_customers: activeCustomers
        });
    }

    return mrrMovementRecords;
}

describe('getMrrMovement', () => {
    test('accurately retrieves MRR movement data', async (t) => {
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

            // Generate sample MRR movement data
            const mrrMovementData = generateMrrMovementData(12, teamId); // 12 months of data
            console.log(`Generated sample MRR movement data: ${mrrMovementData.length} records`);
            console.log('Sample MRR movement record:', JSON.stringify(mrrMovementData[0], null, 2));

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

            // Create mrr_movement_mv_v1 table if it doesn't exist
            await ch.querier.query({
                query: `
                CREATE TABLE IF NOT EXISTS financials.mrr_movement_mv_v1 (
                    team_id String,
                    month_date Date,
                    new_mrr Float64,
                    expansion_mrr Float64,
                    contraction_mrr Float64,
                    churn_mrr Float64,
                    reactivation_mrr Float64,
                    net_new_mrr Float64,
                    new_customers UInt32,
                    churned_customers UInt32,
                    active_customers UInt32
                ) ENGINE = MergeTree()
                ORDER BY (team_id, month_date)
                `,
                schema: z.object({}),
            })({});

            console.log('Created mrr_movement_mv_v1 table');

            // Get the table structure
            const tableStructure = await ch.querier.query({
                query: 'DESCRIBE TABLE financials.mrr_movement_mv_v1',
                schema: z.object({
                    name: z.string(),
                    type: z.string(),
                }),
            })({});

            console.log('Table structure:', tableStructure.val);

            // Insert the MRR movement data
            console.log('Inserting MRR movement data in batch...');

            const inserter = ch.inserter.insert({
                table: 'financials.mrr_movement_mv_v1',
                schema: z.object({
                    team_id: z.string(),
                    month_date: z.string(),
                    new_mrr: z.number(),
                    expansion_mrr: z.number(),
                    contraction_mrr: z.number(),
                    churn_mrr: z.number(),
                    reactivation_mrr: z.number(),
                    net_new_mrr: z.number(),
                    new_customers: z.number(),
                    churned_customers: z.number(),
                    active_customers: z.number()
                })
            });

            const insertResult = await inserter(mrrMovementData);
            console.log('Batch insertion result:', insertResult);

            // Wait for data to be processed
            console.log('Waiting for data to be processed...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Verify data insertion
            console.log('Verifying data insertion...');
            const countQuery = `SELECT count(*) as count FROM financials.mrr_movement_mv_v1 WHERE team_id = '${teamId}'`;
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

            // Test the getMrrMovement function
            console.log('Testing getMrrMovement function...');
            const getMrrMovementFn = getMrrMovement(ch.querier);

            try {
                const result = await getMrrMovementFn({
                    teamId,
                    start: new Date(new Date().setMonth(new Date().getMonth() - 12)).getTime(),
                    end: new Date().getTime(),
                    limit: 100,
                });

                console.log('getMrrMovement result:', result);

                if (result.err) {
                    console.error('Error in getMrrMovement:', result.err);
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
                        expect(firstRecord.new_mrr).toBeDefined();
                        expect(firstRecord.expansion_mrr).toBeDefined();
                        expect(firstRecord.contraction_mrr).toBeDefined();
                        expect(firstRecord.churn_mrr).toBeDefined();
                        expect(firstRecord.net_new_mrr).toBeDefined();
                        expect(firstRecord.new_customers).toBeDefined();
                        expect(firstRecord.churned_customers).toBeDefined();
                        expect(firstRecord.active_customers).toBeDefined();
                    }
                }
            } catch (error) {
                console.error('Exception in getMrrMovement:', error);
                throw error;
            }
        } finally {
            console.log('Test completed, stopping container...');
            await container.stop();
        }
    }, 30000); // Increase timeout to 30 seconds
}); 