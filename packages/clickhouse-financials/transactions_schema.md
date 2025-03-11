# ClickHouse Schema for Financial Transactions

This document outlines the ClickHouse schema for storing and analyzing financial transactions. The schema is designed to support high-performance analytical queries on financial data.

## Raw Transactions Table

```sql
CREATE TABLE financials.raw_transactions_v1 (
    -- Primary identifiers
    id String,
    user_id String,
    bank_account_id String,
    plaid_transaction_id String,

    -- Transaction details
    amount Float64,
    iso_currency_code LowCardinality(String),
    date DateTime,
    name String,
    merchant_name String,
    description String,
    pending UInt8,

    -- Time dimensions (for efficient aggregations)
    date_year UInt16 MATERIALIZED toYear(date),
    date_month UInt8 MATERIALIZED toMonth(date),
    date_day UInt8 MATERIALIZED toDayOfMonth(date),
    date_day_of_week UInt8 MATERIALIZED toDayOfWeek(date),
    date_week_of_year UInt8 MATERIALIZED toWeek(date),
    
    -- Categorization
    category LowCardinality(String),
    sub_category String,
    custom_category String,
    category_icon_url String,
    
    -- Merchant data
    merchant_id String,
    merchant_logo_url String,
    merchant_category String,
    merchant_website String,
    
    -- Location data (flattened from JSON)
    latitude Float64,
    longitude Float64,
    location_city String,
    location_state String,
    location_country String,
    location_postal_code String,
    
    -- Payment metadata
    payment_channel LowCardinality(String),
    payment_method LowCardinality(String),
    transaction_type LowCardinality(String),
    transaction_method LowCardinality(String),
    
    -- Financial attributes
    tax_amount Float64,
    tax_rate Float64,
    vat_amount Float64,
    vat_rate Float64,
    
    -- Business categorization
    business_purpose String,
    cost_center String,
    project_code String,
    
    -- Personal finance flags
    exclude_from_budget UInt8,
    is_recurring UInt8,
    recurring_transaction_id String,
    
    -- Cash flow classification
    cash_flow_category LowCardinality(String),
    need_want_category LowCardinality(String),
    
    -- User interaction flags
    is_manual UInt8,
    is_modified UInt8,
    is_verified UInt8,
    is_reconciled UInt8,
    
    -- Tags and organization
    tags Array(String),
    labels Array(String),
    
    -- Split transaction support
    parent_transaction_id String,
    is_split UInt8,
    split_total Float64,
    
    -- Timestamps
    created_at DateTime,
    updated_at DateTime,
    imported_at DateTime,
    
    -- Other flags
    is_internal UInt8,
    has_been_notified UInt8,
    frequency LowCardinality(String)
)
ENGINE = ReplacingMergeTree(updated_at)
PARTITION BY toYYYYMM(date)
ORDER BY (user_id, bank_account_id, date, id)
SETTINGS index_granularity = 8192;
```

## Recurring Transactions Table

```sql
CREATE TABLE financials.raw_recurring_transactions_v1 (
    -- Primary identifiers
    id String,
    user_id String,
    bank_account_id String,
    
    -- Basic information
    title String,
    description String,
    amount Float64,
    currency LowCardinality(String),
    
    -- Account information
    initial_account_balance Float64,
    
    -- Schedule information
    frequency LowCardinality(String), -- Weekly, monthly, annually, etc.
    interval UInt8, -- Every X days/weeks/months
    start_date DateTime,
    end_date DateTime NULL,
    day_of_month UInt8 NULL, -- For monthly: which day (1-31)
    day_of_week UInt8 NULL, -- For weekly: which day (0-6, 0=Sunday)
    week_of_month Int8 NULL, -- For monthly: which week (1-5, -1=last)
    month_of_year UInt8 NULL, -- For yearly: which month (1-12)
    execution_days Array(UInt8), -- For custom frequencies: which days to execute
    
    -- Time dimensions (for efficient aggregations)
    start_date_year UInt16 MATERIALIZED toYear(start_date),
    start_date_month UInt8 MATERIALIZED toMonth(start_date),
    
    -- Schedule options
    skip_weekends UInt8,
    adjust_for_holidays UInt8,
    allow_execution UInt8,
    limit_executions UInt32 NULL,
    
    -- Transaction template
    transaction_template String, -- Stored as JSON
    category_slug String,
    tags Array(String),
    notes String,
    custom_fields String, -- Stored as JSON
    
    -- Bank account specific details
    target_account_id String,
    affect_available_balance UInt8,
    
    -- Execution tracking
    last_executed_at DateTime NULL,
    next_scheduled_date DateTime NULL,
    execution_count UInt32,
    total_executed Float64,
    last_execution_status LowCardinality(String),
    last_execution_error String,
    
    -- Account health monitoring
    min_balance_required Float64 NULL,
    overspend_action LowCardinality(String),
    insufficient_funds_count UInt32,
    
    -- Smart variance handling
    expected_amount Float64 NULL,
    allowed_variance Float64 NULL,
    variance_action LowCardinality(String),
    
    -- Reminders and notifications
    reminder_days Array(UInt8),
    reminder_sent_at DateTime NULL,
    notify_on_execution UInt8,
    notify_on_failure UInt8,
    
    -- Status fields
    status LowCardinality(String), -- active, paused, completed, cancelled
    is_automated UInt8,
    requires_approval UInt8,
    is_variable UInt8,
    
    -- Metadata
    source LowCardinality(String),
    confidence_score Float64 NULL,
    merchant_id String,
    merchant_name String,
    
    -- Categorization
    transaction_type LowCardinality(String),
    importance_level LowCardinality(String),
    
    -- Time to next execution (calculated)
    days_to_next_execution Int32 MATERIALIZED if(next_scheduled_date IS NOT NULL, dateDiff('day', today(), next_scheduled_date), NULL),
    
    -- Audit trail
    created_at DateTime,
    updated_at DateTime,
    last_modified_by String
)
ENGINE = ReplacingMergeTree(updated_at)
PARTITION BY toYYYYMM(start_date)
ORDER BY (user_id, bank_account_id, id)
SETTINGS index_granularity = 8192;
```

