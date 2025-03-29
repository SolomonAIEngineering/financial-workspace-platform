import { prisma } from '@solomonai/prisma'
import { protectedProcedure } from '../../../middlewares/procedures'
import { searchSchema } from '../schema'

/**
 * Protected procedure to search for documents.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Searches for non-archived documents with titles containing the search query
 *
 * @input {SearchInput} - Search query string
 * @returns Object containing the matching documents array
 */
export const search = protectedProcedure
  .input(searchSchema)
  .query(async ({ ctx, input }) => {
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        icon: true,
        title: true,
      },
      where: {
        isArchived: false,
        title: {
          contains: input.q,
        },
        userId: ctx.session?.userId,
      },
    })

    return {
      documents,
    }
  })
