import { TeamRole } from '@solomonai/prisma/client'
import { z } from 'zod'

/**
 * Schema definitions for team router inputs and outputs
 */

// Define base validation schemas
export const teamCreateSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100),
  baseCurrency: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  logoUrl: z.string().url('Invalid URL').optional(),
  inboxEmail: z.string().email('Invalid email').optional(),
  inboxForwarding: z.boolean().optional(),
  documentClassification: z.boolean().optional(),
  flags: z.array(z.string()).optional(),
  slug: z.string().optional(),
})

/**
 * Type for team creation input
 */
export type TeamCreateInput = z.infer<typeof teamCreateSchema>

export const teamUpdateSchema = teamCreateSchema.partial()

/**
 * Type for team update input
 */
export type TeamUpdateInput = z.infer<typeof teamUpdateSchema>

export const teamIdSchema = z.object({
  teamId: z.string().min(1, 'Team ID is required'),
})

/**
 * Type for team ID input
 */
export type TeamIdInput = z.infer<typeof teamIdSchema>

export const addUserSchema = z.object({
  teamId: z.string(),
  userId: z.string(),
  role: z.nativeEnum(TeamRole).optional(),
})

/**
 * Type for add user input
 */
export type AddUserInput = z.infer<typeof addUserSchema>

export const removeUserSchema = z.object({
  teamId: z.string().min(1, 'Team ID is required'),
  userId: z.string().min(1, 'User ID is required'),
})

/**
 * Type for remove user input
 */
export type RemoveUserInput = z.infer<typeof removeUserSchema>

export const updateUserRoleSchema = z.object({
  teamId: z.string().min(1, 'Team ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  role: z.nativeEnum(TeamRole),
})

/**
 * Type for update user role input
 */
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>

export const createInviteSchema = z.object({
  teamId: z.string().min(1, 'Team ID is required'),
  email: z.string().email('Invalid email'),
  role: z.enum([TeamRole.OWNER, TeamRole.MEMBER]).default(TeamRole.MEMBER),
})

/**
 * Type for create invite input
 */
export type CreateInviteInput = z.infer<typeof createInviteSchema>

export const deleteInviteSchema = z.object({
  inviteId: z.string().min(1, 'Invite ID is required'),
})

/**
 * Type for delete invite input
 */
export type DeleteInviteInput = z.infer<typeof deleteInviteSchema>

export const acceptInviteSchema = z.object({
  code: z.string().min(1, 'Invite code is required'),
})

/**
 * Type for accept invite input
 */
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>

export const updateTeamSchema = z.object({
  id: z.string().min(1, 'Team ID is required'),
  data: teamUpdateSchema,
})

/**
 * Type for update team input
 */
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>

/**
 * Schema defining the structure of a team response
 */
export const teamResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  baseCurrency: z.string().nullable(),
  email: z.string().nullable(),
  logoUrl: z.string().nullable(),
  inboxEmail: z.string().nullable(),
  inboxForwarding: z.boolean().nullable(),
  documentClassification: z.boolean().nullable(),
  flags: z.array(z.string()).nullable(),
  slug: z.string().nullable(),
  isDefault: z.boolean().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

/**
 * Type for team response
 */
export type TeamResponse = z.infer<typeof teamResponseSchema>

/**
 * Schema defining the structure of a team member response
 */
export const teamMemberResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  role: z.nativeEnum(TeamRole),
})

/**
 * Type for team member response
 */
export type TeamMemberResponse = z.infer<typeof teamMemberResponseSchema>

/**
 * Schema defining the structure of a team member with team response
 */
export const teamMemberWithTeamResponseSchema = teamMemberResponseSchema.extend(
  {
    teamId: z.string(),
    teamName: z.string(),
  },
)

/**
 * Type for team member with team response
 */
export type TeamMemberWithTeamResponse = z.infer<
  typeof teamMemberWithTeamResponseSchema
>

/**
 * Schema defining the structure of a team invite response
 */
export const teamInviteResponseSchema = z.object({
  id: z.string(),
  teamId: z.string().nullable(),
  email: z.string(),
  code: z.string(),
  invitedBy: z.string(),
  role: z.nativeEnum(TeamRole),
  createdAt: z.date(),
  updatedAt: z.date(),
})

/**
 * Type for team invite response
 */
export type TeamInviteResponse = z.infer<typeof teamInviteResponseSchema>
