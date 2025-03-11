-- +goose up
CREATE MATERIALIZED VIEW financials.transactions_by_month_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYear(month_start)
ORDER BY (team_id, user_id, bank_account_id, month_start, category)
POPULATE
AS
SELECT
    team_id,
    user_id,
    bank_account_id,
    toStartOfMonth(date) AS month_start,
    category,
    count() AS transaction_count,
    sum(amount) AS total_amount,
    sum(if(amount < 0, abs(amount), 0)) AS total_expenses,
    sum(if(amount > 0, amount, 0)) AS total_income,
    avg(amount) AS average_amount
FROM financials.raw_transactions_v1
GROUP BY team_id, user_id, bank_account_id, month_start, category;

-- +goose down
DROP VIEW financials.transactions_by_month_mv_v1; 