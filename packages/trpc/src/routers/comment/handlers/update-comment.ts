import { MAX_COMMENT_LENGTH, updateCommentSchema } from '../schema'

import { NodeApi } from '@udecode/plate'
import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Protected procedure to update a comment.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Validates the updated comment length
 * 3. Updates the specified comment
 *
 * @input {UpdateCommentInput} - Comment ID, discussion ID, content, and edit flag
 * @returns The updated comment
 *
 * @throws {TRPCError} BAD_REQUEST - If the comment is too long
 * @throws {TRPCError} NOT_FOUND - If the comment does not exist
 */
export const updateComment = protectedProcedure
  .input(updateCommentSchema)
  .mutation(({ input }) => {
    const content = input.contentRich
      ? NodeApi.string({
        children: input.contentRich as any,
        type: 'root',
      })
      : undefined

    if (content && content.length > MAX_COMMENT_LENGTH) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Comment is too long',
      })
    }

    return prisma.comment.update({
      data: {
        content,
        contentRich: input.contentRich,
        isEdited: input.isEdited,
      },
      where: { id: input.id },
    })
  })
