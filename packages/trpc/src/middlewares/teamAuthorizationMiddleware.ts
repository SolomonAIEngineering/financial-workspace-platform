/**
 * @fileoverview Team Authorization Middleware System
 *
 * This module provides a robust system for handling team-based authorization in TRPC routes.
 * It includes middleware functions for verifying team ownership and membership, along with
 * utility functions for common authorization tasks.
 *
 * The middleware is designed to work with the TRPC router system and integrates with
 * procedures defined in procedures.ts.
 *
 * @module teamAuthorizationMiddleware
 * @see procedures.ts for predefined procedure configurations
 */

import { TeamRole, prisma } from '@solomonai/prisma'

import { TRPCError } from '@trpc/server'
import type { TrpcContext } from '../context'
import { t } from '../trpc'
import { z } from 'zod'

/**
 * Zod schema defining team membership information structure.
 *
 * @remarks
 * This schema defines the structure for team membership information that is added
 * to the TRPC context by the middleware. It includes the user's role in the team,
 * their user ID, and the team ID they're accessing.
 *
 * The schema is used for both validation and type generation to ensure
 * consistency between runtime validation and compile-time type checking.
 *
 * @example
 * ```typescript
 * // Example of valid team membership info
 * const membershipInfo: TeamMembershipInfo = {
 *   role: TeamRole.OWNER,
 *   userId: 'user-123',
 *   teamId: 'team-456'
 * };
 * ```
 */
export const teamMembershipInfoSchema = z.object({
  /** The user's role in the team (OWNER or MEMBER) */
  role: z.nativeEnum(TeamRole),
  /** The user's ID */
  userId: z.string(),
  /** The team ID being accessed */
  teamId: z.string(),
})

/**
 * Type representing team membership information, derived from its Zod schema.
 *
 * This type is used throughout the middleware system to maintain type safety
 * when working with team membership information.
 */
export type TeamMembershipInfo = z.infer<typeof teamMembershipInfoSchema>

/**
 * Verifies if a user is logged in and extracts their user ID.
 *
 * @remarks
 * This utility function is used by the team authorization middleware to ensure
 * that a user is authenticated before checking their team permissions. It extracts
 * the userId from the session context and throws an appropriate error if not found.
 *
 * @param ctx - The TRPC context object containing session information
 * @returns The authenticated user's ID
 * @throws {TRPCError} With code 'UNAUTHORIZED' if no user is logged in
 *
 * @example
 * ```typescript
 * const userId = verifyLoggedIn(ctx);
 * // Now use userId for further authorization checks
 * ```
 */
const verifyLoggedIn = (ctx: TrpcContext): string => {
  const userId = ctx.session?.userId
  if (!userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Login required',
    })
  }
  return userId
}

/**
 * Zod schema for validating input objects that contain a teamId.
 *
 * @remarks
 * This schema is used to validate input objects that contain a teamId property.
 * It ensures that the teamId is a non-empty string and provides helpful error
 * messages for validation failures.
 *
 * This schema can be reused in router input validations to maintain consistent
 * validation rules across the application.
 *
 * @example
 * ```typescript
 * // Using the schema in a router
 * export const myRouterProcedure = protectedProcedure
 *   .input(teamIdInputSchema)
 *   .mutation(async ({ input }) => {
 *     // input.teamId is guaranteed to be a valid string
 *   });
 * ```
 */
export const teamIdInputSchema = z.object({
  /**
   * The team ID to validate access against.
   * Must be a non-empty string.
   */
  teamId: z
    .string({
      required_error: 'Team ID is required',
      invalid_type_error: 'Team ID must be a string',
    })
    .min(1, 'Team ID cannot be empty'),
})

/**
 * Type representing input with a teamId property, derived from its Zod schema.
 *
 * This type is used in router procedures to ensure type safety when working
 * with inputs that contain a teamId.
 */
export type TeamIdInput = z.infer<typeof teamIdInputSchema>

/**
 * Extracts and validates a team ID from the input object using Zod schema validation.
 *
 * @remarks
 * This utility function extracts the teamId from the input object and validates it
 * using the teamIdInputSchema. It provides detailed error messages if validation fails.
 *
 * The function is designed to be used within middleware to ensure that the input
 * contains a valid teamId before proceeding with team authorization checks.
 *
 * @param input - The unknown input object to extract teamId from
 * @returns The validated team ID as a string
 * @throws {TRPCError} With code 'BAD_REQUEST' and validation details if teamId is invalid
 *
 * @example
 * ```typescript
 * try {
 *   const teamId = extractTeamId(input);
 *   // Use the validated teamId
 * } catch (error) {
 *   // Handle validation error
 * }
 * ```
 */
