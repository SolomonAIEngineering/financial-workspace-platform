-- +goose up
CREATE MATERIALIZED VIEW financials.recurring_pattern_detection_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(month)
ORDER BY (team_id, user_id, merchant_name, day_of_month)
POPULATE
AS
SELECT
    team_id,
    user_id,
    merchant_name,
    toStartOfMonth(date) AS month,
    toDayOfMonth(date) AS day_of_month,
    count() AS occurrences,
    avg(amount) AS average_amount,
    stddevPop(amount) AS amount_stddev,
    max(date) AS latest_date,
    min(date) AS first_date,
    dateDiff('day', min(date), max(date)) AS date_span_days,
    count() / (dateDiff('month', toStartOfMonth(min(date)), toStartOfMonth(max(date))) + 1) AS transactions_per_month,
    groupArray(id) AS transaction_ids
FROM financials.raw_transactions_v1
WHERE 
    merchant_name != ''
    AND date >= (today() - INTERVAL 6 MONTH)
GROUP BY team_id, user_id, merchant_name, month, day_of_month
HAVING occurrences >= 2;

-- +goose down
DROP VIEW financials.recurring_pattern_detection_mv_v1; 