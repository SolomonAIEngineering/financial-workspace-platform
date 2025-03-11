-- +goose up
CREATE MATERIALIZED VIEW financials.merchant_spending_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(month_start)
ORDER BY (team_id, user_id, month_start, merchant_name)
POPULATE
AS
SELECT
    team_id,
    user_id,
    toStartOfMonth(date) AS month_start,
    merchant_name,
    count() AS transaction_count,
    sum(abs(amount)) AS total_spent,
    min(date) AS first_transaction,
    max(date) AS latest_transaction,
    avg(amount) AS average_amount
FROM financials.raw_transactions_v1
WHERE amount < 0 AND merchant_name != ''
GROUP BY team_id, user_id, month_start, merchant_name;

-- +goose down
DROP VIEW financials.merchant_spending_mv_v1; 