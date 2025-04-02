import {
  removeTransactionAttachmentResponseSchema,
  removeTransactionAttachmentSchema,
} from '../schema'

import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Protected procedure to remove an attachment from a transaction.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Validates that the attachment exists and belongs to the user's transaction
 * 3. Deletes the attachment record from the database
 *
 * @input {object} removeTransactionAttachmentSchema - The input parameters
 *   - attachmentId: Unique identifier of the attachment to remove
 *
 * @output {removeTransactionAttachmentResponseSchema} - The success response
 *   - success: Boolean indicating successful deletion
 *
 * @throws {TRPCError} NOT_FOUND - If the attachment doesn't exist or doesn't belong to the user
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error removing the attachment
 *
 * @returns Object with success flag indicating the attachment was removed
 */
export const removeTransactionAttachment = protectedProcedure
  .input(removeTransactionAttachmentSchema)
  .output(removeTransactionAttachmentResponseSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      // Get the authenticated user ID
      const userId = ctx.session?.userId

      // Ensure the attachment belongs to the user's transaction
      const attachment = await prisma.attachment.findFirst({
        where: {
          id: input.attachmentId,
          transaction: {
            userId,
          },
        },
      })

      if (!attachment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Attachment not found',
        })
      }

      // Delete the attachment
      await prisma.attachment.delete({
        where: {
          id: input.attachmentId,
        },
      })

      // TODO: delete the attachment from uploadthing

      // Validate the response against our schema
      return removeTransactionAttachmentResponseSchema.parse({ success: true })
    } catch (error) {
      console.error('Error removing attachment:', error)

      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to remove attachment',
      })
    }
  })
