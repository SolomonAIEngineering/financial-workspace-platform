import { prisma } from '@solomonai/prisma'
import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { ratelimitMiddleware } from '../../../middlewares/ratelimitMiddleware'
import { createDiscussionSchema } from '../schema'

/**
 * Protected procedure to create a new discussion.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Rate-limits discussion creation
 * 3. Validates that the document exists
 * 4. Creates a new discussion with proper relationships
 *
 * @input {CreateDiscussionInput} - Document content and document ID
 * @returns Created discussion with user and document information
 */
export const createDiscussion = protectedProcedure
  .use(ratelimitMiddleware('discussion/create'))
  .input(createDiscussionSchema)
  .mutation(async ({ ctx, input }) => {
    // First verify the document exists
    const document = await prisma.document.findUnique({
      where: { id: input.documentId },
      select: { id: true },
    })

    if (!document) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Document not found',
      })
    }

    // Create the discussion with proper relationships
    return await prisma.discussion.create({
      data: {
        documentContent: input.documentContent,
        // Connect to the document
        document: {
          connect: { id: input.documentId },
        },
        // Connect to the user
        user: {
          connect: { id: ctx.user?.id as string },
        },
      },
      // Return comprehensive information
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImageUrl: true,
          },
        },
        document: {
          select: {
            id: true,
            title: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            id: true,
            content: true,
            contentRich: true,
            createdAt: true,
            isEdited: true,
            user: {
              select: {
                id: true,
                name: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
    })
  })
