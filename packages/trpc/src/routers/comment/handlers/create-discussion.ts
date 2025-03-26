import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { ratelimitMiddleware } from '../../../middlewares/ratelimitMiddleware';
import { createDiscussionSchema } from '../schema';

/**
 * Protected procedure to create a new discussion.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Rate-limits discussion creation
 * 3. Creates a new discussion
 * 
 * @input {CreateDiscussionInput} - Document content and document ID
 * @returns Created discussion ID
 */
export const createDiscussion = protectedProcedure
  .use(ratelimitMiddleware('discussion/create'))
  .input(createDiscussionSchema)
  .mutation(async ({ ctx, input }) => {
    return await prisma.discussion.create({
      data: {
        documentContent: input.documentContent,
        documentId: input.documentId,
        userId: ctx.user?.id as string,
      },
      select: { id: true },
    });
  });