## Recurring Transactions Materialized Views

#### Upcoming Recurring Transactions

```sql
CREATE MATERIALIZED VIEW financials.upcoming_recurring_transactions_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(today())
ORDER BY (user_id, days_to_next_execution, bank_account_id)
POPULATE
AS
SELECT
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
GROUP BY user_id, bank_account_id, next_scheduled_date, days_to_next_execution;
```

#### Recurring Transactions By Status

```sql
CREATE MATERIALIZED VIEW financials.recurring_transactions_by_status_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(today())
ORDER BY (user_id, status, frequency)
POPULATE
AS
SELECT
    user_id,
    bank_account_id,
    status,
    frequency,
    count() AS count,
    sum(if(is_variable = 1, 1, 0)) AS variable_count,
    sum(if(is_automated = 1, 1, 0)) AS automated_count,
    sum(amount) AS total_amount
FROM financials.raw_recurring_transactions_v1
GROUP BY user_id, bank_account_id, status, frequency;
```

#### Monthly Cash Flow Forecast

```sql
CREATE MATERIALIZED VIEW financials.monthly_cash_flow_forecast_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(month_start)
ORDER BY (user_id, bank_account_id, month_start, is_expense)
POPULATE
AS
SELECT
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
GROUP BY user_id, bank_account_id, month_start, is_expense;
```

### Example Recurring Transaction Queries

#### Cash Flow Projection For Next 30 Days

```sql
SELECT
    user_id,
    bank_account_id,
    sum(if(amount > 0, amount, 0)) AS projected_income,
    sum(if(amount < 0, abs(amount), 0)) AS projected_expenses,
    sum(amount) AS net_projected_balance,
    count() AS total_recurring_transactions
FROM financials.raw_recurring_transactions_v1
WHERE status = 'active'
  AND allow_execution = 1
  AND next_scheduled_date IS NOT NULL
  AND next_scheduled_date > today()
  AND next_scheduled_date <= (today() + INTERVAL 30 DAY)
GROUP BY user_id, bank_account_id
ORDER BY user_id, bank_account_id;
```

#### Most Important Recurring Transactions

```sql
SELECT
    user_id,
    title,
    amount,
    frequency,
    next_scheduled_date,
    importance_level,
    merchant_name,
    execution_count,
    total_executed
FROM financials.raw_recurring_transactions_v1
WHERE status = 'active'
  AND user_id = 'user123'
  AND importance_level IN ('Critical', 'High')
ORDER BY 
    CASE importance_level
        WHEN 'Critical' THEN 1
        WHEN 'High' THEN 2
        ELSE 3
    END ASC,
    abs(amount) DESC;
```

#### Recurring Transactions Requiring Attention

```sql
SELECT
    id,
    user_id,
    bank_account_id,
    title,
    amount,
    status,
    next_scheduled_date,
    min_balance_required,
    last_execution_status,
    last_execution_error,
    insufficient_funds_count
FROM financials.raw_recurring_transactions_v1
WHERE (
    (next_scheduled_date IS NOT NULL AND next_scheduled_date <= today() + INTERVAL 7 DAY AND status = 'active') OR
    (last_execution_status = 'failed') OR
    (insufficient_funds_count > 0) OR
    (min_balance_required IS NOT NULL AND min_balance_required > 0)
)
ORDER BY next_scheduled_date ASC NULLS LAST;
```

#### Monthly Recurring Transaction Totals

```sql
SELECT
    toStartOfMonth(start_date) AS month,
    transaction_type,
    count() AS transaction_count,
    sum(amount) AS monthly_commitment,
    max(created_at) AS latest_added
FROM financials.raw_recurring_transactions_v1
WHERE user_id = 'user123'
  AND status = 'active'
  AND frequency IN ('MONTHLY', 'SEMI_MONTHLY')
GROUP BY month, transaction_type
ORDER BY month DESC, transaction_type;
```

## Materialized Views

### Transactions By Day

```sql
CREATE MATERIALIZED VIEW financials.transactions_by_day_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(day)
ORDER BY (user_id, bank_account_id, day, category)
POPULATE
AS
SELECT
    user_id,
    bank_account_id,
    toDate(date) AS day,
    category,
    count() AS transaction_count,
    sum(amount) AS total_amount,
    sum(if(amount < 0, abs(amount), 0)) AS total_expenses,
    sum(if(amount > 0, amount, 0)) AS total_income,
    avg(amount) AS average_amount
FROM financials.raw_transactions_v1
GROUP BY user_id, bank_account_id, day, category;
```

### Transactions By Month

```sql
CREATE MATERIALIZED VIEW financials.transactions_by_month_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYear(month_start)
ORDER BY (user_id, bank_account_id, month_start, category)
POPULATE
AS
SELECT
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
GROUP BY user_id, bank_account_id, month_start, category;
```

### Merchant Analysis

```sql
CREATE MATERIALIZED VIEW financials.merchant_spending_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(month_start)
ORDER BY (user_id, month_start, merchant_name)
POPULATE
AS
SELECT
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
GROUP BY user_id, month_start, merchant_name;
```

