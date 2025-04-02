import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { recurringTransactionFilterSchema } from '../schemas'
import { z } from 'zod'

/**
 * Retrieves a paginated list of recurring transactions for a user with filtering options.
 * 
 * @remarks
 * This procedure fetches recurring transactions associated with bank accounts owned by the authenticated user.
 * Results can be filtered by various criteria including title, merchant name, status, etc.
 * 
 * @param input - Filter parameters for recurring transactions
 * @param input.page - Page number for pagination (defaults to 1)
 * @param input.limit - Number of items per page (defaults to 10)
 * @param input.title - Optional filter for transaction title (case insensitive substring match)
 * @param input.merchantName - Optional filter for merchant name (case insensitive substring match)
 * @param input.status - Optional filter for transaction status
 * @param input.frequency - Optional filter for transaction frequency
 * @param input.bankAccountId - Optional filter for specific bank account
 * @param input.minAmount - Optional minimum transaction amount filter
 * @param input.maxAmount - Optional maximum transaction amount filter
 * 
 * @returns Object containing:
 *   - recurringTransactions: Array of recurring transaction objects with related bank account info
 *   - pagination: Pagination metadata including total count, current page, limit, and total pages
 * 
 * @throws {TRPCError} If user authentication fails (handled by protectedProcedure)
 */
export const getRecurringTransactions = protectedProcedure
  .input(recurringTransactionFilterSchema)
  .query(async ({ ctx, input }) => {
    const { page, limit, ...filters } = input
    const skip = (page - 1) * limit

    // Build filter conditions
    const where: any = {
      // Find recurring transactions for all bank accounts owned by this user
      bankAccount: {
        userId: ctx.session?.userId,
      },
    }

    if (filters.title) {
      where.title = { contains: filters.title, mode: 'insensitive' }
    }

    if (filters.merchantName) {
      where.merchantName = {
        contains: filters.merchantName,
        mode: 'insensitive',
      }
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.frequency) {
      where.frequency = filters.frequency
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

    // Get recurring transactions with pagination
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nextScheduledDate: 'asc' },
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

