import { getCommentsByDiscussionSchema } from '../schema';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';

/**
 * Protected procedure to get all comments for a discussion.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Retrieves all comments for the specified discussion
 * 3. Includes user information for each comment
 * 
 * @input {GetCommentsByDiscussionInput} - Discussion ID
 * @returns Array of comments with user information
 */
export const getByDiscussion = protectedProcedure
    .input(getCommentsByDiscussionSchema)
    .query(async ({ input }) => {
        const comments = await prisma.comment.findMany({
            where: {
                discussionId: input.discussionId,
            },
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profileImageUrl: true,
                    },
                },
            },
        });

        return comments;
    }); 