const extractTeamId = (input: unknown): string => {
  try {
    const { teamId } = teamIdInputSchema.parse(input)
    return teamId
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((err: z.ZodIssue) => err.message)
        .join(', ')
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: errorMessage,
        cause: error,
      })
    }
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid team ID',
    })
  }
}

/**
 * Retrieves and validates a user's membership in a team.
 *
 * @remarks
 * This utility function retrieves a user's membership record from the database
 * and verifies that they are a member of the specified team. It throws a
 * FORBIDDEN error if the user is not a member of the team.
 *
 * The function is used by the team authorization middleware to verify team
 * membership before checking specific roles.
 *
 * @param userId - The ID of the user to check membership for
 * @param teamId - The ID of the team to check membership in
 * @returns The team membership record from the database
 * @throws {TRPCError} With code 'FORBIDDEN' if the user is not a member of the team
 *
 * @example
 * ```typescript
 * const teamMembership = await getTeamMembership('user-123', 'team-456');
 * // Now check the user's role in the team
 * ```
 */
const getTeamMembership = async (userId: string, teamId: string) => {
  const teamMembership = await prisma.usersOnTeam.findFirst({
    where: {
      userId,
      teamId,
    },
  })

  if (!teamMembership) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not a member of this team',
    })
  }

  return teamMembership
}

/**
 * Retrieves and validates a team by ID.
 *
 * @remarks
 * This utility function retrieves a team record from the database and verifies
 * that it exists. It throws a NOT_FOUND error if the team is not found.
 *
 * The function is used by the team authorization middleware to ensure that the
 * team exists before checking specific roles.
 *
 * @param teamId - The ID of the team to retrieve
 * @returns The team record from the database
 * @throws {TRPCError} With code 'NOT_FOUND' if the team is not found
 *
 * @example
 * ```typescript
 * const team = await getTeam('team-456');
 * // Now check the user's role in the team
 * ```
 */
const getTeamById = async (teamId: string) => {
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
  })

  if (!team) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Team not found',
    })
  }

  return team
}

/**
 * Verifies that a user has the required role in a team.
 *
 * @remarks
 * This utility function checks if a user's team role matches the required role
 * and throws a FORBIDDEN error with an appropriate message if it doesn't.
 *
 * The error message is customized based on the required role to provide
 * clear feedback to the user about why their request was denied.
 *
 * @param teamMembership - The team membership record containing the user's role
 * @param requiredRole - The role required for the operation (OWNER or MEMBER)
 * @throws {TRPCError} With code 'FORBIDDEN' if the user doesn't have the required role
 *
 * @example
 * ```typescript
 * // Check if the user is a team owner
 * verifyRole(teamMembership, TeamRole.OWNER);
 * ```
 */
const verifyRole = (
  teamMembership: { role: TeamRole },
  requiredRole: TeamRole,
) => {
  if (teamMembership.role !== requiredRole) {
    const roleMessage =
      requiredRole === TeamRole.OWNER
        ? 'Only team owners can perform this action'
        : 'Only team members can perform this action'

    throw new TRPCError({
      code: 'FORBIDDEN',
      message: roleMessage,
    })
  }
}

/**
 * Creates an enhanced TRPC context with team membership information.
 *
 * @remarks
 * This utility function adds team membership information to the TRPC context,
 * making it available to route handlers that use the middleware.
 *
 * The enhanced context allows route handlers to access information about the
 * user's role in the team without having to query the database again.
 *
 * @param ctx - The original TRPC context
 * @param membershipInfo - The team membership information to add to the context
 * @returns The enhanced context with team membership information
 *
 * @example
 * ```typescript
 * const enhancedCtx = createEnhancedContext(ctx, {
 *   role: TeamRole.OWNER,
 *   userId: 'user-123',
 *   teamId: 'team-456'
 * });
 *
 * // Route handler can now access ctx.teamMembership
 * ```
 */
const createEnhancedContext = (
  ctx: TrpcContext,
  membershipInfo: TeamMembershipInfo,
) => {
  return {
    ...ctx,
    teamMembership: membershipInfo,
  }
}

