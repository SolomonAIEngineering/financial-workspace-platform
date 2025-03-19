import { ResourceType } from '@/server/services/payment-tier';
import { createResourceValidationMiddleware } from '../middlewares/resourceValidationMiddleware';
import { createRouter } from '../trpc';
import { prisma } from '@/server/db';
import { protectedProcedure } from '../middlewares/procedures';
import { z } from 'zod';

// Create file-specific validation middlewares
const validateFileUpload = createResourceValidationMiddleware({
  resourceType: ResourceType.FILE,
  getSize: (input) => input.size,
});

const validateStorageUsage = createResourceValidationMiddleware({
  resourceType: ResourceType.STORAGE,
  getSize: (input) => input.size,
});

export const fileMutations = {
  createFile: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        appUrl: z.string(),
        documentId: z.string(),
        size: z.number(),
        type: z.string(),
        url: z.string(),
      })
    )
    // Apply both validation middlewares in sequence
    .use(validateFileUpload)
    .use(validateStorageUsage)
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
          userId: ctx.userId,
        },
      });
    }),
};

export const fileRouter = createRouter({
  ...fileMutations,
});
