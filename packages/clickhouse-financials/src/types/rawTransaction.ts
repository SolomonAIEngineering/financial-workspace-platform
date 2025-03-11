import { z } from 'zod';

/**
 * Zod schema for ClickHouse raw transaction data
 * This schema reflects the structure of the financials.raw_transactions_v1 table
 */
export const rawTransactionSchema = z.object({
    // Primary identifiers
    id: z.string(),
    user_id: z.string(),
    team_id: z.string(),
    bank_account_id: z.string(),
    plaid_transaction_id: z.string().optional(),

    // Transaction details
    amount: z.number(),
    iso_currency_code: z.string().optional(),
    date: z.string(), // DateTime in ClickHouse, represented as ISO string
    name: z.string(),
    merchant_name: z.string().optional(),
    description: z.string().optional(),
    pending: z.number().transform(Boolean), // UInt8 in ClickHouse (0/1), transformed to boolean

    // Time dimensions (automatically calculated by ClickHouse)
    date_year: z.number().optional(),
    date_month: z.number().optional(),
    date_day: z.number().optional(),
    date_day_of_week: z.number().optional(),
    date_week_of_year: z.number().optional(),

    // Business categorization
    category: z.string().optional(),
    sub_category: z.string().optional(),
    custom_category: z.string().optional(),
    category_icon_url: z.string().optional(),

    // Business expense classification
    is_cogs: z.number().transform(Boolean).default(0),
    is_opex: z.number().transform(Boolean).default(0),
    is_capex: z.number().transform(Boolean).default(0),
    is_revenue: z.number().transform(Boolean).default(0),
    is_refund: z.number().transform(Boolean).default(0),
    is_investment: z.number().transform(Boolean).default(0),
    is_owner_draw: z.number().transform(Boolean).default(0),
    is_tax: z.number().transform(Boolean).default(0),
    is_transfer: z.number().transform(Boolean).default(0),

    // Merchant data
    merchant_id: z.string().optional(),
    merchant_logo_url: z.string().optional(),
    merchant_category: z.string().optional(),
    merchant_website: z.string().optional(),

    // Payment metadata
    payment_channel: z.string().optional(),
    payment_method: z.string().optional(),
    transaction_type: z.string().optional(),
    transaction_method: z.string().optional(),

    // Financial attributes
    tax_amount: z.number().default(0),
    tax_rate: z.number().default(0),
    vat_amount: z.number().default(0),
    vat_rate: z.number().default(0),

    // Business metadata
    department: z.string().optional(),
    project: z.string().optional(),
    cost_center: z.string().optional(),
    invoice_id: z.string().optional(),
    customer_id: z.string().optional(),
    vendor_id: z.string().optional(),

    // Accounting classification
    accounting_category: z.string().optional(),
    gl_account: z.string().optional(), // General Ledger account

    // Cash flow classification
    cash_flow_category: z.string().optional(),

    // Flags
    exclude_from_budget: z.number().transform(Boolean).default(0),
    is_recurring: z.number().transform(Boolean).default(0),
    recurring_transaction_id: z.string().optional(),
    is_subscription: z.number().transform(Boolean).default(0),
    is_manual: z.number().transform(Boolean).default(0),
    is_modified: z.number().transform(Boolean).default(0),
    is_reconciled: z.number().transform(Boolean).default(0),

    // Tags and organization
    tags: z.array(z.string()).default([]),
    labels: z.array(z.string()).default([]),

    // Split transaction support
    parent_transaction_id: z.string().optional(),
    is_split: z.number().transform(Boolean).default(0),
    split_total: z.number().default(0),

    // Timestamps
    created_at: z.string(), // DateTime in ClickHouse
    updated_at: z.string(), // DateTime in ClickHouse
    imported_at: z.string().optional(), // DateTime in ClickHouse

    // Other flags
    is_internal: z.number().transform(Boolean).default(0),
    has_been_notified: z.number().transform(Boolean).default(0),
    frequency: z.string().optional(),

    // Variable cost flag
    is_variable_cost: z.number().transform(Boolean).default(0),
});

export type RawTransaction = z.infer<typeof rawTransactionSchema>; 