### Recurring Transactions Analysis

```sql
CREATE MATERIALIZED VIEW financials.recurring_transactions_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(month_start)
ORDER BY (user_id, month_start, merchant_name, is_recurring)
POPULATE
AS
SELECT
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
GROUP BY user_id, month_start, merchant_name, is_recurring, recurring_transaction_id;
```

## Transaction & Recurring Transaction Combined Views

### Recurring Pattern Identification View

This materialized view helps identify transaction patterns that may be recurring:

```sql
CREATE MATERIALIZED VIEW financials.recurring_pattern_detection_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(month)
ORDER BY (user_id, merchant_name, day_of_month)
POPULATE
AS
SELECT
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
GROUP BY user_id, merchant_name, month, day_of_month
HAVING occurrences >= 2;
```

### Financial Calendar View

This view combines recurring and one-time transactions to create a unified financial calendar:

```sql
CREATE VIEW financials.financial_calendar_v1 AS
-- Actual transactions
SELECT
    id AS event_id,
    user_id,
    bank_account_id,
    name AS title,
    amount,
    'actual' AS event_type,
    date AS event_date,
    merchant_name,
    category,
    NULL AS recurring_id
FROM financials.raw_transactions_v1
WHERE date >= (today() - INTERVAL 30 DAY)

UNION ALL

-- Upcoming recurring transactions
SELECT
    id AS event_id,
    user_id,
    bank_account_id,
    title,
    amount,
    'recurring' AS event_type,
    next_scheduled_date AS event_date,
    merchant_name,
    category_slug AS category,
    id AS recurring_id
FROM financials.raw_recurring_transactions_v1
WHERE 
    status = 'active'
    AND next_scheduled_date IS NOT NULL
    AND next_scheduled_date > today()
    AND next_scheduled_date <= (today() + INTERVAL 90 DAY);
```

### Recurring Transaction Assignment View

This view helps associate regular transactions with their detected recurring pattern:

```sql
CREATE MATERIALIZED VIEW financials.transactions_with_recurring_v1
ENGINE = ReplacingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (user_id, bank_account_id, date, id)
POPULATE
AS
SELECT
    t.id,
    t.user_id,
    t.bank_account_id,
    t.amount,
    t.date,
    t.name,
    t.merchant_name,
    t.category,
    t.is_recurring,
    t.recurring_transaction_id,
    
    -- Add recurring information when available
    r.id AS linked_recurring_id,
    r.title AS recurring_title,
    r.frequency AS recurring_frequency,
    r.execution_count AS recurring_occurrence_count,
    
    -- Check if pattern matches
    if(
        t.is_recurring = 0 AND 
        t.recurring_transaction_id IS NULL AND
        r.id IS NULL AND
        (
            t.merchant_name != '' AND
            t.merchant_name IN (
                SELECT merchant_name
                FROM financials.raw_transactions_v1
                WHERE user_id = t.user_id
                GROUP BY merchant_name
                HAVING count() >= 3
            )
        ),
        1,
        0
    ) AS potential_recurring_pattern
FROM financials.raw_transactions_v1 t
LEFT JOIN financials.raw_recurring_transactions_v1 r ON 
    t.recurring_transaction_id = r.id AND
    t.user_id = r.user_id;
```

## Example Queries

### Monthly Spending Summary

```sql
SELECT
    user_id,
    toStartOfMonth(date) AS month,
    sum(if(amount < 0, abs(amount), 0)) AS total_expenses,
    sum(if(amount > 0, amount, 0)) AS total_income,
    sum(amount) AS net_change
FROM financials.raw_transactions_v1
WHERE user_id = 'user123' AND date >= toDate('2023-01-01') AND date <= toDate('2023-12-31')
GROUP BY user_id, month
ORDER BY month;
```

### Category Breakdown

```sql
SELECT
    category,
    count() AS transaction_count,
    sum(abs(amount)) AS total_amount,
    round(sum(abs(amount)) / sum(sum(abs(amount))) OVER () * 100, 2) AS percentage
FROM financials.raw_transactions_v1
WHERE user_id = 'user123' 
  AND amount < 0 
  AND date >= toDate('2023-01-01') 
  AND date <= toDate('2023-01-31')
GROUP BY category
ORDER BY total_amount DESC;
```

### Top Merchants

```sql
SELECT
    merchant_name,
    count() AS transaction_count,
    sum(abs(amount)) AS total_spent
FROM financials.raw_transactions_v1
WHERE user_id = 'user123' 
  AND amount < 0 
  AND date >= toStartOfMonth(now()) - INTERVAL 6 MONTH
  AND date <= toEndOfMonth(now())
GROUP BY merchant_name
ORDER BY total_spent DESC
LIMIT 10;
```

### Day of Week Analysis

```sql
SELECT
    date_day_of_week,
    formatDateTime(toDateTime('1970-01-05') + (date_day_of_week - 1) * 86400, '%A') AS day_name,
    count() AS transaction_count,
    sum(abs(amount)) AS total_amount,
    avg(abs(amount)) AS average_amount
FROM financials.raw_transactions_v1
WHERE user_id = 'user123' AND amount < 0
GROUP BY date_day_of_week, day_name
ORDER BY date_day_of_week;
```

### Spending Trend Analysis

```sql
SELECT
    toStartOfMonth(date) AS month,
    category,
    sum(abs(amount)) AS total_spent
FROM financials.raw_transactions_v1
WHERE user_id = 'user123' 
  AND amount < 0 
  AND date >= toDate('2023-01-01') 
  AND date <= toDate('2023-12-31')
GROUP BY month, category
ORDER BY month, total_spent DESC;
```

