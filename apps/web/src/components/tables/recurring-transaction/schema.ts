import {
    ARRAY_DELIMITER,
    RANGE_DELIMITER,
    SLIDER_DELIMITER,
} from "@/lib/delimiters";

import { z } from "zod";

// Recurring transaction statuses
export const RECURRING_TRANSACTION_STATUSES = [
    "active",
    "paused",
    "completed",
    "cancelled"
] as const;

// Transaction frequencies based on the Prisma schema
export const TRANSACTION_FREQUENCIES = [
    "WEEKLY",
    "BIWEEKLY",
    "MONTHLY",
    "SEMI_MONTHLY",
    "ANNUALLY",
    "IRREGULAR",
    "UNKNOWN",
] as const;

// Recurring transaction types
export const RECURRING_TRANSACTION_TYPES = [
    "subscription",
    "bill",
    "income",
    "transfer",
    "other"
] as const;

// Importance levels
export const IMPORTANCE_LEVELS = [
    "critical",
    "high",
    "medium",
    "low"
] as const;

// Define the column schema for recurring transactions
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

export type RecurringTransactionSchema = z.infer<typeof recurringTransactionSchema>;

// Filter schema for the data table
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

export type RecurringTransactionFilterSchema = z.infer<typeof recurringTransactionFilterSchema>;

export type BaseChartSchema = { timestamp: number;[key: string]: number }; 