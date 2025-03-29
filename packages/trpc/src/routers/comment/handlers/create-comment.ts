import { MAX_COMMENT_LENGTH, createCommentSchema } from '../schema'

import { NodeApi } from '@udecode/plate'
import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma'
import { protectedProcedure } from '../../../middlewares/procedures'
import { ratelimitMiddleware } from '../../../middlewares/ratelimitMiddleware'

/**
 * Protected procedure to create a new comment.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Rate-limits comment creation
 * 3. Validates comment length
 * 4. Creates a new comment
 *
 * @input {CreateCommentInput} - Comment content and discussion ID
 * @returns Created comment ID
 *
 * @throws {TRPCError} BAD_REQUEST - If the comment is too long
 */
export const createComment = protectedProcedure
  .use(ratelimitMiddleware('comment/create'))
  .input(createCommentSchema)
  .mutation(async ({ ctx, input }) => {
    const content = input.contentRich
      ? NodeApi.string({
        children: input.contentRich as any,
        type: 'root',
      })
      : ''

    if (content.length > MAX_COMMENT_LENGTH) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Comment is too long',
      })
    }

    return await prisma.comment.create({
      data: {
        content: content,
        contentRich: input.contentRich,
        discussionId: input.discussionId,
        userId: ctx.user?.id as string,
      },
      select: { id: true },
    })
  })
