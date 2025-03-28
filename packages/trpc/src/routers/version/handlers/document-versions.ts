import { prisma } from '@solomonai/prisma'
import { omit } from 'lodash'
import { protectedProcedure } from '../../../middlewares/procedures'
import { documentVersionsSchema } from '../schema'

/**
 * Protected procedure to get all versions of a document.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Retrieves all versions of a document in descending order by creation date
 * 3. Formats each version to include user information
 *
 * @input {DocumentVersionsInput} - Document ID
 * @returns Object containing an array of document versions with user information
 *
 * @throws {TRPCError} NOT_FOUND - If the document does not exist
 */
export const documentVersions = protectedProcedure
  .input(documentVersionsSchema)
  .query(async ({ input }) => {
    const versions = await prisma.documentVersion.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        contentRich: true,
        createdAt: true,
        title: true,
        user: {
          select: {
            id: true,
            profileImageUrl: true,
            username: true,
          },
        },
      },
      where: {
        documentId: input.documentId,
      },
    })

    // Format the response
    return {
      versions: versions.map((version) => ({
        ...omit(version, 'User'),
        profileImageUrl: version.user.profileImageUrl,
        userId: version.user.id,
        username: version.user.username,
      })),
    }
  })