## Schema Benefits

1. **Performance**: ClickHouse's columnar storage provides excellent performance for analytical queries
2. **Partitioning**: Data is partitioned by month for efficient historical queries
3. **Materialized Views**: Pre-computed aggregations for common analytics needs
4. **Flexible Analysis**: Support for detailed financial analytics across dimensions
5. **Time-Series Analysis**: Optimized for time-based financial reporting

## Data Ingestion

For optimal performance, it's recommended to:

1. Batch transaction imports when possible
2. Use the ClickHouse client's bulk insert capabilities
3. Implement retry logic for failed inserts
4. Consider incremental ETL jobs for syncing from the main database

## Maintenance Considerations

1. **Partitioning Strategy**: The schema uses monthly partitioning, suitable for most use cases
2. **Data Retention**: Implement TTL policies for historical data if needed
3. **Materialized View Updates**: Views automatically update as new data is inserted
4. **Backups**: Regular backups should be configured
5. **Monitoring**: Monitor query performance and storage usage 

# ClickHouse Schema for Business Financial Analytics

This document outlines the ClickHouse schema for storing and analyzing financial transactions for small businesses. The schema is designed to support high-performance analytical queries focused on business metrics like MRR, ARR, runway, and other critical financial insights.

## Raw Transactions Table

```sql
CREATE TABLE financials.raw_transactions_v1 (
    -- Primary identifiers
    id String,
    user_id String,
    team_id String, -- Business/organization identifier
    bank_account_id String,
    plaid_transaction_id String,

    -- Transaction details
    amount Float64,
    iso_currency_code LowCardinality(String),
    date DateTime,
    name String,
    merchant_name String,
    description String,
    pending UInt8,

    -- Time dimensions (for efficient aggregations)
    date_year UInt16 MATERIALIZED toYear(date),
    date_month UInt8 MATERIALIZED toMonth(date),
    date_day UInt8 MATERIALIZED toDayOfMonth(date),
    date_day_of_week UInt8 MATERIALIZED toDayOfWeek(date),
    date_week_of_year UInt8 MATERIALIZED toWeek(date),
    
    -- Business categorization
    category LowCardinality(String),
    sub_category String,
    custom_category String,
    category_icon_url String,
    
    -- Business expense classification
    is_cogs UInt8, -- Cost of Goods Sold
    is_opex UInt8, -- Operating Expense
    is_capex UInt8, -- Capital Expenditure
    is_revenue UInt8, -- Revenue transaction
    is_refund UInt8, -- Refund transaction
    is_investment UInt8, -- Investment/funding
    is_owner_draw UInt8, -- Owner withdrawal
    is_tax UInt8, -- Tax payment
    is_transfer UInt8, -- Internal transfer
    
    -- Merchant data
    merchant_id String,
    merchant_logo_url String,
    merchant_category String,
    merchant_website String,
    
    -- Payment metadata
    payment_channel LowCardinality(String),
    payment_method LowCardinality(String),
    transaction_type LowCardinality(String),
    transaction_method LowCardinality(String),
    
    -- Financial attributes
    tax_amount Float64,
    tax_rate Float64,
    vat_amount Float64,
    vat_rate Float64,
    
    -- Business metadata
    department String,
    project String,
    cost_center String,
    invoice_id String,
    customer_id String,
    vendor_id String,
    
    -- Accounting classification
    accounting_category LowCardinality(String),
    gl_account String, -- General Ledger account
    
    -- Cash flow classification
    cash_flow_category LowCardinality(String),
    
    -- Flags
    exclude_from_budget UInt8,
    is_recurring UInt8,
    recurring_transaction_id String,
    is_subscription UInt8, -- Subscription payment
    is_manual UInt8,
    is_modified UInt8,
    is_reconciled UInt8,
    
    -- Tags and organization
    tags Array(String),
    labels Array(String),
    
    -- Split transaction support
    parent_transaction_id String,
    is_split UInt8,
    split_total Float64,
    
    -- Timestamps
    created_at DateTime,
    updated_at DateTime,
    imported_at DateTime,
    
    -- Other flags
    is_internal UInt8,
    has_been_notified UInt8,
    frequency LowCardinality(String)
)
ENGINE = ReplacingMergeTree(updated_at)
PARTITION BY toYYYYMM(date)
ORDER BY (team_id, user_id, bank_account_id, date, id)
SETTINGS index_granularity = 8192;
```

## Recurring Transactions Table (Enhanced for Business)

