-- +goose up
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
    is_revenue UInt8 DEFAULT 0, -- Is this a recurring revenue stream
    is_subscription_revenue UInt8 DEFAULT 0, -- Is this subscription revenue
    is_expense UInt8 DEFAULT 0, -- Is this a recurring expense
    is_fixed_cost UInt8 DEFAULT 0, -- Is this a fixed cost
    is_variable_cost UInt8 DEFAULT 0, -- Is this a variable cost
    
    -- Business metadata
    department String,
    project String,
    cost_center String,
    gl_account String, -- General Ledger account
    vendor_id String,
    customer_id String,
    
    -- MRR/ARR tracking (for subscription revenue)
    is_mrr_component UInt8 DEFAULT 0, -- Should be counted in MRR
    initial_mrr_amount Float64 DEFAULT 0, -- Initial MRR value when created
    current_mrr_amount Float64 DEFAULT 0, -- Current MRR value
    mrr_currency LowCardinality(String), -- Currency for MRR
    arr_multiplier Float32 DEFAULT 12, -- Multiplier for ARR (typically 12)
    
    -- Account information
    initial_account_balance Float64 DEFAULT 0,
    
    -- Schedule information
    frequency LowCardinality(String), -- Weekly, monthly, annually, etc.
    interval UInt8 DEFAULT 1, -- Every X days/weeks/months
    start_date DateTime,
    end_date DateTime NULL,
    day_of_month UInt8 NULL, -- For monthly: which day (1-31)
    day_of_week UInt8 NULL, -- For weekly: which day (0-6, 0=Sunday)
    week_of_month Int8 NULL, -- For monthly: which week (1-5, -1=last)
    month_of_year UInt8 NULL, -- For yearly: which month (1-12)
    execution_days Array(UInt8) DEFAULT [], -- For custom frequencies: which days to execute
    
    -- Time dimensions (for efficient aggregations)
    start_date_year UInt16 MATERIALIZED toYear(start_date),
    start_date_month UInt8 MATERIALIZED toMonth(start_date),
    
    -- Schedule options
    skip_weekends UInt8 DEFAULT 0,
    adjust_for_holidays UInt8 DEFAULT 0,
    allow_execution UInt8 DEFAULT 1,
    limit_executions UInt32 NULL,
    
    -- Transaction template
    transaction_template String, -- Stored as JSON
    category_slug String,
    tags Array(String) DEFAULT [],
    notes String,
    custom_fields String, -- Stored as JSON
    
    -- Bank account specific details
    target_account_id String,
    affect_available_balance UInt8 DEFAULT 1,
    
    -- Execution tracking
    last_executed_at DateTime NULL,
    next_scheduled_date DateTime NULL,
    execution_count UInt32 DEFAULT 0,
    total_executed Float64 DEFAULT 0,
    last_execution_status LowCardinality(String),
    last_execution_error String,
    
    -- Account health monitoring
    min_balance_required Float64 NULL,
    overspend_action LowCardinality(String) DEFAULT 'block',
    insufficient_funds_count UInt32 DEFAULT 0,
    
    -- Smart variance handling
    expected_amount Float64 NULL,
    allowed_variance Float64 NULL,
    variance_action LowCardinality(String),
    
    -- Reminders and notifications
    reminder_days Array(UInt8) DEFAULT [],
    reminder_sent_at DateTime NULL,
    notify_on_execution UInt8 DEFAULT 1,
    notify_on_failure UInt8 DEFAULT 1,
    
    -- Status fields
    status LowCardinality(String) DEFAULT 'active', -- active, paused, completed, cancelled
    is_automated UInt8 DEFAULT 1,
    requires_approval UInt8 DEFAULT 0,
    is_variable UInt8 DEFAULT 0,
    
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
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now(),
    last_modified_by String
)
ENGINE = ReplacingMergeTree(updated_at)
PARTITION BY toYYYYMM(start_date)
ORDER BY (team_id, user_id, bank_account_id, id)
SETTINGS index_granularity = 8192;

-- +goose down
DROP TABLE financials.raw_recurring_transactions_v1; 