-- +goose up
CREATE TABLE financials.business_metrics_v1 (
    -- Primary identifiers
    id String,
    team_id String,
    
    -- Time dimensions
    date DateTime,
    date_year UInt16 MATERIALIZED toYear(date),
    date_month UInt8 MATERIALIZED toMonth(date),
    date_day UInt8 MATERIALIZED toDayOfMonth(date),
    
    -- Revenue metrics
    mrr Float64 DEFAULT 0, -- Monthly Recurring Revenue
    arr Float64 DEFAULT 0, -- Annual Recurring Revenue
    one_time_revenue Float64 DEFAULT 0, -- Non-recurring revenue
    total_revenue Float64 DEFAULT 0, -- Total revenue (MRR + one-time)
    
    -- MRR movement metrics
    new_mrr Float64 DEFAULT 0, -- MRR from new customers
    expansion_mrr Float64 DEFAULT 0, -- MRR from existing customers expanding
    contraction_mrr Float64 DEFAULT 0, -- MRR lost from existing customers reducing spend
    churn_mrr Float64 DEFAULT 0, -- MRR lost from customers leaving
    reactivation_mrr Float64 DEFAULT 0, -- MRR from returning customers
    net_mrr_movement Float64 DEFAULT 0, -- Net change in MRR
    
    -- Customer metrics
    customer_count UInt32 DEFAULT 0, -- Total customers
    new_customers UInt32 DEFAULT 0, -- New customers added
    churned_customers UInt32 DEFAULT 0, -- Customers churned
    
    -- Expense metrics
    fixed_costs Float64 DEFAULT 0, -- Fixed costs
    variable_costs Float64 DEFAULT 0, -- Variable costs
    total_expenses Float64 DEFAULT 0, -- Total expenses
    
    -- Cash metrics
    cash_balance Float64 DEFAULT 0, -- Total cash across all accounts
    accounts_receivable Float64 DEFAULT 0, -- Money owed to the business
    accounts_payable Float64 DEFAULT 0, -- Money owed by the business
    
    -- Burn rate metrics
    gross_burn Float64 DEFAULT 0, -- Total expenses
    net_burn Float64 DEFAULT 0, -- Expenses minus revenue
    runway_days UInt32 DEFAULT 0, -- Days of runway at current burn rate
    
    -- Calculated metrics
    gross_margin Float64 DEFAULT 0, -- (Revenue - COGS) / Revenue
    cac Float64 DEFAULT 0, -- Customer Acquisition Cost
    ltv Float64 DEFAULT 0, -- Customer Lifetime Value
    ltv_cac_ratio Float64 DEFAULT 0, -- LTV / CAC
    
    -- Currency
    base_currency LowCardinality(String),
    
    -- Metadata
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(updated_at)
PARTITION BY toYYYYMM(date)
ORDER BY (team_id, date)
SETTINGS index_granularity = 8192;

-- +goose down
DROP TABLE financials.business_metrics_v1; 