import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { discussionsSchema } from '../schema';

/**
 * Protected procedure to get all discussions for a document.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Retrieves all discussions for the specified document
 * 3. Includes comments and user information
 * 
 * @input {DiscussionsInput} - Document ID
 * @returns Object containing an array of discussions with their comments
 */
export const discussions = protectedProcedure
  .input(discussionsSchema)
  .query(async ({ input }) => {
    const discussions = await prisma.discussion.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        comments: {
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            id: true,
            contentRich: true,
            createdAt: true,
            discussionId: true,
            isEdited: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                profileImageUrl: true,
              },
            },
          },
        },
        createdAt: true,
        documentContent: true,
        isResolved: true,
        user: true,
        userId: true,
      },
      where: {
        documentId: input.documentId,
      },
    });

    return {
      discussions: discussions,
    };
  });