```sql
CREATE TABLE financials.raw_recurring_transactions_v1 (
    -- Primary identifiers
    id String,
    user_id String,
    team_id String, -- Business/organization identifier
    bank_account_id String,
    
    -- Basic information
    title String,
    description String,
    amount Float64,
    currency LowCardinality(String),
    
    -- Business classification
    is_revenue UInt8, -- Is this a recurring revenue stream
    is_subscription_revenue UInt8, -- Is this subscription revenue
    is_expense UInt8, -- Is this a recurring expense
    is_fixed_cost UInt8, -- Is this a fixed cost
    is_variable_cost UInt8, -- Is this a variable cost
    
    -- Business metadata
    department String,
    project String,
    cost_center String,
    gl_account String, -- General Ledger account
    vendor_id String,
    customer_id String,
    
    -- MRR/ARR tracking (for subscription revenue)
    is_mrr_component UInt8, -- Should be counted in MRR
    initial_mrr_amount Float64, -- Initial MRR value when created
    current_mrr_amount Float64, -- Current MRR value
    mrr_currency LowCardinality(String), -- Currency for MRR
    arr_multiplier Float32 DEFAULT 12, -- Multiplier for ARR (typically 12)
    
    -- Account information
    initial_account_balance Float64,
    
    -- Schedule information
    frequency LowCardinality(String), -- Weekly, monthly, annually, etc.
    interval UInt8, -- Every X days/weeks/months
    start_date DateTime,
    end_date DateTime NULL,
    day_of_month UInt8 NULL, -- For monthly: which day (1-31)
    day_of_week UInt8 NULL, -- For weekly: which day (0-6, 0=Sunday)
    week_of_month Int8 NULL, -- For monthly: which week (1-5, -1=last)
    month_of_year UInt8 NULL, -- For yearly: which month (1-12)
    execution_days Array(UInt8), -- For custom frequencies: which days to execute
    
    -- Time dimensions (for efficient aggregations)
    start_date_year UInt16 MATERIALIZED toYear(start_date),
    start_date_month UInt8 MATERIALIZED toMonth(start_date),
    
    -- Schedule options
    skip_weekends UInt8,
    adjust_for_holidays UInt8,
    allow_execution UInt8,
    limit_executions UInt32 NULL,
    
    -- Transaction template
    transaction_template String, -- Stored as JSON
    category_slug String,
    tags Array(String),
    notes String,
    custom_fields String, -- Stored as JSON
    
    -- Bank account specific details
    target_account_id String,
    affect_available_balance UInt8,
    
    -- Execution tracking
    last_executed_at DateTime NULL,
    next_scheduled_date DateTime NULL,
    execution_count UInt32,
    total_executed Float64,
    last_execution_status LowCardinality(String),
    last_execution_error String,
    
    -- Account health monitoring
    min_balance_required Float64 NULL,
    overspend_action LowCardinality(String),
    insufficient_funds_count UInt32,
    
    -- Metadata
    source LowCardinality(String),
    merchant_id String,
    merchant_name String,
    
    -- Categorization
    transaction_type LowCardinality(String),
    importance_level LowCardinality(String),
    
    -- Time to next execution (calculated)
    days_to_next_execution Int32 MATERIALIZED if(next_scheduled_date IS NOT NULL, dateDiff('day', today(), next_scheduled_date), NULL),
    
    -- Audit trail
    created_at DateTime,
    updated_at DateTime,
    last_modified_by String
)
ENGINE = ReplacingMergeTree(updated_at)
PARTITION BY toYYYYMM(start_date)
ORDER BY (team_id, user_id, bank_account_id, id)
SETTINGS index_granularity = 8192;
```

## Business Metrics Table

```sql
CREATE TABLE financials.business_metrics_v1 (
    -- Primary identifiers
    id String,
    team_id String,
    
    -- Time dimensions
    date DateTime,
    date_year UInt16 MATERIALIZED toYear(date),
    date_month UInt8 MATERIALIZED toMonth(date),
    date_day UInt8 MATERIALIZED toDayOfMonth(date),
    
    -- Revenue metrics
    mrr Float64, -- Monthly Recurring Revenue
    arr Float64, -- Annual Recurring Revenue
    one_time_revenue Float64, -- Non-recurring revenue
    total_revenue Float64, -- Total revenue (MRR + one-time)
    
    -- MRR movement metrics
    new_mrr Float64, -- MRR from new customers
    expansion_mrr Float64, -- MRR from existing customers expanding
    contraction_mrr Float64, -- MRR lost from existing customers reducing spend
    churn_mrr Float64, -- MRR lost from customers leaving
    reactivation_mrr Float64, -- MRR from returning customers
    net_mrr_movement Float64, -- Net change in MRR
    
    -- Customer metrics
    customer_count UInt32, -- Total customers
    new_customers UInt32, -- New customers added
    churned_customers UInt32, -- Customers churned
    
    -- Expense metrics
    fixed_costs Float64, -- Fixed costs
    variable_costs Float64, -- Variable costs
    total_expenses Float64, -- Total expenses
    
    -- Cash metrics
    cash_balance Float64, -- Total cash across all accounts
    accounts_receivable Float64, -- Money owed to the business
    accounts_payable Float64, -- Money owed by the business
    
    -- Burn rate metrics
    gross_burn Float64, -- Total expenses
    net_burn Float64, -- Expenses minus revenue
    runway_days UInt32, -- Days of runway at current burn rate
    
    -- Calculated metrics
    gross_margin Float64, -- (Revenue - COGS) / Revenue
    cac Float64, -- Customer Acquisition Cost
    ltv Float64, -- Customer Lifetime Value
    ltv_cac_ratio Float64, -- LTV / CAC
    
    -- Currency
    base_currency LowCardinality(String),
    
    -- Metadata
    created_at DateTime,
    updated_at DateTime
)
ENGINE = ReplacingMergeTree(updated_at)
PARTITION BY toYYYYMM(date)
ORDER BY (team_id, date)
SETTINGS index_granularity = 8192;
```

## Business-Focused Materialized Views

### MRR/ARR Tracking

