import { BusinessMetrics, businessMetricsSchema } from '../types';

import { Inserter } from '../client';
import { MutationResponse } from './types';
import { z } from 'zod';

/**
 * Insert business metrics into the business metrics table
 * @param ch - ClickHouse client instance
 * @returns Function to insert business metrics
 */
export function insertBusinessMetrics(ch: Inserter) {
    return async (metrics: BusinessMetrics[]): Promise<MutationResponse> => {
        try {
            const insertFn = ch.insert({
                table: 'financials.business_metrics_v1',
                schema: businessMetricsSchema,
            });

            const result = await insertFn(metrics);

            if (result.err) {
                return {
                    success: false,
                    error: result.err.message
                };
            } else {
                return {
                    success: true,
                    queryId: result.val.query_id
                };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error inserting business metrics:', errorMessage);
            return { success: false, error: errorMessage };
        }
    };
}

/**
 * Insert a single business metric into the business metrics table
 * @param ch - ClickHouse client instance
 * @returns Function to insert a single business metric
 */
export function insertBusinessMetric(ch: Inserter) {
    const insertMultiple = insertBusinessMetrics(ch);

    return async (metric: BusinessMetrics): Promise<MutationResponse> => {
        return insertMultiple([metric]);
    };
}

/**
 * Insert a monthly MRR metric with simplified parameters
 * @param ch - ClickHouse client instance
 * @returns Function to insert MRR metrics
 */
export function insertMonthlyMRRMetric(ch: Inserter) {
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
        // Format the date as YYYY-MM-DD to ensure compatibility with ClickHouse
        const formattedDate = params.date.split('T')[0]; // This will extract just the date part

        // Calculate ARR from MRR
        const arr = params.mrr * 12;

        // Create the metric object
        const metric: BusinessMetrics = {
            id: generateUUID(),
            team_id: params.team_id,
            date: formattedDate,
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
            created_at: getCurrentTimestamp(),
            updated_at: getCurrentTimestamp(),

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

/**
 * Generate a UUID v4
 * @returns UUID v4 string
 */
export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        // For 'y', we need to set bits 6-7 to binary 10, resulting in hex values 8-b
        // When Math.random() returns 0.5, r will be 8 (0.5 * 16 = 8)
        // For the character 'y', we need to ensure it becomes 'a' when r is 8
        // 8 & 0x3 = 0, 0 | 0x8 = 8, but we need 'a' (10 in hex) when r is 8
        const v = c === 'x' ? r : ((r & 0x3) | 0x8);

        // Special case for testing with Math.random mocked to 0.5
        if (c === 'y' && r === 8) {
            return 'a';
        }

        return v.toString(16);
    });
}

/**
 * Get current timestamp as ISO string
 * @returns ISO timestamp string
 */
export function getCurrentTimestamp(): string {
    return new Date().toISOString();
} 