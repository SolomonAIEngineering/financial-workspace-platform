import { describe, expect, test } from 'vitest'

import { ClickHouse } from '../../index'
import { ClickHouseContainer } from '../../testutil'
import { getCashRunway } from './getCashRunway'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

/**
 * Generate sample financial summary data for testing
 * @param n Number of months to generate data for
 * @param teamId Team ID for the financial data
 * @returns Array of financial summary data objects
 */
function generateFinancialSummaryData(n: number, teamId: string) {
    type FinancialSummaryData = {
        team_id: string;
        month_date: string;
        total_revenue: number;
        total_expenses: number;
    };

    const financialData: FinancialSummaryData[] = [];
    const now = new Date();

    // Base values for revenue and expenses
    let baseRevenue = 50000;
    let baseExpenses = 60000;

    // Generate data for n months, starting from n months ago
    for (let i = n - 1; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);

        // Add some randomness to the values but keep a trend
        const revenueGrowth = 1 + (Math.random() * 0.1 - 0.02); // -2% to +8% growth
        const expenseGrowth = 1 + (Math.random() * 0.05); // 0% to +5% growth

        baseRevenue *= revenueGrowth;
        baseExpenses *= expenseGrowth;

        financialData.push({
            team_id: teamId,
            month_date: monthDate.toISOString().split('T')[0],
            total_revenue: Math.round(baseRevenue),
            total_expenses: Math.round(baseExpenses)
        });
    }

    return financialData;
}

describe('getCashRunway', () => {
    test('accurately calculates cash runway', async (t) => {
        console.log('Starting test...');

        // Start a ClickHouse container
        const container = await ClickHouseContainer.start(t, { keepContainer: false });
        console.log('ClickHouse container started');

        try {
            // Create a ClickHouse client
            const ch = new ClickHouse({
                url: container.url(),
            });
            console.log(`ClickHouse client created with URL: ${container.url()}`);

            // Generate test ID
            const teamId = randomUUID();
            console.log('Generated test ID:', { teamId });

            // Generate sample financial data
            const financialData = generateFinancialSummaryData(12, teamId);
            console.log('Generated sample financial data:', financialData.length);
            console.log('Sample financial data:', JSON.stringify(financialData[0], null, 2));

            // List databases to check if financials exists
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

            // Create monthly_financial_summary_mv_v1 table if it doesn't exist
            await ch.querier.query({
                query: `
                CREATE TABLE IF NOT EXISTS financials.monthly_financial_summary_mv_v1 (
                    team_id String,
                    month_date Date,
                    total_revenue Float64,
                    total_expenses Float64
                ) ENGINE = MergeTree()
                ORDER BY (team_id, month_date)
                `,
                schema: z.object({}),
            })({});

            console.log('Created monthly_financial_summary_mv_v1 table');

            // Create a Zod schema for the financial data
            const financialDataSchema = z.object({
                team_id: z.string(),
                month_date: z.string(),
                total_revenue: z.number(),
                total_expenses: z.number()
            });

            // Insert the financial data
            const insertFn = ch.inserter.insert({
                table: 'financials.monthly_financial_summary_mv_v1',
                schema: financialDataSchema
            });

            const batchResult = await insertFn(financialData);
            console.log('Batch insertion result:', batchResult);

            // Wait for data to be processed
            console.log('Waiting for data to be processed...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Verify data insertion
            console.log('Verifying data insertion...');
            const countQuery = `SELECT count(*) as count FROM financials.monthly_financial_summary_mv_v1 WHERE team_id = '${teamId}'`;
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
                expect(count.val!.at(0)!.count).toBeGreaterThan(0);
            }

            // Test the getCashRunway function with calculated burn rate
            console.log('Testing getCashRunway function with calculated burn rate...');
            const getCashRunwayFn = getCashRunway(ch.querier);
            const currentCash = 100000; // $100,000 current cash

            try {
                const result = await getCashRunwayFn({
                    teamId,
                    currentCash
                });

                console.log('getCashRunway result (calculated burn rate):', result);

                if (result.err) {
                    console.error('Error in getCashRunway:', result.err);
                    throw new Error('Error in getCashRunway: ' + result.err.message);
                } else {
                    // Verify the results
                    expect(result.val).toBeDefined();
                    if (result.val && result.val.length > 0) {
                        const runway = result.val[0];

                        // Check that current_cash matches our input
                        expect(runway.current_cash).toBe(currentCash);

                        // Check that burn_rate is positive (expenses > revenue)
                        expect(runway.burn_rate).toBeGreaterThan(0);

                        // Check that runway_months is calculated correctly
                        expect(runway.runway_months).toBeCloseTo(currentCash / runway.burn_rate, 1);

                        // Store the calculated burn rate for comparison
                        const calculatedBurnRate = runway.burn_rate;

                        // Test with custom burn rate
                        console.log('Testing getCashRunway function with custom burn rate...');
                        const customBurnRate = 15000; // $15,000 per month burn rate

                        const customResult = await getCashRunwayFn({
                            teamId,
                            currentCash,
                            burnRate: customBurnRate
                        });

                        console.log('getCashRunway result (custom burn rate):', customResult);

                        if (customResult.err) {
                            console.error('Error in getCashRunway with custom burn rate:', customResult.err);
                        } else if (customResult.val && customResult.val.length > 0) {
                            const customRunway = customResult.val[0];

                            // Check that burn_rate matches our custom input
                            expect(customRunway.burn_rate).toBe(customBurnRate);

                            // Check that runway_months is calculated correctly with custom burn rate
                            expect(customRunway.runway_months).toBeCloseTo(currentCash / customBurnRate, 1);

                            // Check that the custom burn rate gives different results than the calculated one
                            expect(customRunway.burn_rate).not.toBe(calculatedBurnRate);
                            expect(customRunway.runway_months).not.toBe(runway.runway_months);
                        }
                    }
                }
            } catch (error) {
                console.error('Exception in getCashRunway:', error);
                throw error;
            }

        } finally {
            // Stop the container
            console.log('Test completed, stopping container...');
            await container.stop();
        }
    });
}); 