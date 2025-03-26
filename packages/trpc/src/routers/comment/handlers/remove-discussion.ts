import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { removeDiscussionSchema } from '../schema';

/**
 * Protected procedure to remove a discussion.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Deletes the specified discussion
 * 
 * @input {RemoveDiscussionInput} - Discussion ID
 * @returns The deleted discussion
 * 
 * @throws {TRPCError} NOT_FOUND - If the discussion does not exist
 */
export const removeDiscussion = protectedProcedure
  .input(removeDiscussionSchema)
  .mutation(({ input }) => {
    return prisma.discussion.delete({
      where: { id: input.id },
    });
  });
