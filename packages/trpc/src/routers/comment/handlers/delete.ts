import { TRPCError } from '@trpc/server';
import { deleteCommentSchema } from '../schema';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';

/**
 * Protected procedure to delete a comment.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Checks if the user owns the comment
 * 3. Deletes the comment from the database
 * 
 * @input {DeleteCommentInput} - Comment ID
 * @returns Success message
 * @throws {TRPCError} If the comment doesn't exist or user doesn't have permission
 */
export const deleteComment = protectedProcedure
    .input(deleteCommentSchema)
    .mutation(async ({ input, ctx }) => {
        // First check if the comment exists and belongs to the user
        const existingComment = await prisma.comment.findFirst({
            where: {
                id: input.id,
                userId: ctx.user?.id,
            },
        });

        if (!existingComment) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Comment not found or you do not have permission to delete it',
            });
        }

        const deletedComment = await prisma.comment.delete({
            where: {
                id: input.id,
            },
        });

        if (!deletedComment) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to delete comment',
            });
        }

        return {
            success: true,
            message: 'Comment deleted successfully',
        };
    }); 