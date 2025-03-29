import { prisma } from '@solomonai/prisma'
import { protectedProcedure } from '../../../middlewares/procedures'
import { resolveDiscussionSchema } from '../schema'

/**
 * Protected procedure to mark a discussion as resolved.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Updates the discussion to set isResolved to true
 *
 * @input {ResolveDiscussionInput} - Discussion ID
 * @returns The updated discussion
 *
 * @throws {TRPCError} NOT_FOUND - If the discussion does not exist
 */
export const resolveDiscussion = protectedProcedure
  .input(resolveDiscussionSchema)
  .mutation(({ input }) => {
    return prisma.discussion.update({
      data: { isResolved: true },
      where: { id: input.id },
    })
  })
