import {
  TransactionCategory,
  TransactionFrequency,
} from '@solomonai/prisma/client'

import { TRPCError } from '@trpc/server'
import { createRouter } from '../trpc'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../middlewares/procedures'
import { z } from 'zod'

// Recurring Transaction filter schema
const recurringTransactionFilterSchema = z.object({
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
const recurringTransactionSchema = z.object({
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
const tagSchema = z.object({
  tags: z.array(z.string()),
})

// Notes schema
const notesSchema = z.object({
  notes: z.string(),
})

// Category schema
const categorySchema = z.object({
  categorySlug: z.string(),
})

// Merchant schema
const merchantSchema = z.object({
  merchantName: z.string(),
  merchantId: z.string().optional(),
})

// Assign schema
const assignSchema = z.object({
  assignedToUserId: z.string(),
  notifyUser: z.boolean().default(false),
})

// Auto-detect recurring transactions schema
const detectRecurringTransactionsSchema = z.object({
  bankAccountId: z.string().optional(),
  minConfidence: z.number().min(0).max(1).default(0.7),
  minimumOccurrences: z.number().int().min(2).default(2),
  lookbackDays: z.number().int().min(30).default(90),
})

export const recurringTransactionsRouter = createRouter({
  // Core Recurring Transaction Endpoints
  // GET /api/recurring-transactions/:id/transactions - Get all transactions associated with a recurring transaction
  getAssociatedTransactions: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Fetch the recurring transaction to check ownership
      const recurringTransaction = await prisma.recurringTransaction.findUnique(
        {
          where: { id: input.id },
          include: {
            bankAccount: {
              select: {
                userId: true,
              },
            },
          },
        },
      )

      if (
        !recurringTransaction ||
        recurringTransaction.bankAccount.userId !== ctx.session?.userId
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recurring transaction not found',
        })
      }

      const { page, limit } = input
      const skip = (page - 1) * limit

      // Get associated transactions with pagination
      const transactions = await prisma.transaction.findMany({
        where: {
          recurringTransactionId: input.id,
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          transactionCategory: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      })

      // Get total count for pagination
      const totalCount = await prisma.transaction.count({
        where: {
          recurringTransactionId: input.id,
        },
      })

      return {
        transactions,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
      }
    }),

  // Recurring Transaction Management Endpoint

  // POST /api/recurring-transactions/detect - Auto-detect recurring transactions from existing transactions
  detectRecurringTransactions: protectedProcedure
    .input(detectRecurringTransactionsSchema)
    .mutation(async ({ ctx, input }) => {
      const { bankAccountId, minConfidence, minimumOccurrences, lookbackDays } =
        input

      // Build where condition for transactions
      const where: any = {
        userId: ctx.session?.userId,
      }

      if (bankAccountId) {
        where.bankAccountId = bankAccountId
      }

      // Set lookback date
      const lookbackDate = new Date()
      lookbackDate.setDate(lookbackDate.getDate() - lookbackDays)
      where.date = { gte: lookbackDate }

      // Get all transactions in the lookback period
      const transactions = await prisma.transaction.findMany({
        where,
        orderBy: { date: 'asc' },
        select: {
          id: true,
          amount: true,
          date: true,
          name: true,
          merchantName: true,
          bankAccountId: true,
          isRecurring: true,
        },
      })

      // Simplified algorithm to detect recurring patterns
      // Group transactions by merchantName (or name if no merchantName)
      const groupedByMerchant: Record<string, any[]> = {}

      transactions.forEach((transaction) => {
        const key = transaction.merchantName || transaction.name
        if (!groupedByMerchant[key]) {
          groupedByMerchant[key] = []
        }
        groupedByMerchant[key].push(transaction)
      })

      // Process each merchant group to detect patterns
      const detectedRecurringTransactions: any[] = []

      for (const [merchantName, merchantTransactions] of Object.entries(
        groupedByMerchant,
      )) {
        // Skip if not enough transactions
        if (merchantTransactions.length < minimumOccurrences) {
          continue
        }

        // Sort by date
        merchantTransactions.sort((a, b) => a.date.getTime() - b.date.getTime())

        // Simple pattern detection - check if transactions occur at regular intervals
        const intervals: number[] = []
        for (let i = 1; i < merchantTransactions.length; i++) {
          const dayDiff = Math.round(
            (merchantTransactions[i].date.getTime() -
              merchantTransactions[i - 1].date.getTime()) /
            (1000 * 60 * 60 * 24),
          )
          intervals.push(dayDiff)
        }

        // Calculate average interval and its consistency (standard deviation)
        const avgInterval =
          intervals.reduce((a, b) => a + b, 0) / intervals.length
        const variance =
          intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) /
          intervals.length
        const stdDev = Math.sqrt(variance)

        // Determine frequency based on average interval
        let frequency: TransactionFrequency
        let interval = 1

        if (avgInterval >= 25 && avgInterval <= 35) {
          frequency = 'MONTHLY'
        } else if (avgInterval >= 13 && avgInterval <= 15) {
          frequency = 'SEMI_MONTHLY'
        } else if (avgInterval >= 12 && avgInterval <= 16) {
          frequency = 'BIWEEKLY'
        } else if (avgInterval >= 6 && avgInterval <= 8) {
          frequency = 'WEEKLY'
        } else if (avgInterval >= 350 && avgInterval <= 380) {
          frequency = 'ANNUALLY'
        } else {
          // If interval doesn't match common patterns, use a frequency that's closest
          if (avgInterval > 90) {
            frequency = 'ANNUALLY'
            interval = Math.round(avgInterval / 365)
          } else if (avgInterval > 21) {
            frequency = 'MONTHLY'
            interval = Math.round(avgInterval / 30)
          } else if (avgInterval > 10) {
            frequency = 'BIWEEKLY'
            interval = Math.round(avgInterval / 14)
          } else {
            frequency = 'WEEKLY'
            interval = Math.round(avgInterval / 7)
          }
        }

        // Calculate confidence score based on consistency of intervals
        // Lower standard deviation means higher confidence
        const maxAllowedStdDev = avgInterval * 0.3 // Allow up to 30% deviation
        const confidenceScore = Math.max(
          0,
          Math.min(1, 1 - stdDev / maxAllowedStdDev),
        )

        // Skip if confidence score is too low
        if (confidenceScore < minConfidence) {
          continue
        }

        // Check if amounts are consistent
        const amounts = merchantTransactions.map((t) => t.amount)
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
        const amountVariance =
          amounts.reduce((a, b) => a + Math.pow(b - avgAmount, 2), 0) /
          amounts.length
        const amountStdDev = Math.sqrt(amountVariance)
        const isVariableAmount = amountStdDev / Math.abs(avgAmount) > 0.05 // 5% threshold

        // Calculate next scheduled date based on detected pattern
        const lastTransactionDate = merchantTransactions.at(-1)?.date
        if (!lastTransactionDate) continue
        const nextScheduledDate = new Date(lastTransactionDate)

        switch (frequency) {
          case 'WEEKLY':
            nextScheduledDate.setDate(
              nextScheduledDate.getDate() + 7 * interval,
            )
            break
          case 'BIWEEKLY':
            nextScheduledDate.setDate(
              nextScheduledDate.getDate() + 14 * interval,
            )
            break
          case 'MONTHLY':
            nextScheduledDate.setMonth(nextScheduledDate.getMonth() + interval)
            break
          case 'SEMI_MONTHLY':
            if (nextScheduledDate.getDate() < 15) {
              nextScheduledDate.setDate(15)
            } else {
              nextScheduledDate.setMonth(nextScheduledDate.getMonth() + 1)
              nextScheduledDate.setDate(1)
            }
            break
          case 'ANNUALLY':
            nextScheduledDate.setFullYear(
              nextScheduledDate.getFullYear() + interval,
            )
            break
          default:
            nextScheduledDate.setMonth(nextScheduledDate.getMonth() + 1)
            break
        }

        // Get dayOfMonth or dayOfWeek
        let dayOfMonth: number | null = null
        let dayOfWeek: number | null = null

        if (
          frequency === 'MONTHLY' ||
          frequency === 'SEMI_MONTHLY' ||
          frequency === 'ANNUALLY'
        ) {
          dayOfMonth = lastTransactionDate.getDate()
        } else if (frequency === 'WEEKLY' || frequency === 'BIWEEKLY') {
          dayOfWeek = lastTransactionDate.getDay()
        }

        // Create recurring transaction suggestion
        detectedRecurringTransactions.push({
          bankAccountId: merchantTransactions[0].bankAccountId,
          title: merchantName,
          description: `Auto-detected recurring transaction for ${merchantName}`,
          amount: avgAmount,
          currency: 'USD', // Default, could be customized based on user preference
          frequency,
          interval,
          startDate: merchantTransactions[0].date,
          nextScheduledDate,
          dayOfMonth,
          dayOfWeek,
          merchantName,
          isVariable: isVariableAmount,
          confidenceScore,
          source: 'detected',
          transactionIds: merchantTransactions.map((t) => t.id),
        })
      }

      return {
        detectedRecurringTransactions,
        count: detectedRecurringTransactions.length,
      }
    }),
})
