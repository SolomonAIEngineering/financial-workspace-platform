import { TRPCError } from '@trpc/server';
import { getCommentSchema } from '../schema';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';

/**
 * Protected procedure to get a single comment by ID.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Retrieves the specified comment
 * 3. Includes user information
 * 
 * @input {GetCommentInput} - Comment ID
 * @returns The comment object with user information
 * @throws {TRPCError} If the comment doesn't exist
 */
export const get = protectedProcedure
    .input(getCommentSchema)
    .query(async ({ input }) => {
        const comment = await prisma.comment.findUnique({
            where: {
                id: input.id,
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

        if (!comment) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Comment not found',
            });
        }

        return comment;
    }); 