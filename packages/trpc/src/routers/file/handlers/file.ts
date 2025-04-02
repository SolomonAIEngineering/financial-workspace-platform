import { CreateFileSchemaRequest } from '../schema'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Mutations for the file router
 */
export const createFile = protectedProcedure
  .input(CreateFileSchemaRequest)
  // Apply both validation middlewares in sequence
  .mutation(async ({ ctx, input }) => {
    // No need for validation calls here - handled by middleware
    return await prisma.file.create({
      data: {
        id: input.id,
        appUrl: input.appUrl,
        documentId: input.documentId,
        size: input.size,
        type: input.type,
        url: input.url,
        userId: ctx.user?.id as string,
      },
    })
  })
