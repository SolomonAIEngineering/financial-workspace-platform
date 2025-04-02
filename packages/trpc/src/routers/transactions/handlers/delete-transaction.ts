import { TRPCError } from '@trpc/server'
import { deleteFiles } from '@solomonai/lib/clients'
import { deleteTransactionSchema } from '../schema'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

export const deleteTransactionHandler = protectedProcedure
  .input(deleteTransactionSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId as string

    try {
      return await prisma.$transaction(async (tx) => {
        // Check if transaction exists and belongs to user
        const existingTransaction = await tx.transaction.findUnique({
          where: { id: input.id, userId: userId },
          include: {
            attachments: {
              select: {
                id: true,
                fileUrl: true,
              },
            },
          },
        })

        if (!existingTransaction) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Transaction not found',
          })
        }

        // Delete files from UploadThing if there are any attachments
        if (existingTransaction.attachments.length > 0) {
          const fileUrls = existingTransaction.attachments
            .map((attachment) => attachment.fileUrl)
            .filter(Boolean)

          if (fileUrls.length > 0) {
            try {
              await deleteFiles(fileUrls)
            } catch (error) {
              console.error('Error deleting files from UploadThing:', error)
              // Continue with transaction deletion even if file deletion fails
            }
          }

          // Delete all attachments
          await tx.attachment.deleteMany({
            where: {
              transactionId: input.id,
            },
          })
        }

        // Delete the transaction
        await tx.transaction.delete({
          where: { id: input.id, userId: userId },
        })

        return {
          success: true,
          message: 'Transaction and associated files deleted successfully',
        }
      })
    } catch (error) {
      console.error('Error in deleteTransactionHandler:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete transaction',
        cause: error,
      })
    }
  })
