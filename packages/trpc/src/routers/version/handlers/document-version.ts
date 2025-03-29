import { prisma } from '@solomonai/prisma'
import { omit } from 'lodash'
import { protectedProcedure } from '../../../middlewares/procedures'
import { documentVersionSchema } from '../schema'

/**
 * Protected procedure to get a specific document version by ID.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Retrieves a single document version with its details
 * 3. Formats the response to include user information
 *
 * @input {DocumentVersionInput} - Document version ID
 * @returns The document version with user information
 *
 * @throws {TRPCError} NOT_FOUND - If the version does not exist
 */
export const documentVersion = protectedProcedure
  .input(documentVersionSchema)
  .query(async ({ input }) => {
    const version = await prisma.documentVersion.findUniqueOrThrow({
      select: {
        id: true,
        contentRich: true,
        createdAt: true,
        documentId: true,
        title: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      where: {
        id: input.documentVersionId,
      },
    })

    // Format the response
    return {
      ...omit(version, 'User'),
      userId: version.user.id,
      username: version.user.username,
    }
  })
