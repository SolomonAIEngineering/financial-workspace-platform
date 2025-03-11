-- +goose up
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
    is_cogs UInt8 DEFAULT 0, -- Cost of Goods Sold
    is_opex UInt8 DEFAULT 0, -- Operating Expense
    is_capex UInt8 DEFAULT 0, -- Capital Expenditure
    is_revenue UInt8 DEFAULT 0, -- Revenue transaction
    is_refund UInt8 DEFAULT 0, -- Refund transaction
    is_investment UInt8 DEFAULT 0, -- Investment/funding
    is_owner_draw UInt8 DEFAULT 0, -- Owner withdrawal
    is_tax UInt8 DEFAULT 0, -- Tax payment
    is_transfer UInt8 DEFAULT 0, -- Internal transfer
    
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
    tax_amount Float64 DEFAULT 0,
    tax_rate Float64 DEFAULT 0,
    vat_amount Float64 DEFAULT 0,
    vat_rate Float64 DEFAULT 0,
    
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
    exclude_from_budget UInt8 DEFAULT 0,
    is_recurring UInt8 DEFAULT 0,
    recurring_transaction_id String,
    is_subscription UInt8 DEFAULT 0, -- Subscription payment
    is_manual UInt8 DEFAULT 0,
    is_modified UInt8 DEFAULT 0,
    is_reconciled UInt8 DEFAULT 0,
    
    -- Tags and organization
    tags Array(String),
    labels Array(String),
    
    -- Split transaction support
    parent_transaction_id String,
    is_split UInt8 DEFAULT 0,
    split_total Float64 DEFAULT 0,
    
    -- Timestamps
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now(),
    imported_at DateTime,
    
    -- Other flags
    is_internal UInt8 DEFAULT 0,
    has_been_notified UInt8 DEFAULT 0,
    frequency LowCardinality(String),
    
    -- Variable cost flag
    is_variable_cost UInt8 DEFAULT 0
)
ENGINE = ReplacingMergeTree(updated_at)
PARTITION BY toYYYYMM(date)
ORDER BY (team_id, user_id, bank_account_id, date, id)
SETTINGS index_granularity = 8192;

-- +goose down
DROP TABLE financials.raw_transactions_v1; 