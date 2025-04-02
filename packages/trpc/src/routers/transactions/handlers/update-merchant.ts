import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { updateMerchantSchema } from '../schema'

/**
 * Updates the merchant details of a transaction.
 * This handler verifies that the transaction belongs to the authenticated user
 * before updating its merchant information.
 *
 * @param ctx - The context object containing the user's session information
 * @param input - The input object containing:
 *   - id: Transaction ID to update
 *   - merchantName: New merchant name
 *   - merchantId: Optional merchant ID
 *   - merchantLogoUrl: Optional URL to merchant's logo
 *   - merchantCategory: Optional merchant category
 *   - merchantWebsite: Optional merchant website URL
 *   - merchantPhone: Optional merchant phone number
 *   - merchantAddress: Optional merchant address
 * @returns The updated transaction
 * @throws {TRPCError} With code 'NOT_FOUND' if the transaction doesn't exist or doesn't belong to the user
 */
export const updateMerchantHandler = protectedProcedure
  .input(updateMerchantSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      // Check if transaction exists and belongs to user
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          userId: true,
        },
      })

      if (
        !existingTransaction ||
        existingTransaction.userId !== ctx.session?.userId
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        })
      }

      // Update transaction with new merchant details
      const now = new Date()
      const updatedTransaction = await prisma.transaction.update({
        where: { id: input.id },
        data: {
          merchantName: input.merchantName,
          merchantId: input.merchantId,
          merchantLogoUrl: input.merchantLogoUrl,
          merchantCategory: input.merchantCategory,
          merchantWebsite: input.merchantWebsite,
          merchantPhone: input.merchantPhone,
          merchantAddress: input.merchantAddress,
          lastModifiedAt: now,
        },
        select: {
          id: true,
          name: true,
          amount: true,
          date: true,
          merchantName: true,
          merchantId: true,
          merchantLogoUrl: true,
          merchantCategory: true,
          merchantWebsite: true,
          merchantPhone: true,
          merchantAddress: true,
          lastModifiedAt: true,
        },
      })

      if (!updatedTransaction) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update merchant details',
        })
      }

      return updatedTransaction
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('Error in updateMerchant:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update merchant details',
        cause: error,
      })
    }
  })
