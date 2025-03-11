-- +goose up
CREATE MATERIALIZED VIEW financials.recurring_transactions_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(month_start)
ORDER BY (team_id, user_id, month_start, merchant_name, is_recurring)
POPULATE
AS
SELECT
    team_id,
    user_id,
    toStartOfMonth(date) AS month_start,
    merchant_name,
    is_recurring,
    recurring_transaction_id,
    count() AS occurrence_count,
    sum(amount) AS total_amount,
    avg(amount) AS average_amount
FROM financials.raw_transactions_v1
WHERE is_recurring = 1 OR merchant_name IN (
    SELECT merchant_name
    FROM financials.raw_transactions_v1
    GROUP BY user_id, merchant_name
    HAVING count() >= 3
)
GROUP BY team_id, user_id, month_start, merchant_name, is_recurring, recurring_transaction_id;

-- +goose down
DROP VIEW financials.recurring_transactions_mv_v1; 