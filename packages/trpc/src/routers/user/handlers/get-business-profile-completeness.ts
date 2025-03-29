import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Get enhanced profile completeness with all relevant fields for business profile
 * 
 * This procedure:
 * 1. Retrieves the user's profile information
 * 2. Calculates completeness percentages for various profile sections
 * 3. Identifies fields that need to be completed
 * 
 * @returns Object containing completeness metrics and suggested next steps
 * 
 * @throws {Error} If the user is not found
 */
export const getBusinessProfileCompleteness = protectedProcedure.query(async ({ ctx }) => {
  const user = await prisma.user.findUnique({
    where: { id: ctx.session?.userId },
  })

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User not found'
    })
  }

  // Calculate profile completeness on all business-relevant fields
  const businessFields = [
    user.name,
    user.firstName,
    user.lastName,
    user.profileImageUrl,
    user.email,
    user.bio,
    user.jobTitle,
    user.department,
    user.organizationName,
    user.teamName,
    user.phoneNumber,
    user.businessEmail,
    user.businessPhone,
    user.officeLocation,
    user.addressLine1,
    user.city,
    user.country,
  ]

  const completedFields = businessFields.filter((field) => !!field).length
  const totalFields = businessFields.length
  const completenessPercentage = Math.round(
    (completedFields / totalFields) * 100,
  )

  // Create sections with their own completeness
  const basicInfo = [
    user.name,
    user.firstName,
    user.lastName,
    user.email,
    user.profileImageUrl,
  ]
  const basicInfoCompleteness = Math.round(
    (basicInfo.filter((f) => !!f).length / basicInfo.length) * 100,
  )

  const professionalInfo = [
    user.jobTitle,
    user.department,
    user.organizationName,
    user.teamName,
  ]
  const professionalInfoCompleteness = Math.round(
    (professionalInfo.filter((f) => !!f).length / professionalInfo.length) *
    100,
  )

  const contactInfo = [
    user.phoneNumber,
    user.businessEmail,
    user.businessPhone,
    user.officeLocation,
    user.addressLine1,
    user.city,
    user.country,
  ]
  const contactInfoCompleteness = Math.round(
    (contactInfo.filter((f) => !!f).length / contactInfo.length) * 100,
  )

  return {
    nextStepsToComplete: businessFields
      .map((field, index) => {
        const fieldNames = [
          'name',
          'firstName',
          'lastName',
          'profileImageUrl',
          'email',
          'bio',
          'jobTitle',
          'department',
          'organizationName',
          'teamName',
          'phoneNumber',
          'businessEmail',
          'businessPhone',
          'officeLocation',
          'addressLine1',
          'city',
          'country',
        ]

        return field === undefined ? fieldNames[index] : null
      })
      .filter(Boolean),
    overallCompleteness: completenessPercentage,
    sections: {
      basicInfo: { completeness: basicInfoCompleteness },
      contactInfo: { completeness: contactInfoCompleteness },
      professionalInfo: { completeness: professionalInfoCompleteness },
    },
  }
})
