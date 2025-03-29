import { prisma } from '@solomonai/prisma'
import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { transactionSchema } from '../schema'

/**
 * Creates a new transaction in the system.
 * This handler verifies that the specified bank account belongs to the authenticated user
 * before creating the transaction.
 *
 * @param ctx - The context object containing the user's session information
 * @param input - The transaction data conforming to the transactionSchema, including:
 *   - bankAccountId: ID of the bank account the transaction belongs to
 *   - amount: Transaction amount
 *   - date: Transaction date
 *   - description: Transaction description
 *   - category: Transaction category
 *   - tags: Optional array of tags to associate with the transaction
 *   - Additional transaction properties defined in the schema
 * @returns The newly created Transaction entity with all its properties
 * @throws {TRPCError} With code 'FORBIDDEN' if the bank account doesn't exist or doesn't belong to the user
 */
export const createTransactionHandler = protectedProcedure
  .input(transactionSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId as string
    // Verify bank account belongs to user
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: input.bankAccountId, userId: userId },
    })

    if (!bankAccount) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Bank account not found or unauthorized',
      })
    }

    // Create transaction in a transaction for atomicity
    const now = new Date()
    const transactionId = await prisma.$transaction(async (tx) => {
      // Create transaction
      const newTransaction = await tx.transaction.create({
        data: {
          ...input,
          userId: userId,
          isManual: true,
          tags: input.tags || [],
          lastModifiedAt: now,
        },
      })

      return newTransaction.id
    })

    return {
      success: true,
      transactionId: transactionId,
      timestamp: now,
    }
  })
