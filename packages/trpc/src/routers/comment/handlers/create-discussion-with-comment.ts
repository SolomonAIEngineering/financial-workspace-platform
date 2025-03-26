import { NodeApi } from '@udecode/plate';
import { TRPCError } from '@trpc/server';
import { nid } from '@solomonai/lib/utils/nid';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { ratelimitMiddleware } from '../../../middlewares/ratelimitMiddleware';
import { createDiscussionWithCommentSchema, MAX_COMMENT_LENGTH } from '../schema';

/**
 * Protected procedure to create a discussion and first comment in one operation.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Rate-limits discussion creation
 * 3. Validates comment length
 * 4. Creates a new discussion and its first comment
 * 
 * @input {CreateDiscussionWithCommentInput} - Document content, document ID, optional comment content and discussion ID
 * @returns Created discussion object
 * 
 * @throws {TRPCError} BAD_REQUEST - If the comment is too long
 */
export const createDiscussionWithComment = protectedProcedure
  .use(ratelimitMiddleware('discussion/create'))
  .input(createDiscussionWithCommentSchema)
  .mutation(async ({ ctx, input }) => {
    const content = input.contentRich
      ? NodeApi.string({
        children: input.contentRich as any,
        type: 'root',
      })
      : '';

    if (content.length > MAX_COMMENT_LENGTH) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Comment is too long',
      });
    }

    const discussion = await prisma.discussion.create({
      data: {
        id: input.discussionId ?? nid(),
        documentContent: input.documentContent,
        documentId: input.documentId,
        userId: ctx.user?.id as string,
      },
      select: { id: true },
    });

    await prisma.comment.create({
      data: {
        content,
        contentRich: input.contentRich,
        discussionId: discussion.id,
        userId: ctx.user?.id as string,
      },
    });

    return discussion;
  });
