-- +goose up
CREATE MATERIALIZED VIEW financials.mrr_tracking_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(month_date)
ORDER BY (team_id, month_date, category)
POPULATE
AS
SELECT
    team_id,
    toStartOfMonth(date) AS month_date,
    date_year,
    date_month,
    category,
    is_subscription_revenue,
    -- MRR components
    sum(if(is_revenue = 1 AND is_subscription_revenue = 1, amount, 0)) AS subscription_revenue,
    sum(if(is_revenue = 1 AND is_subscription_revenue = 0, amount, 0)) AS one_time_revenue,
    -- Expense components
    sum(if(is_expense = 1 AND is_fixed_cost = 1, abs(amount), 0)) AS fixed_costs,
    sum(if(is_expense = 1 AND is_variable_cost = 1, abs(amount), 0)) AS variable_costs,
    -- Calculate MRR based on recurring transactions
    sum(if(is_mrr_component = 1, current_mrr_amount, 0)) AS mrr,
    -- Calculate ARR (simply MRR * 12 for most businesses)
    sum(if(is_mrr_component = 1, current_mrr_amount, 0)) * 12 AS arr,
    -- Customer count from recurring transactions
    count(DISTINCT customer_id) AS customer_count
FROM (
    -- Include recurring transactions for MRR calculation
    SELECT
        team_id,
        start_date AS date,
        toYear(start_date) AS date_year,
        toMonth(start_date) AS date_month,
        category_slug AS category,
        0 AS is_revenue,
        0 AS is_subscription_revenue,
        1 AS is_expense,
        is_fixed_cost,
        is_variable_cost,
        is_mrr_component,
        current_mrr_amount,
        amount,
        customer_id
    FROM financials.raw_recurring_transactions_v1
    WHERE status = 'active' AND is_mrr_component = 1
    
    UNION ALL
    
    -- Include actual transactions for revenue/expense tracking
    SELECT
        team_id,
        date,
        date_year,
        date_month,
        category,
        is_revenue,
        is_subscription,
        CAST(is_cogs OR is_opex AS UInt8) AS is_expense,
        CAST(NOT is_variable_cost AS UInt8) AS is_fixed_cost,
        is_variable_cost,
        0 AS is_mrr_component,
        0 AS current_mrr_amount,
        amount,
        customer_id
    FROM financials.raw_transactions_v1
)
GROUP BY team_id, month_date, date_year, date_month, category, is_subscription_revenue;

-- +goose down
DROP VIEW financials.mrr_tracking_mv_v1; 