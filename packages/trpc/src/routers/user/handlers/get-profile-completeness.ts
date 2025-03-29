import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Get basic profile completeness metrics
 * 
 * This procedure:
 * 1. Verifies the user is authenticated
 * 2. Calculates profile completeness based on essential fields
 * 3. Identifies missing fields that should be completed
 * 
 * @returns Object containing completeness percentage and missing fields
 * 
 * @throws {TRPCError} NOT_FOUND - If the user cannot be found
 */
export const getProfileCompleteness = protectedProcedure.query(async ({ ctx }) => {
  const user = await prisma.user.findUnique({
    where: { id: ctx.session?.userId },
  })

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User not found',
    })
  }

  // Calculate profile completeness only on fields we know exist
  const fields = [
    user.name,
    user.firstName,
    user.lastName,
    user.profileImageUrl,
    user.email,
  ]

  const completedFields = fields.filter((field) => !!field).length
  const totalFields = fields.length
  const completenessPercentage = Math.round(
    (completedFields / totalFields) * 100,
  )

  return {
    completeness: completenessPercentage,
    missingFields: fields
      .map((field, index) => {
        const fieldNames = [
          'name',
          'firstName',
          'lastName',
          'profileImageUrl',
          'email',
        ]

        return field === undefined ? fieldNames[index] : null
      })
      .filter(Boolean),
  }
})
