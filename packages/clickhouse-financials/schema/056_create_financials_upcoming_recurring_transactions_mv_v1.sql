-- +goose up
CREATE MATERIALIZED VIEW financials.upcoming_recurring_transactions_mv_v1
ENGINE = SummingMergeTree()
ORDER BY (team_id, user_id, days_to_next_execution, bank_account_id)
SETTINGS allow_nullable_key = 1
POPULATE
AS
SELECT
    team_id,
    user_id,
    bank_account_id,
    next_scheduled_date,
    days_to_next_execution,
    count() AS upcoming_transactions_count,
    sum(amount) AS total_amount,
    groupArray(title) AS transaction_titles,
    groupArray(id) AS transaction_ids
FROM financials.raw_recurring_transactions_v1
WHERE next_scheduled_date IS NOT NULL 
  AND next_scheduled_date > today()
  AND next_scheduled_date <= (today() + INTERVAL 30 DAY)
  AND status = 'active' 
  AND allow_execution = 1
GROUP BY team_id, user_id, bank_account_id, next_scheduled_date, days_to_next_execution;

-- +goose down
DROP VIEW financials.upcoming_recurring_transactions_mv_v1; 