```sql
CREATE MATERIALIZED VIEW financials.mrr_tracking_mv_v1
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(month_date)
ORDER BY (team_id, month_date, category)
POPULATE
AS
SELECT
    team_id,
    toStartOfMonth(date) AS month_date,
    date_year,
    date_month,
    category,
    is_subscription_revenue,
    -- MRR components
    sum(if(is_revenue = 1 AND is_subscription_revenue = 1, amount, 0)) AS subscription_revenue,
    sum(if(is_revenue = 1 AND is_subscription_revenue = 0, amount, 0)) AS one_time_revenue,
    -- Expense components
    sum(if(is_expense = 1 AND is_fixed_cost = 1, abs(amount), 0)) AS fixed_costs,
    sum(if(is_expense = 1 AND is_variable_cost = 1, abs(amount), 0)) AS variable_costs,
    -- Calculate MRR based on recurring transactions
    sum(if(is_mrr_component = 1, current_mrr_amount, 0)) AS mrr,
    -- Calculate ARR (simply MRR * 12 for most businesses)
    sum(if(is_mrr_component = 1, current_mrr_amount, 0)) * 12 AS arr,
    -- Customer count from recurring transactions
    count(DISTINCT customer_id) AS customer_count
FROM (
    -- Include recurring transactions for MRR calculation
    SELECT
        team_id,
        start_date AS date,
        toYear(start_date) AS date_year,
        toMonth(start_date) AS date_month,
        category_slug AS category,
        0 AS is_revenue,
        0 AS is_subscription_revenue,
        1 AS is_expense,
        is_fixed_cost,
        is_variable_cost,
        is_mrr_component,
        current_mrr_amount,
        amount,
        customer_id
    FROM financials.raw_recurring_transactions_v1
    WHERE status = 'active' AND is_mrr_component = 1
    
    UNION ALL
    
    -- Include actual transactions for revenue/expense tracking
    SELECT
        team_id,
        date,
        date_year,
        date_month,
        category,
        is_revenue,
        is_subscription,
        CAST(is_cogs OR is_opex AS UInt8) AS is_expense,
        CAST(NOT is_variable_cost AS UInt8) AS is_fixed_cost,
        is_variable_cost,
        0 AS is_mrr_component,
        0 AS current_mrr_amount,
        amount,
        customer_id
    FROM financials.raw_transactions_v1
)
GROUP BY team_id, month_date, date_year, date_month, category, is_subscription_revenue;
```

### Cash Runway Analysis

```sql
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
```

### Business Expense Breakdown

```sql
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
```

## Combined Business Views

### Business Cash Flow Projection

```sql
CREATE VIEW financials.business_cash_flow_projection_v1 AS
WITH current_balances AS (
    SELECT 
        team_id,
        sum(amount) AS current_cash_balance
    FROM financials.raw_transactions_v1
    GROUP BY team_id
),
monthly_burn AS (
    SELECT
        team_id,
        avg(total_expenses) AS avg_monthly_burn
    FROM financials.cash_runway_mv_v1
    WHERE month_date >= toStartOfMonth(today() - INTERVAL 3 MONTH)
    GROUP BY team_id
),
upcoming_expenses AS (
    SELECT
        team_id,
        toStartOfMonth(next_scheduled_date) AS month,
        sum(if(amount < 0, abs(amount), 0)) AS projected_expenses
    FROM financials.raw_recurring_transactions_v1
    WHERE 
        status = 'active' 
        AND next_scheduled_date IS NOT NULL
        AND next_scheduled_date > today()
        AND next_scheduled_date <= (today() + INTERVAL 12 MONTH)
    GROUP BY team_id, month
),
upcoming_revenue AS (
    SELECT
        team_id,
        toStartOfMonth(next_scheduled_date) AS month,
        sum(if(amount > 0, amount, 0)) AS projected_revenue
    FROM financials.raw_recurring_transactions_v1
    WHERE 
        status = 'active' 
        AND next_scheduled_date IS NOT NULL
        AND next_scheduled_date > today()
        AND next_scheduled_date <= (today() + INTERVAL 12 MONTH)
    GROUP BY team_id, month
)
SELECT
    b.team_id,
    b.current_cash_balance,
    m.avg_monthly_burn,
    if(m.avg_monthly_burn > 0, b.current_cash_balance / m.avg_monthly_burn, NULL) AS runway_months,
    -- Project next 12 months
    toStartOfMonth(addMonths(today(), 0)) AS month_0,
    coalesce(e0.projected_expenses, 0) AS expenses_month_0,
    coalesce(r0.projected_revenue, 0) AS revenue_month_0,
    b.current_cash_balance + coalesce(r0.projected_revenue, 0) - coalesce(e0.projected_expenses, 0) AS projected_balance_month_0,
    
    toStartOfMonth(addMonths(today(), 1)) AS month_1,
    coalesce(e1.projected_expenses, 0) AS expenses_month_1,
    coalesce(r1.projected_revenue, 0) AS revenue_month_1,
    b.current_cash_balance + 
        coalesce(r0.projected_revenue, 0) - coalesce(e0.projected_expenses, 0) +
        coalesce(r1.projected_revenue, 0) - coalesce(e1.projected_expenses, 0) AS projected_balance_month_1,
    
    toStartOfMonth(addMonths(today(), 2)) AS month_2,
    coalesce(e2.projected_expenses, 0) AS expenses_month_2,
    coalesce(r2.projected_revenue, 0) AS revenue_month_2,
    b.current_cash_balance + 
        coalesce(r0.projected_revenue, 0) - coalesce(e0.projected_expenses, 0) +
        coalesce(r1.projected_revenue, 0) - coalesce(e1.projected_expenses, 0) +
        coalesce(r2.projected_revenue, 0) - coalesce(e2.projected_expenses, 0) AS projected_balance_month_2
FROM current_balances b
LEFT JOIN monthly_burn m ON b.team_id = m.team_id
LEFT JOIN upcoming_expenses e0 ON b.team_id = e0.team_id AND e0.month = toStartOfMonth(addMonths(today(), 0))
LEFT JOIN upcoming_expenses e1 ON b.team_id = e1.team_id AND e1.month = toStartOfMonth(addMonths(today(), 1))
LEFT JOIN upcoming_expenses e2 ON b.team_id = e2.team_id AND e2.month = toStartOfMonth(addMonths(today(), 2))
LEFT JOIN upcoming_revenue r0 ON b.team_id = r0.team_id AND r0.month = toStartOfMonth(addMonths(today(), 0))
LEFT JOIN upcoming_revenue r1 ON b.team_id = r1.team_id AND r1.month = toStartOfMonth(addMonths(today(), 1))
LEFT JOIN upcoming_revenue r2 ON b.team_id = r2.team_id AND r2.month = toStartOfMonth(addMonths(today(), 2));
```

