import { TRPCError } from '@trpc/server'
import { associatedTransactionsSchema } from '../schemas'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Retrieves transactions associated with a recurring transaction with pagination.
 * 
 * @remarks
 * This procedure fetches transactions linked to a specific recurring transaction,
 * with pagination support. Security checks ensure the recurring transaction
 * belongs to the authenticated user.
 * 
 * @param input - Input parameters
 * @param input.id - The unique identifier of the recurring transaction
 * @param input.page - Page number (default: 1)
 * @param input.limit - Number of items per page (default: 20, max: 100)
 * 
 * @returns Object containing:
 *   - transactions: Paginated list of transactions associated with the recurring transaction
 *   - pagination: Pagination metadata (total count, current page, limit, total pages)
 * 
 * @throws {TRPCError} 
 *   - With code 'NOT_FOUND' if the recurring transaction doesn't exist or doesn't belong to the user
 *   - Authentication errors (handled by protectedProcedure)
 */
export const getAssociatedTransactions = protectedProcedure
    .input(associatedTransactionsSchema)
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
    }) 