/**
 * Middleware that verifies the user is a team owner.
 *
 * @remarks
 * This middleware checks if the authenticated user is an OWNER of the team specified in the input.
 * It enhances the context with team membership information if the check passes.
 *
 * The middleware performs the following checks in sequence:
 * 1. Verifies the user is logged in
 * 2. Extracts and validates the teamId from the input
 * 3. Verifies the user is a member of the team
 * 4. Verifies the user has the OWNER role in the team
 * 5. Enhances the context with team membership information
 *
 * @throws {TRPCError} With appropriate code and message if any check fails
 *
 * @example
 * ```typescript
 * // Using the middleware in a procedure
 * export const ownerOnlyProcedure = protectedProcedure
 *   .input(teamIdInputSchema)
 *   .use(isTeamOwner)
 *   .mutation(async ({ ctx, input }) => {
 *     // ctx.teamMembership contains the team membership info
 *     // and we're guaranteed the user is a team owner
 *   });
 * ```
 */
export const isTeamOwner = t.middleware(async ({ ctx, next, input }) => {
  const userId = verifyLoggedIn(ctx)
  const teamId = extractTeamId(input)
  const team = await getTeamById(teamId)
  const teamMembership = await getTeamMembership(userId, teamId)

  verifyRole(teamMembership, TeamRole.OWNER)

  const enhancedCtx = createEnhancedContext(ctx, {
    role: teamMembership.role,
    userId,
    teamId,
  })

  return next({ ctx: enhancedCtx })
})

/**
 * Middleware that verifies the user is a team member.
 *
 * @remarks
 * This middleware checks if the authenticated user is a MEMBER of the team specified in the input.
 * It enhances the context with team membership information if the check passes.
 *
 * The middleware performs the following checks in sequence:
 * 1. Verifies the user is logged in
 * 2. Extracts and validates the teamId from the input
 * 3. Verifies the user is a member of the team
 * 4. Verifies the user has the MEMBER role in the team
 * 5. Enhances the context with team membership information
 *
 * @throws {TRPCError} With appropriate code and message if any check fails
 *
 * @example
 * ```typescript
 * // Using the middleware in a procedure
 * export const memberOnlyProcedure = protectedProcedure
 *   .input(teamIdInputSchema)
 *   .use(isTeamMember)
 *   .mutation(async ({ ctx, input }) => {
 *     // ctx.teamMembership contains the team membership info
 *     // and we're guaranteed the user is a team member
 *   });
 * ```
 */
export const isTeamMember = t.middleware(async ({ ctx, next, input }) => {
  const userId = verifyLoggedIn(ctx)
  const teamId = extractTeamId(input)
  const teamMembership = await getTeamMembership(userId, teamId)

  verifyRole(teamMembership, TeamRole.MEMBER)

  const enhancedCtx = createEnhancedContext(ctx, {
    role: teamMembership.role,
    userId,
    teamId,
  })

  return next({ ctx: enhancedCtx })
})

/**
 * Middleware that verifies the user belongs to a team (any role).
 *
 * @remarks
 * This middleware checks if the authenticated user is a member of the team specified in the input,
 * regardless of their specific role. It enhances the context with team membership information
 * if the check passes.
 *
 * The middleware performs the following checks in sequence:
 * 1. Verifies the user is logged in
 * 2. Extracts and validates the teamId from the input
 * 3. Verifies the user is a member of the team
 * 4. Enhances the context with team membership information
 *
 * This middleware is useful for operations that should be accessible to any team member,
 * regardless of their specific role (OWNER or MEMBER).
 *
 * @throws {TRPCError} With appropriate code and message if any check fails
 *
 * @example
 * ```typescript
 * // Using the middleware in a procedure
 * export const teamAccessProcedure = protectedProcedure
 *   .input(teamIdInputSchema)
 *   .use(isTeamUser)
 *   .query(async ({ ctx, input }) => {
 *     // ctx.teamMembership contains the team membership info
 *     // and we're guaranteed the user belongs to the team
 *     console.log(`User role: ${ctx.teamMembership.role}`);
 *   });
 * ```
 */
export const isTeamUser = t.middleware(async ({ ctx, next, input }) => {
  const userId = verifyLoggedIn(ctx)
  const teamId = extractTeamId(input)
  const team = await getTeamById(teamId)
  const teamMembership = await getTeamMembership(userId, teamId)

  const enhancedCtx = createEnhancedContext(ctx, {
    role: teamMembership.role,
    userId,
    teamId,
  })

  return next({ ctx: enhancedCtx })
})
