-- +goose up
CREATE MATERIALIZED VIEW financials.cash_runway_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(month_date)
ORDER BY (team_id, month_date)
POPULATE
AS
SELECT
    team_id,
    toStartOfMonth(date) AS month_date,
    
    -- Income components
    sum(if(amount > 0 AND NOT is_transfer AND NOT is_investment, amount, 0)) AS total_income,
    sum(if(amount > 0 AND is_subscription, amount, 0)) AS subscription_income,
    sum(if(amount > 0 AND NOT is_subscription AND NOT is_transfer AND NOT is_investment, amount, 0)) AS non_subscription_income,
    sum(if(amount > 0 AND is_investment, amount, 0)) AS investment_income,
    
    -- Expense components
    sum(if(amount < 0 AND NOT is_transfer, abs(amount), 0)) AS total_expenses,
    sum(if(is_cogs = 1, abs(amount), 0)) AS cogs,
    sum(if(is_opex = 1, abs(amount), 0)) AS opex,
    
    -- Cash movement
    sum(amount) AS net_cash_movement,
    
    -- Burn rate calculations
    sum(if(amount < 0 AND NOT is_transfer, abs(amount), 0)) AS gross_burn,
    sum(if(NOT is_transfer AND NOT is_investment, amount, 0)) AS net_burn,
    
    -- Initial and final bank balances need to be calculated separately
    0 AS starting_balance,
    0 AS ending_balance,
    0 AS runway_days
FROM financials.raw_transactions_v1
GROUP BY team_id, month_date;

-- +goose down
DROP VIEW financials.cash_runway_mv_v1; 