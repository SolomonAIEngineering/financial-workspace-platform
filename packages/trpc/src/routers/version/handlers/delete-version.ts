import { prisma } from '@solomonai/prisma'
import { protectedProcedure } from '../../../middlewares/procedures'
import { deleteVersionSchema } from '../schema'

/**
 * Protected procedure to delete a document version.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Deletes the version only if the user is the owner
 *
 * @input {DeleteVersionInput} - Version ID
 * @returns void
 *
 * @throws {TRPCError} NOT_FOUND - If the version does not exist or user doesn't have access
 */
export const deleteVersion = protectedProcedure
  .input(deleteVersionSchema)
  .mutation(async ({ ctx, input }) => {
    await prisma.documentVersion.delete({
      where: {
        id: input.id,
        userId: ctx.user?.id as string,
      },
    })
  })
