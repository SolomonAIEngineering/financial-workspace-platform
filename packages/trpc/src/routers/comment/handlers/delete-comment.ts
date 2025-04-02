import { deleteCommentSchema } from '../schema'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Protected procedure to delete a comment.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Deletes the specified comment
 *
 * @input {DeleteCommentInput} - Comment ID and discussion ID
 * @returns The deleted comment
 *
 * @throws {TRPCError} NOT_FOUND - If the comment does not exist
 */
export const deleteComment = protectedProcedure
  .input(deleteCommentSchema)
  .mutation(({ input }) => {
    return prisma.comment.delete({
      where: { id: input.id, discussionId: input.discussionId },
    })
  })
