-- +goose up
CREATE MATERIALIZED VIEW financials.mrr_movement_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(month_date)
ORDER BY (team_id, month_date)
POPULATE
AS
WITH mrr_current AS (
    -- Current month MRR 
    SELECT
        team_id,
        customer_id,
        toStartOfMonth(today()) AS month_date,
        sum(current_mrr_amount) AS current_mrr
    FROM financials.raw_recurring_transactions_v1
    WHERE 
        status = 'active' 
        AND is_mrr_component = 1
    GROUP BY team_id, customer_id
),
mrr_previous AS (
    -- Previous month MRR
    SELECT
        team_id,
        customer_id,
        toStartOfMonth(today() - INTERVAL 1 MONTH) AS month_date,
        sum(if(
            (start_date < toStartOfMonth(today())) AND 
            (end_date IS NULL OR end_date > toStartOfMonth(today() - INTERVAL 1 MONTH)),
            current_mrr_amount,
            0
        )) AS previous_mrr
    FROM financials.raw_recurring_transactions_v1
    WHERE is_mrr_component = 1
    GROUP BY team_id, customer_id
)
SELECT
    c.team_id,
    toStartOfMonth(today()) AS month_date,
    
    -- Total current and previous MRR
    sum(c.current_mrr) AS current_month_mrr,
    sum(p.previous_mrr) AS previous_month_mrr,
    
    -- New customers (didn't exist last month)
    sum(if(p.customer_id IS NULL, c.current_mrr, 0)) AS new_mrr,
    count(if(p.customer_id IS NULL, 1, NULL)) AS new_customers,
    
    -- Expansion (existing customers who increased)
    sum(if(p.customer_id IS NOT NULL AND c.current_mrr > p.previous_mrr, c.current_mrr - p.previous_mrr, 0)) AS expansion_mrr,
    count(if(p.customer_id IS NOT NULL AND c.current_mrr > p.previous_mrr, 1, NULL)) AS expanded_customers,
    
    -- Contraction (existing customers who decreased)
    sum(if(p.customer_id IS NOT NULL AND c.current_mrr < p.previous_mrr AND c.current_mrr > 0, p.previous_mrr - c.current_mrr, 0)) AS contraction_mrr,
    count(if(p.customer_id IS NOT NULL AND c.current_mrr < p.previous_mrr AND c.current_mrr > 0, 1, NULL)) AS contracted_customers,
    
    -- Churn (customers who left)
    sum(if(p.customer_id IS NOT NULL AND c.current_mrr = 0, p.previous_mrr, 0)) AS churned_mrr,
    count(if(p.customer_id IS NOT NULL AND c.current_mrr = 0, 1, NULL)) AS churned_customers,
    
    -- Net movement
    sum(c.current_mrr) - sum(p.previous_mrr) AS net_mrr_movement
FROM mrr_current c
FULL OUTER JOIN mrr_previous p ON c.team_id = p.team_id AND c.customer_id = p.customer_id
GROUP BY c.team_id;

-- +goose down
DROP VIEW financials.mrr_movement_mv_v1; 