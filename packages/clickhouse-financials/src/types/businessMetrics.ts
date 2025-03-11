import { z } from 'zod';

/**
 * Zod schema for ClickHouse business metrics data
 * This schema reflects the structure of the financials.business_metrics_v1 table
 */
export const businessMetricsSchema = z.object({
    // Primary identifiers
    id: z.string(),
    team_id: z.string(),

    // Time dimensions
    date: z.string(), // DateTime in ClickHouse
    date_year: z.number().optional(),
    date_month: z.number().optional(),
    date_day: z.number().optional(),

    // Revenue metrics
    mrr: z.number().default(0), // Monthly Recurring Revenue
    arr: z.number().default(0), // Annual Recurring Revenue
    one_time_revenue: z.number().default(0), // Non-recurring revenue
    total_revenue: z.number().default(0), // Total revenue (MRR + one-time)

    // MRR movement metrics
    new_mrr: z.number().default(0), // MRR from new customers
    expansion_mrr: z.number().default(0), // MRR from existing customers expanding
    contraction_mrr: z.number().default(0), // MRR lost from existing customers reducing spend
    churn_mrr: z.number().default(0), // MRR lost from customers leaving
    reactivation_mrr: z.number().default(0), // MRR from returning customers
    net_mrr_movement: z.number().default(0), // Net change in MRR

    // Customer metrics
    customer_count: z.number().default(0), // Total customers
    new_customers: z.number().default(0), // New customers added
    churned_customers: z.number().default(0), // Customers churned

    // Expense metrics
    fixed_costs: z.number().default(0), // Fixed costs
    variable_costs: z.number().default(0), // Variable costs
    total_expenses: z.number().default(0), // Total expenses

    // Cash metrics
    cash_balance: z.number().default(0), // Total cash across all accounts
    accounts_receivable: z.number().default(0), // Money owed to the business
    accounts_payable: z.number().default(0), // Money owed by the business

    // Burn rate metrics
    gross_burn: z.number().default(0), // Total expenses
    net_burn: z.number().default(0), // Expenses minus revenue
    runway_days: z.number().default(0), // Days of runway at current burn rate

    // Calculated metrics
    gross_margin: z.number().default(0), // (Revenue - COGS) / Revenue
    cac: z.number().default(0), // Customer Acquisition Cost
    ltv: z.number().default(0), // Customer Lifetime Value
    ltv_cac_ratio: z.number().default(0), // LTV / CAC

    // Currency
    base_currency: z.string().optional(),

    // Metadata
    created_at: z.string(), // DateTime in ClickHouse
    updated_at: z.string(), // DateTime in ClickHouse
});

export type BusinessMetrics = z.infer<typeof businessMetricsSchema>; 