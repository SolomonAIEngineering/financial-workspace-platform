-- +goose up
CREATE MATERIALIZED VIEW financials.recurring_transactions_by_status_mv_v1
ENGINE = SummingMergeTree()
ORDER BY (team_id, user_id, status, frequency)
POPULATE
AS
SELECT
    team_id,
    user_id,
    bank_account_id,
    status,
    frequency,
    count() AS count,
    sum(if(is_variable = 1, 1, 0)) AS variable_count,
    sum(if(is_automated = 1, 1, 0)) AS automated_count,
    sum(amount) AS total_amount
FROM financials.raw_recurring_transactions_v1
GROUP BY team_id, user_id, bank_account_id, status, frequency;

-- +goose down
DROP VIEW financials.recurring_transactions_by_status_mv_v1; 