-- +goose up
CREATE MATERIALIZED VIEW financials.monthly_cash_flow_forecast_mv_v1
ENGINE = SummingMergeTree()
ORDER BY (team_id, user_id, bank_account_id, month_start, is_expense)
SETTINGS allow_nullable_key = 1
POPULATE
AS
SELECT
    team_id,
    user_id,
    bank_account_id,
    toStartOfMonth(next_scheduled_date) AS month_start,
    amount < 0 AS is_expense,
    count() AS transaction_count,
    sum(abs(amount)) AS total_amount,
    min(next_scheduled_date) AS first_transaction_date,
    max(next_scheduled_date) AS last_transaction_date,
    groupArray(title) AS transaction_titles
FROM financials.raw_recurring_transactions_v1
WHERE next_scheduled_date IS NOT NULL 
  AND status = 'active' 
  AND allow_execution = 1
  AND next_scheduled_date <= (today() + INTERVAL 90 DAY)
GROUP BY team_id, user_id, bank_account_id, month_start, is_expense;

-- +goose down
DROP VIEW financials.monthly_cash_flow_forecast_mv_v1; 