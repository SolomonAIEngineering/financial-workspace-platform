import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Get the full profile for the authenticated user
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Retrieves the complete user profile with all available fields
 * 
 * @returns The complete user object for the authenticated user
 * 
 * @throws {TRPCError} NOT_FOUND - If the user cannot be found
 */
export const getFullProfile = protectedProcedure.query(async ({ ctx }) => {
  const user = await prisma.user.findUnique({
    where: { id: ctx.session?.userId },
  })

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User not found',
    })
  }

  return user
})
