-- +goose up
CREATE MATERIALIZED VIEW financials.business_expense_categories_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(month_date)
ORDER BY (team_id, month_date, category)
POPULATE
AS
SELECT
    team_id,
    toStartOfMonth(date) AS month_date,
    category,
    accounting_category,
    department,
    cost_center,
    -- Expense metrics
    count() AS transaction_count,
    sum(abs(amount)) AS total_amount,
    avg(abs(amount)) AS average_amount,
    min(abs(amount)) AS min_amount,
    max(abs(amount)) AS max_amount
FROM financials.raw_transactions_v1
WHERE amount < 0 AND NOT is_transfer
GROUP BY team_id, month_date, category, accounting_category, department, cost_center;

-- +goose down
DROP VIEW financials.business_expense_categories_mv_v1; 