### MRR Movement Analysis

```sql
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
```

## Business Key Performance Indicators View

```sql
CREATE VIEW financials.business_kpis_v1 AS
WITH revenue_data AS (
    SELECT 
        team_id,
        toStartOfMonth(date) AS month,
        sum(if(is_revenue = 1, amount, 0)) AS total_revenue,
        sum(if(is_revenue = 1 AND is_subscription = 1, amount, 0)) AS subscription_revenue,
        sum(if(is_revenue = 1 AND is_subscription = 0, amount, 0)) AS non_subscription_revenue,
        count(DISTINCT customer_id) FILTER (WHERE is_revenue = 1) AS paying_customers
    FROM financials.raw_transactions_v1
    WHERE date >= toStartOfMonth(today() - INTERVAL 12 MONTH)
    GROUP BY team_id, month
),
expense_data AS (
    SELECT 
        team_id,
        toStartOfMonth(date) AS month,
        sum(if(is_cogs = 1, abs(amount), 0)) AS cogs,
        sum(if(is_opex = 1, abs(amount), 0)) AS opex,
        sum(if(amount < 0, abs(amount), 0)) AS total_expenses
    FROM financials.raw_transactions_v1
    WHERE date >= toStartOfMonth(today() - INTERVAL 12 MONTH)
    GROUP BY team_id, month
),
mrr_data AS (
    SELECT
        team_id,
        month_date AS month,
        current_month_mrr AS mrr,
        new_mrr,
        expansion_mrr,
        contraction_mrr,
        churned_mrr,
        new_customers,
        churned_customers
    FROM financials.mrr_movement_mv_v1
    WHERE month_date >= toStartOfMonth(today() - INTERVAL 12 MONTH)
),
cash_data AS (
    SELECT
        team_id,
        month_date AS month,
        total_income,
        total_expenses,
        gross_burn,
        net_burn
    FROM financials.cash_runway_mv_v1
    WHERE month_date >= toStartOfMonth(today() - INTERVAL 12 MONTH)
)
SELECT
    r.team_id,
    r.month,
    -- Revenue metrics
    r.total_revenue,
    r.subscription_revenue,
    r.non_subscription_revenue,
    
    -- MRR metrics
    m.mrr,
    m.mrr * 12 AS arr,
    m.new_mrr,
    m.expansion_mrr,
    m.contraction_mrr,
    m.churned_mrr,
    
    -- Expense metrics
    e.cogs,
    e.opex,
    e.total_expenses,
    
    -- Profitability metrics
    r.total_revenue - e.total_expenses AS net_income,
    r.total_revenue - e.cogs AS gross_profit,
    (r.total_revenue - e.cogs) / nullif(r.total_revenue, 0) AS gross_margin,
    r.total_revenue - e.total_expenses AS operating_income,
    (r.total_revenue - e.total_expenses) / nullif(r.total_revenue, 0) AS operating_margin,
    
    -- Cash metrics
    c.gross_burn,
    c.net_burn,
    
    -- Customer metrics
    r.paying_customers,
    r.subscription_revenue / nullif(r.paying_customers, 0) AS arpu, -- Average Revenue Per User
    m.new_customers,
    m.churned_customers,
    m.churned_customers / nullif(lag(r.paying_customers) OVER (PARTITION BY r.team_id ORDER BY r.month), 0) AS customer_churn_rate,
    m.churned_mrr / nullif(lag(m.mrr) OVER (PARTITION BY r.team_id ORDER BY r.month), 0) AS revenue_churn_rate,
    
    -- Growth metrics
    (r.total_revenue - lag(r.total_revenue) OVER (PARTITION BY r.team_id ORDER BY r.month)) / 
        nullif(lag(r.total_revenue) OVER (PARTITION BY r.team_id ORDER BY r.month), 0) AS mom_revenue_growth,
    (m.mrr - lag(m.mrr) OVER (PARTITION BY r.team_id ORDER BY r.month)) / 
        nullif(lag(m.mrr) OVER (PARTITION BY r.team_id ORDER BY r.month), 0) AS mom_mrr_growth
FROM revenue_data r
LEFT JOIN expense_data e ON r.team_id = e.team_id AND r.month = e.month
LEFT JOIN mrr_data m ON r.team_id = m.team_id AND r.month = m.month
LEFT JOIN cash_data c ON r.team_id = c.team_id AND r.month = c.month
ORDER BY r.team_id, r.month;
```

## Example Business Analytics Queries

### Monthly Recurring Revenue (MRR) Trend

```sql
SELECT
    month_date,
    mrr,
    arr,
    new_mrr,
    expansion_mrr,
    contraction_mrr,
    churned_mrr,
    new_mrr + expansion_mrr - contraction_mrr - churned_mrr AS net_mrr_change,
    new_customers,
    churned_customers
FROM financials.mrr_movement_mv_v1
WHERE team_id = 'team123'
ORDER BY month_date DESC
LIMIT 12;
```

### Cash Runway Analysis

