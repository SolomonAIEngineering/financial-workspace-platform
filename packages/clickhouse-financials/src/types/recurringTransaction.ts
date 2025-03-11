import { z } from 'zod'

/**
 * Enum for recurring transaction frequency
 */
export const TransactionFrequencyEnum = z.enum([
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'SEMI_MONTHLY',
  'ANNUALLY',
  'IRREGULAR',
  'UNKNOWN',
])

export type TransactionFrequency = z.infer<typeof TransactionFrequencyEnum>

/**
 * Enum for recurring transaction status
 */
export const RecurringTransactionStatusEnum = z.enum([
  'active',
  'paused',
  'completed',
  'cancelled',
])

export type RecurringTransactionStatus = z.infer<
  typeof RecurringTransactionStatusEnum
>

/**
 * Enum for overspend action
 */
export const OverspendActionEnum = z.enum(['block', 'notify', 'proceed'])

export type OverspendAction = z.infer<typeof OverspendActionEnum>

/**
 * Enum for transaction importance level
 */
export const ImportanceLevelEnum = z.enum(['Critical', 'High', 'Medium', 'Low'])

export type ImportanceLevel = z.infer<typeof ImportanceLevelEnum>

/**
 * Zod schema for ClickHouse recurring transaction data
 * This schema reflects the structure of the financials.raw_recurring_transactions_v1 table
 */
export const recurringTransactionSchema = z.object({
  // Primary identifiers
  id: z.string(),
  user_id: z.string(),
  team_id: z.string(),
  bank_account_id: z.string(),

  // Basic information
  title: z.string(),
  description: z.string().optional(),
  amount: z.number(),
  currency: z.string().optional(),

  // Business classification
  is_revenue: z.number().transform(Boolean).default(0),
  is_subscription_revenue: z.number().transform(Boolean).default(0),
  is_expense: z.number().transform(Boolean).default(0),
  is_fixed_cost: z.number().transform(Boolean).default(0),
  is_variable_cost: z.number().transform(Boolean).default(0),

  // Business metadata
  department: z.string().optional(),
  project: z.string().optional(),
  cost_center: z.string().optional(),
  gl_account: z.string().optional(),
  vendor_id: z.string().optional(),
  customer_id: z.string().optional(),

  // MRR/ARR tracking
  is_mrr_component: z.number().transform(Boolean).default(0),
  initial_mrr_amount: z.number().default(0),
  current_mrr_amount: z.number().default(0),
  mrr_currency: z.string().optional(),
  arr_multiplier: z.number().default(12),

  // Account information
  initial_account_balance: z.number().default(0),

  // Schedule information
  frequency: z.string().or(TransactionFrequencyEnum).optional(),
  interval: z.number().default(1),
  start_date: z.string(), // DateTime in ClickHouse, string in ISO format
  end_date: z.string().optional(), // DateTime in ClickHouse, string in ISO format
  day_of_month: z.number().optional(),
  day_of_week: z.number().optional(),
  week_of_month: z.number().optional(),
  month_of_year: z.number().optional(),
  execution_days: z.array(z.number()).default([]),

  // Time dimensions (automatically calculated by ClickHouse)
  start_date_year: z.number().optional(),
  start_date_month: z.number().optional(),

  // Schedule options
  skip_weekends: z.number().transform(Boolean).default(0),
  adjust_for_holidays: z.number().transform(Boolean).default(0),
  allow_execution: z.number().transform(Boolean).default(1),
  limit_executions: z.number().optional(),

  // Transaction template
  transaction_template: z.string().optional(), // JSON as string
  category_slug: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  custom_fields: z.string().optional(), // JSON as string

  // Bank account specific details
  target_account_id: z.string().optional(),
  affect_available_balance: z.number().transform(Boolean).default(1),

  // Execution tracking
  last_executed_at: z.string().optional(), // DateTime in ClickHouse
  next_scheduled_date: z.string().optional(), // DateTime in ClickHouse
  execution_count: z.number().default(0),
  total_executed: z.number().default(0),
  last_execution_status: z.string().optional(),
  last_execution_error: z.string().optional(),

  // Account health monitoring
  min_balance_required: z.number().optional(),
  overspend_action: z.string().or(OverspendActionEnum).default('block'),
  insufficient_funds_count: z.number().default(0),

  // Smart variance handling
  expected_amount: z.number().optional(),
  allowed_variance: z.number().optional(),
  variance_action: z.string().optional(),

  // Reminders and notifications
  reminder_days: z.array(z.number()).default([]),
  reminder_sent_at: z.string().optional(), // DateTime in ClickHouse
  notify_on_execution: z.number().transform(Boolean).default(1),
  notify_on_failure: z.number().transform(Boolean).default(1),

  // Status fields
  status: z.string().or(RecurringTransactionStatusEnum).default('active'),
  is_automated: z.number().transform(Boolean).default(1),
  requires_approval: z.number().transform(Boolean).default(0),
  is_variable: z.number().transform(Boolean).default(0),

  // Metadata
  source: z.string().optional(),
  confidence_score: z.number().optional(),
  merchant_id: z.string().optional(),
  merchant_name: z.string().optional(),

  // Categorization
  transaction_type: z.string().optional(),
  importance_level: z.string().or(ImportanceLevelEnum).optional(),

  // Time to next execution (calculated by ClickHouse)
  days_to_next_execution: z.number().optional(),

  // Audit trail
  created_at: z.string(), // DateTime in ClickHouse
  updated_at: z.string(), // DateTime in ClickHouse
  last_modified_by: z.string().optional(),
})

export type RecurringTransaction = z.infer<typeof recurringTransactionSchema>
