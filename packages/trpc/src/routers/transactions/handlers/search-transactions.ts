import { Prisma, prisma } from '@solomonai/prisma';

import { protectedProcedure } from '../../../middlewares/procedures';
import { z } from 'zod';

export const searchTransactionsHandler = protectedProcedure
  .input(
    z.object({
      query: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      minAmount: z.number().optional(),
      maxAmount: z.number().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    })
  )
  .query(async ({ ctx, input }) => {
    const { query, startDate, endDate, minAmount, maxAmount, page, limit } = input;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: Prisma.TransactionWhereInput = {
      userId: ctx.session?.userId,
    };

    // Text search across multiple fields
    if (query && query.trim() !== '') {
      const searchTerm = query.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { merchantName: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { paymentMethod: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startDate;
      }
      if (endDate) {
        where.date.lte = endDate;
      }
    }

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) {
        where.amount.gte = minAmount;
      }
      if (maxAmount !== undefined) {
        where.amount.lte = maxAmount;
      }
    }

    // Execute search query with pagination
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        include: {
          bankAccount: {
            select: {
              id: true,
              name: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    };
  });