```sql
WITH latest_balance AS (
    SELECT 
        team_id,
        sum(amount) AS current_balance
    FROM financials.raw_transactions_v1
    WHERE team_id = 'team123'
    GROUP BY team_id
),
average_burn AS (
    SELECT
        team_id,
        avg(net_burn) AS monthly_burn
    FROM financials.cash_runway_mv_v1
    WHERE 
        team_id = 'team123' AND
        month_date >= toStartOfMonth(today() - INTERVAL 3 MONTH)
    GROUP BY team_id
)
SELECT
    b.team_id,
    b.current_balance,
    a.monthly_burn,
    b.current_balance / nullif(a.monthly_burn, 0) AS runway_months,
    toDate(today() + toIntervalMonth(round(b.current_balance / nullif(a.monthly_burn, 0)))) AS projected_zero_cash_date
FROM latest_balance b
JOIN average_burn a ON b.team_id = a.team_id;
```

### Business Unit Economics

```sql
WITH customer_acquisition AS (
    SELECT
        team_id,
        toStartOfMonth(date) AS month,
        sum(abs(amount)) AS marketing_spend,
        count(DISTINCT customer_id) FILTER (WHERE is_revenue = 1 AND customer_id NOT IN (
            SELECT DISTINCT customer_id
            FROM financials.raw_transactions_v1
            WHERE 
                team_id = 'team123' AND
                is_revenue = 1 AND
                date < toStartOfMonth(date)
        )) AS new_customers
    FROM financials.raw_transactions_v1
    WHERE 
        team_id = 'team123' AND
        category = 'Marketing' AND
        date >= toStartOfMonth(today() - INTERVAL 6 MONTH)
    GROUP BY team_id, month
),
customer_lifetime AS (
    SELECT
        team_id,
        avg(lifetime_months) AS avg_customer_lifetime_months,
        avg(lifetime_value) AS avg_customer_lifetime_value
    FROM (
        SELECT
            team_id,
            customer_id,
            min(date) AS first_transaction,
            max(date) AS last_transaction,
            dateDiff('month', min(date), max(date)) + 1 AS lifetime_months,
            sum(amount) AS lifetime_value
        FROM financials.raw_transactions_v1
        WHERE 
            team_id = 'team123' AND
            is_revenue = 1 AND
            customer_id != ''
        GROUP BY team_id, customer_id
    )
    GROUP BY team_id
)
SELECT
    c.team_id,
    c.month,
    c.marketing_spend,
    c.new_customers,
    c.marketing_spend / nullif(c.new_customers, 0) AS customer_acquisition_cost,
    l.avg_customer_lifetime_months,
    l.avg_customer_lifetime_value,
    l.avg_customer_lifetime_value / nullif(c.marketing_spend / nullif(c.new_customers, 0), 0) AS ltv_cac_ratio
FROM customer_acquisition c
CROSS JOIN customer_lifetime l
WHERE c.team_id = l.team_id
ORDER BY c.month DESC;
```

### Revenue Breakdown By Customer

```sql
SELECT
    team_id,
    customer_id,
    sum(if(is_revenue = 1 AND is_subscription = 1, amount, 0)) AS subscription_revenue,
    sum(if(is_revenue = 1 AND is_subscription = 0, amount, 0)) AS one_time_revenue,
    sum(if(is_revenue = 1, amount, 0)) AS total_revenue,
    min(date) FILTER (WHERE is_revenue = 1) AS first_transaction_date,
    max(date) FILTER (WHERE is_revenue = 1) AS last_transaction_date,
    dateDiff('day', min(date) FILTER (WHERE is_revenue = 1), max(date) FILTER (WHERE is_revenue = 1)) AS customer_age_days,
    sum(if(is_revenue = 1, amount, 0)) / (dateDiff('month', min(date) FILTER (WHERE is_revenue = 1), max(date) FILTER (WHERE is_revenue = 1)) + 1) AS average_monthly_revenue
FROM financials.raw_transactions_v1
WHERE 
    team_id = 'team123' AND
    customer_id != '' AND
    date >= toDate('2023-01-01')
GROUP BY team_id, customer_id
ORDER BY total_revenue DESC
LIMIT 20;
```

### Department Expense Analysis

```sql
SELECT
    toStartOfMonth(date) AS month,
    department,
    sum(abs(amount)) AS total_expenses,
    count() AS transaction_count,
    avg(abs(amount)) AS average_transaction_size,
    sum(abs(amount)) / sum(sum(abs(amount))) OVER (PARTITION BY toStartOfMonth(date)) AS percentage_of_monthly_expenses
FROM financials.raw_transactions_v1
WHERE 
    team_id = 'team123' AND
    amount < 0 AND
    date >= toStartOfMonth(today() - INTERVAL 6 MONTH) AND
    department != ''
GROUP BY month, department
ORDER BY month DESC, total_expenses DESC;
```

## Schema Benefits for Business Analytics

1. **Business-Focused Metrics**: Designed specifically for small business financial analytics
2. **Subscription Revenue Tracking**: MRR and ARR calculations built into the schema
3. **Cash Flow Forecasting**: Analyze runway and project future cash positions
4. **Business Unit Economics**: Calculate CAC, LTV, and other key business metrics
5. **Performance by Department/Product**: Segment analysis for better decision making
6. **Growth Monitoring**: Track growth rates and trends over time

## Implementation Notes

1. **Data Integration**: Sync from accounting systems, payment processors, and banking APIs
2. **Currency Handling**: All monetary values should be normalized to a base currency for accurate reporting
3. **Taxonomies**: Implement consistent categorization of transactions for reliable reporting
4. **Historical Data**: Load at least 12-24 months of historical data for trend analysis
5. **Data Freshness**: Update transaction data daily for accurate cash flow reporting 