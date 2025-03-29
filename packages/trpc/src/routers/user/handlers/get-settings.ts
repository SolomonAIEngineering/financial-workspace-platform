import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Get user settings with essential profile information
 * 
 * This procedure:
 * 1. Verifies the user is authenticated
 * 2. Retrieves basic user settings and profile information
 * 
 * @returns User settings and basic profile information
 * 
 * @throws {TRPCError} NOT_FOUND - If the user cannot be found
 */
export const getSettings = protectedProcedure.query(async ({ ctx }) => {
  // Get all available fields for the user
  const user = await prisma.user.findUnique({
    select: {
      email: true,
      name: true,
      profileImageUrl: true,
    },
    where: { id: ctx.session?.userId },
  })

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User not found'
    })
  }

  return user
})
