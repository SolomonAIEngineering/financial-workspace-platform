import { Prisma, TransactionCategory, prisma } from '@solomonai/prisma';

import { protectedProcedure } from '../../../middlewares/procedures';
import { searchTransactionsSchema } from '../schema';

export const searchTransactionsHandler = protectedProcedure
  .input(searchTransactionsSchema)
  .query(async ({ ctx, input }) => {
    const { query, startDate, endDate, minAmount, maxAmount, page, limit, categories, bankAccountIds } = input;
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
        { tags: { has: searchTerm } },
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

    if (categories) {
      where.category = {
        in: categories as TransactionCategory[],
      };
    }

    if (bankAccountIds) {
      where.bankAccountId = {
        in: bankAccountIds as string[],
      };
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
