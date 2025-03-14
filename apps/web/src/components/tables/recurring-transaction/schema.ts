import {
    ARRAY_DELIMITER,
    RANGE_DELIMITER,
    SLIDER_DELIMITER,
} from "@/lib/delimiters";

import { z } from "zod";

/**
 * @file schema.ts
 * @description Defines the data schema for recurring transactions using Zod.
 * This file contains type definitions, validation schemas, and enum values
 * used throughout the recurring transaction components.
 */

/**
 * Valid status values for recurring transactions.
 * These statuses represent the current state of a recurring transaction.
 * 
 * @property active - Transaction is currently active and will execute as scheduled
 * @property paused - Transaction is temporarily suspended but can be resumed
 * @property completed - Transaction has completed its scheduled run
 * @property cancelled - Transaction has been permanently cancelled
 */
export const RECURRING_TRANSACTION_STATUSES = [
    "active",
    "paused",
    "completed",
    "cancelled"
] as const;

/**
 * Frequency options for recurring transactions.
 * Defines how often a recurring transaction executes.
 * 
 * @property WEEKLY - Once every week
 * @property BIWEEKLY - Once every two weeks
 * @property MONTHLY - Once every month
 * @property SEMI_MONTHLY - Twice a month (typically on the 1st and 15th)
 * @property ANNUALLY - Once a year
 * @property IRREGULAR - No fixed schedule
 * @property UNKNOWN - Frequency hasn't been determined
 */
export const TRANSACTION_FREQUENCIES = [
    "WEEKLY",
    "BIWEEKLY",
    "MONTHLY",
    "SEMI_MONTHLY",
    "ANNUALLY",
    "IRREGULAR",
    "UNKNOWN",
] as const;

/**
 * Types of recurring transactions.
 * Categorizes the transaction's purpose.
 * 
 * @property subscription - Regular payment for a subscription service
 * @property bill - Payment for a bill or utility
 * @property income - Regular incoming payment (salary, etc.)
 * @property transfer - Recurring transfer between accounts
 * @property other - Any other type of recurring transaction
 */
export const RECURRING_TRANSACTION_TYPES = [
    "subscription",
    "bill",
    "income",
    "transfer",
    "other"
] as const;

/**
 * Importance levels for recurring transactions.
 * Indicates the priority or significance of the transaction.
 * 
 * @property critical - High-priority transactions that must not fail
 * @property high - Important transactions
 * @property medium - Standard importance level
 * @property low - Low priority transactions
 */
export const IMPORTANCE_LEVELS = [
    "critical",
    "high",
    "medium",
    "low"
] as const;

/**
 * Zod schema for recurring transactions.
 * Defines the structure, types, and validation rules for recurring transaction data.
 * 
 * The schema is organized into logical sections:
 * - Basic identifiers (id, userId)
 * - Account information (bankAccountId)
 * - Transaction details (title, amount, etc.)
 * - Schedule details (frequency, dates)
 * - Metadata (type, merchant info)
 * - Execution information (count, history)
 * - Configuration (balance effects, automation)
 * - Timestamps (created, updated)
 */
export const recurringTransactionSchema = z.object({
    // Basic transaction identifiers
    id: z.string(),
    userId: z.string().optional(),

    // Account information
    bankAccountId: z.string(),
    bankAccountName: z.string().optional(),

    // Transaction details
    title: z.string(),
    description: z.string().nullable().optional(),
    amount: z.number(),
    currency: z.string().optional().default("USD"),

    // Schedule details
    frequency: z.enum(TRANSACTION_FREQUENCIES),
    interval: z.number().default(1),
    startDate: z.date(),
    endDate: z.date().nullable().optional(),
    nextScheduledDate: z.date(),
    lastExecutedAt: z.date().nullable().optional(),
    dayOfMonth: z.number().nullable().optional(),
    dayOfWeek: z.number().nullable().optional(),

    // Metadata
    transactionType: z.enum(RECURRING_TRANSACTION_TYPES),
    merchantName: z.string().nullable().optional(),
    merchantId: z.string().nullable().optional(),
    status: z.enum(RECURRING_TRANSACTION_STATUSES).default("active"),

    // Execution information
    executionCount: z.number().default(0),
    totalExecuted: z.number().default(0),
    lastExecutionStatus: z.string().nullable().optional(),

    // Configuration
    affectAvailableBalance: z.boolean().default(true),
    isVariable: z.boolean().default(false),
    importanceLevel: z.enum(IMPORTANCE_LEVELS).default("medium"),
    isAutomated: z.boolean().default(true),
    requiresApproval: z.boolean().default(false),
    allowedVariance: z.number().nullable().optional(),
    minBalanceRequired: z.number().nullable().optional(),

    // Timestamps
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

/**
 * TypeScript type for recurring transactions, derived from the Zod schema.
 * Use this type when working with recurring transaction objects throughout the application.
 * 
 * @example
 * ```tsx
 * function RecurringTransactionCard({ transaction }: { transaction: RecurringTransactionSchema }) {
 *   return (
 *     <Card>
 *       <CardHeader>{transaction.title}</CardHeader>
 *       <CardContent>{formatCurrency(transaction.amount)}</CardContent>
 *     </Card>
 *   );
 * }
 * ```
 */
export type RecurringTransactionSchema = z.infer<typeof recurringTransactionSchema>;

/**
 * Zod schema for filtering recurring transactions.
 * Defines the structure of filter parameters used in the data table and API requests.
 * This schema allows for filtering by multiple criteria simultaneously.
 * 
 * @remarks
 * Date ranges and amount ranges are represented as arrays with exactly two items
 * (start and end values) to support range-based filtering.
 */
export const recurringTransactionFilterSchema = z.object({
    status: z.enum(RECURRING_TRANSACTION_STATUSES).nullable().optional(),
    transactionType: z.enum(RECURRING_TRANSACTION_TYPES).nullable().optional(),
    frequency: z.enum(TRANSACTION_FREQUENCIES).nullable().optional(),
    nextScheduledDate: z.array(z.date()).length(2).nullable().optional(),
    amount: z.array(z.number()).length(2).nullable().optional(),
    importanceLevel: z.enum(IMPORTANCE_LEVELS).nullable().optional(),
    bankAccountId: z.string().nullable().optional(),
    merchantName: z.string().nullable().optional(),
});

/**
 * TypeScript type for filter parameters, derived from the filter schema.
 * Use this type when implementing filter functionality for recurring transactions.
 * 
 * @example
 * ```tsx
 * function applyFilters(
 *   transactions: RecurringTransactionSchema[],
 *   filters: Partial<RecurringTransactionFilterSchema>
 * ) {
 *   return transactions.filter(tx => {
 *     if (filters.status && tx.status !== filters.status) return false;
 *     if (filters.transactionType && tx.transactionType !== filters.transactionType) return false;
 *     // Additional filter logic...
 *     return true;
 *   });
 * }
 * ```
 */
export type RecurringTransactionFilterSchema = z.infer<typeof recurringTransactionFilterSchema>;

/**
 * Base schema for chart data related to recurring transactions.
 * Used for visualizing transaction data in time-series charts.
 * 
 * @property timestamp - Unix timestamp for the data point
 * @property [key: string] - Dynamic properties storing numeric values for the chart
 */
export type BaseChartSchema = { timestamp: number;[key: string]: number }; 