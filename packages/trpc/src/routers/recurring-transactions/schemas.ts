import { TransactionFrequency } from '@solomonai/prisma/client'
import { z } from 'zod'

// Recurring Transaction filter schema
export const recurringTransactionFilterSchema = z.object({
  title: z.string().optional(),
  merchantName: z.string().optional(),
  status: z.string().optional(),
  frequency: z.nativeEnum(TransactionFrequency).optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  bankAccountId: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// Recurring Transaction schema
export const recurringTransactionSchema = z.object({
  bankAccountId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  amount: z.number(),
  currency: z.string().default('USD'),
  frequency: z.nativeEnum(TransactionFrequency),
  interval: z.number().int().min(1).default(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  weekOfMonth: z.number().int().min(1).max(5).optional().or(z.literal(-1)), // -1 for last week
  monthOfYear: z.number().int().min(1).max(12).optional(),
  categorySlug: z.string().optional(),
  tags: z.array(z.string()).optional(),
  merchantName: z.string().optional(),
  status: z.string().default('active'),
  isAutomated: z.boolean().default(true),
  requiresApproval: z.boolean().default(false),
  isVariable: z.boolean().default(false),
  affectAvailableBalance: z.boolean().default(true),
  notes: z.string().optional(),
  targetAccountId: z.string().optional(), // For transfers: destination account
})

// Tag schema
export const tagSchema = z.object({
  tags: z.array(z.string()),
})

// Notes schema
export const notesSchema = z.object({
  notes: z.string(),
})

// Category schema
export const categorySchema = z.object({
  categorySlug: z.string(),
})

// Status schema
export const statusSchema = z.object({
  status: z.string(),
})

// Merchant schema
export const merchantSchema = z.object({
  merchantName: z.string(),
  merchantId: z.string().optional(),
})

// Assign schema
export const assignSchema = z.object({
  assignedToUserId: z.string(),
  notifyUser: z.boolean().default(false),
})

// Auto-detect recurring transactions schema
export const detectRecurringTransactionsSchema = z.object({
  bankAccountId: z.string().optional(),
  minConfidence: z.number().min(0).max(1).default(0.7),
  minimumOccurrences: z.number().int().min(2).default(2),
  lookbackDays: z.number().int().min(30).default(90),
})

// Search recurring transactions schema
export const searchRecurringTransactionsSchema = z.object({
  query: z.string().optional(),
  filters: z.object({
    status: z.string().optional(),
    frequency: z.nativeEnum(TransactionFrequency).optional(),
    category: z.string().optional(),
    merchantName: z.string().optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    tags: z.array(z.string()).optional(),
    bankAccountId: z.string().optional(),
  }).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional().default('nextScheduledDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
})

/**
 * Schema for retrieving transactions associated with a recurring transaction.
 * 
 * @remarks
 * This schema defines the input parameters for fetching transactions linked to a
 * specific recurring transaction with pagination support.
 * 
 * @property id - The unique identifier of the recurring transaction to retrieve associated transactions for
 * @property page - Page number for pagination (default: 1, minimum: 1)
 * @property limit - Maximum number of items per page (default: 20, range: 1-100)
 */
export const associatedTransactionsSchema = z.object({
  id: z.string(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})
