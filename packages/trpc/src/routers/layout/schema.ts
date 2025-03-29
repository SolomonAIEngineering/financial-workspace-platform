import { z } from 'zod'

/**
 * Schema for team member information
 */
export const teamMemberSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  role: z.string(),
})

/**
 * Schema for current user information
 */
export const currentUserSchema = z.object({
  name: z.string().nullable(),
  profileImageUrl: z.string().nullable(),
  teamId: z.string().nullable(),
  bankConnections: z.array(z.any()),
  organizationName: z.string().nullable(),
  organizationUnit: z.string().nullable(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  teams: z.array(teamMemberSchema),
})

/**
 * Schema for app layout response
 */
export const appLayoutResponseSchema = z.object({
  currentUser: currentUserSchema,
})

export type TeamMember = z.infer<typeof teamMemberSchema>
export type CurrentUser = z.infer<typeof currentUserSchema>
export type AppLayoutResponse = z.infer<typeof appLayoutResponseSchema>
