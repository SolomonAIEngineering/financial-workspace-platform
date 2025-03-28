import { Prisma, prisma } from '@solomonai/prisma'

import { protectedProcedure } from '../../../middlewares/procedures'
import { transactionFilterSchema } from '../schema'

export const getTransactionsHandler = protectedProcedure
  .input(transactionFilterSchema)
  .query(async ({ ctx, input }) => {
    const { page, limit, ...filters } = input
    const skip = (page - 1) * limit

    // Build filter conditions
    const where: Prisma.TransactionWhereInput = {
      userId: ctx.session?.userId,
    }

    if (filters.merchant) {
      where.merchantName = {
        contains: filters.merchant,
        mode: 'insensitive',
      }
    }

    if (filters.category) {
      where.category = filters.category
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasEvery: filters.tags }
    }

    if (filters.method) {
      where.paymentMethod = { contains: filters.method, mode: 'insensitive' }
    }

    if (filters.assignedTo) {
      where.assigneeId = filters.assignedTo
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.dateFrom || filters.dateTo) {
      where.date = {}
      if (filters.dateFrom) {
        where.date.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        where.date.lte = new Date(filters.dateTo)
      }
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

    // Get transactions with pagination
    const transactions = await prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        bankAccount: {
          select: {
            name: true,
            plaidAccountId: true,
            type: true,
            subtype: true,
            bankConnection: {
              select: {
                institutionId: true,
                institutionName: true,
              },
            },
          },
        },
        transactionCategory: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        transactionTags: {
          select: {
            tag: true,
          },
        },
        attachments: {
          select: {
            id: true,
            fileUrl: true,
            name: true,
            createdAt: true,
          },
        },
      },
    })

    // Get total count for pagination
    const totalCount = await prisma.transaction.count({ where })

    return {
      transactions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    }
  })
