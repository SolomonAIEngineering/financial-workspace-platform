import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { searchRecurringTransactionsSchema } from '../schemas'

/**
 * Searches recurring transactions with comprehensive filters
 */
export const searchRecurringTransactions = protectedProcedure
  .input(searchRecurringTransactionsSchema)
  .query(async ({ ctx, input }) => {
    const { query, filters, page, limit, sortBy, sortOrder } = input
    const skip = (page - 1) * limit

    // Build the base where condition for user's transactions
    const where: any = {
      bankAccount: {
        userId: ctx.session?.userId,
      },
    }

    // Add text search if query provided
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { merchantName: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
      ]
    }

    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        where.status = filters.status
      }

      if (filters.frequency) {
        where.frequency = filters.frequency
      }

      if (filters.category) {
        where.categorySlug = filters.category
      }

      if (filters.merchantName) {
        where.merchantName = { contains: filters.merchantName, mode: 'insensitive' }
      }

      if (filters.bankAccountId) {
        where.bankAccountId = filters.bankAccountId
      }

      if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
        where.amount = {}
        if (filters.minAmount !== undefined) {
          where.amount.gte = filters.minAmount
        }
        if (filters.maxAmount !== undefined) {
          where.amount.lte = filters.maxAmount
        }
      }

      if (filters.startDate || filters.endDate) {
        where.nextScheduledDate = {}
        if (filters.startDate) {
          where.nextScheduledDate.gte = new Date(filters.startDate)
        }
        if (filters.endDate) {
          where.nextScheduledDate.lte = new Date(filters.endDate)
        }
      }

      if (filters.tags && filters.tags.length > 0) {
        where.tags = {
          hasEvery: filters.tags,
        }
      }
    }

    // Determine sort order
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Execute query with pagination
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        bankAccount: {
          select: {
            name: true,
            plaidAccountId: true,
            type: true,
            subtype: true,
          },
        },
        targetAccount: {
          select: {
            name: true,
            plaidAccountId: true,
            type: true,
            subtype: true,
          },
        },
      },
    })

    // Get total count for pagination
    const totalCount = await prisma.recurringTransaction.count({ where })

    return {
      recurringTransactions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    }
  })
