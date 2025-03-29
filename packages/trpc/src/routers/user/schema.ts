import { z } from 'zod'

export const MAX_NAME_LENGTH = 100
export const MAX_EMAIL_LENGTH = 255
export const MAX_PROFILE_IMAGE_URL_LENGTH = 500
export const MAX_URL_LENGTH = 500
export const MAX_TEXT_LENGTH = 1000
export const MAX_SHORT_TEXT_LENGTH = 255
export const MAX_USERNAME_LENGTH = 255
export const MAX_ORGANIZATION_NAME_LENGTH = 255
export const MAX_ORGANIZATION_UNIT_LENGTH = 255

// Define AccountStatus enum if it doesn't exist in types
export const AccountStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
} as const
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus]

// Define a comprehensive schema for professional profile validation
export const professionalProfileSchema = z.object({
  // Address fields
  addressLine1: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  addressLine2: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  bio: z.string().max(MAX_TEXT_LENGTH, 'Bio is too long').optional().nullable(),
  businessEmail: z
    .string()
    .email('Invalid business email')
    .max(MAX_EMAIL_LENGTH)
    .optional()
    .nullable(),
  businessPhone: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  city: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  country: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  department: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),

  // Basic profile
  email: z
    .string()
    .email()
    .max(MAX_EMAIL_LENGTH, 'Email is too long')
    .optional(),
  employeeId: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  firstName: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  githubProfile: z
    .string()
    .url('Invalid URL')
    .max(MAX_URL_LENGTH)
    .optional()
    .nullable(),
  hireDate: z.string().optional().nullable(), // Changed from z.date() to z.string() for easier handling

  // Professional details
  jobTitle: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  language: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  lastName: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  // Social profiles
  linkedinProfile: z
    .string()
    .url('Invalid URL')
    .max(MAX_URL_LENGTH)
    .optional()
    .nullable(),

  name: z
    .string()
    .min(1, 'Name is required')
    .max(MAX_NAME_LENGTH, 'Name is too long')
    .trim()
    .optional(),
  officeLocation: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  // Organization data
  organizationName: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),

  organizationUnit: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  // Contact information
  phoneNumber: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  postalCode: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  profileImageUrl: z
    .string()
    .url('Invalid URL')
    .max(MAX_PROFILE_IMAGE_URL_LENGTH, 'Profile image URL is too long')
    .optional()
    .nullable(),
  state: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  teamName: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),

  timezone: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  twitterProfile: z
    .string()
    .url('Invalid URL')
    .max(MAX_URL_LENGTH)
    .optional()
    .nullable(),
  yearsOfExperience: z.number().int().positive().optional().nullable(),
})

// Schema for organization-related updates
export const organizationProfileSchema = z.object({
  department: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  jobTitle: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  organizationName: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  organizationUnit: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  teamName: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
})

// Schema for contact information updates
export const contactInfoSchema = z.object({
  addressLine1: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  addressLine2: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  businessEmail: z
    .string()
    .email('Invalid business email')
    .max(MAX_EMAIL_LENGTH)
    .optional()
    .nullable(),
  businessPhone: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  city: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  country: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  officeLocation: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  phoneNumber: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  postalCode: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  state: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
})

// Schema for preferences
export const userPreferencesSchema = z.object({
  displayPreferences: z
    .object({
      compactMode: z.boolean().optional(),
      fontSize: z.enum(['small', 'medium', 'large']).optional(),
      theme: z.enum(['light', 'dark', 'system']).optional(),
    })
    .optional()
    .nullable(),
  documentPreferences: z
    .object({
      autoSave: z.boolean().optional(),
      defaultView: z.enum(['edit', 'preview']).optional(),
      showComments: z.boolean().optional(),
    })
    .optional()
    .nullable(),
  notificationPreferences: z
    .object({
      documentUpdates: z.boolean().optional(),
      emailNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
      teamUpdates: z.boolean().optional(),
    })
    .optional()
    .nullable(),
})

export const userIdSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
})

export const checkoutSessionSchema = z.object({
  priceId: z.string(),
})

export const settingsUpdateSchema = z.object({
  bio: z.string().max(MAX_TEXT_LENGTH, 'Bio is too long').optional(),
  email: z
    .string()
    .email()
    .max(MAX_EMAIL_LENGTH, 'Email is too long')
    .optional(),
  firstName: z.string().max(MAX_SHORT_TEXT_LENGTH).optional(),
  lastName: z.string().max(MAX_SHORT_TEXT_LENGTH).optional(),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(MAX_NAME_LENGTH, 'Name is too long')
    .trim()
    .optional(),
  profileImageUrl: z
    .string()
    .url('Invalid URL')
    .max(MAX_PROFILE_IMAGE_URL_LENGTH, 'Profile image URL is too long')
    .optional(),
  username: z
    .string()
    .min(1, 'Username is required')
    .max(MAX_USERNAME_LENGTH, 'Username is too long')
    .trim()
    .optional(),
  organizationName: z
    .string()
    .min(1, 'Organization name is required')
    .max(MAX_ORGANIZATION_NAME_LENGTH, 'Organization name is too long')
    .trim()
    .optional(),
  organizationUnit: z
    .string()
    .min(1, 'Organization unit is required')
    .max(MAX_ORGANIZATION_UNIT_LENGTH, 'Organization unit is too long')
    .trim()
    .optional(),
})

export const socialProfilesSchema = z.object({
  githubProfile: z
    .string()
    .url('Invalid URL')
    .max(MAX_URL_LENGTH)
    .optional()
    .nullable(),
  linkedinProfile: z
    .string()
    .url('Invalid URL')
    .max(MAX_URL_LENGTH)
    .optional()
    .nullable(),
  twitterProfile: z
    .string()
    .url('Invalid URL')
    .max(MAX_URL_LENGTH)
    .optional()
    .nullable(),
})

export const languageSchema = z.object({
  language: z.string().min(2).max(10),
})

export const timezoneSchema = z.object({
  timezone: z.string().min(1).max(50),
})

export const orgDirectorySchema = z.object({
  organizationName: z.string().optional(),
})

export const searchUsersSchema = z.object({
  limit: z.number().min(1).max(50).default(10),
  query: z.string().min(1).max(100),
})
