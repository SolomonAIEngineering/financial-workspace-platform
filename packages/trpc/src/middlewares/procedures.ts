import { isTeamMember, isTeamOwner, isTeamUser } from './teamAuthorizationMiddleware';
import { tierLimitsMiddleware, tierLimitsIncrementMiddleware, type TierLimitsOptions } from './tierLimitsMiddleware';

import { CookieNames } from '@solomonai/lib/storage/cookies';
import { UserRole } from '@solomonai/prisma';
import { authorizationMiddleware } from './authorizationMiddleware';
import { devMiddleware } from './devMiddleware';
import { loggedInMiddleware } from './loggedInMiddleware';
import { ratelimitMiddleware } from './ratelimitMiddleware';
import { t } from '../trpc';

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees `ctx.session.user` is
 * not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(async (opts) => {
    const result = await opts.next();

    if (!result.ok) {
      console.error(`Non-OK ${opts.type}:`, opts.path);
    }

    return result;
  })
  .use(loggedInMiddleware)
  .use(ratelimitMiddleware())
  .use(devMiddleware(CookieNames.devWait));

export const adminProcedure = t.procedure
  .use(loggedInMiddleware)
  .use(authorizationMiddleware({ role: UserRole.ADMIN }))
  .use(ratelimitMiddleware());

export const superAdminProcedure = t.procedure
  .use(loggedInMiddleware)
  .use(authorizationMiddleware({ role: UserRole.SUPERADMIN }))
  .use(ratelimitMiddleware());

/**
 * Team owner procedure
 * 
 * Use this when an operation should ONLY be performed by team owners.
 * The teamId must be provided in the input as 'teamId'.
 * 
 * @see teamAuthorizationMiddleware for configuration options
 */
export const teamOwnerProcedure = t.procedure
  .use(loggedInMiddleware)
  .use(isTeamOwner)
  .use(ratelimitMiddleware());

/**
 * Team member procedure
 * 
 * Use this when an operation should ONLY be performed by team members.
 * The teamId must be provided in the input as 'teamId'.
 * 
 * @see teamAuthorizationMiddleware for configuration options
 */
export const teamMemberProcedure = t.procedure
  .use(loggedInMiddleware)
  .use(isTeamMember)
  .use(ratelimitMiddleware());

/**
 * Team access procedure
 * 
 * Use this when an operation can be performed by any team member or owner.
 * The teamId must be provided in the input as 'teamId'.
 * 
 * @see teamAuthorizationMiddleware for configuration options
 */
export const teamAccessProcedure = t.procedure
  .use(loggedInMiddleware)
  .use(isTeamUser)
  .use(ratelimitMiddleware());

/**
 * Procedure that enforces tier-based limits for specific resources
 * 
 * @example
 * ```typescript
 * // Check if user can create more invoices
 * export const createInvoice = limitedProcedure({
 *   resource: 'invoices',
 *   errorMessage: 'You have reached your plan limit for invoices',
 * })
 * .input(invoiceSchema)
 * .mutation(async ({ ctx, input }) => {
 *   // Create invoice logic
 * });
 * ```
 */
export const limitedProcedure = (options: TierLimitsOptions) => t.procedure
  .use(loggedInMiddleware)
  .use(tierLimitsMiddleware(options))
  .use(ratelimitMiddleware());

/**
 * Procedure that enforces team-based tier limits for specific resources
 * 
 * @example
 * ```typescript
 * // Check if team can add more members
 * export const addTeamMember = teamLimitedProcedure({
 *   resource: 'teamMembers',
 *   errorMessage: 'Your team has reached the maximum number of members for your plan',
 * })
 * .input(teamMemberSchema)
 * .mutation(async ({ ctx, input }) => {
 *   // Add team member logic
 * });
 * ```
 */
export const teamLimitedProcedure = (options: TierLimitsOptions) => t.procedure
  .use(loggedInMiddleware)
  .use(isTeamUser)
  .use(tierLimitsMiddleware(options))
  .use(ratelimitMiddleware());

/**
 * Procedure that enforces team owner privileges and tier limits
 * 
 * @example
 * ```typescript
 * // Check if team owner can create more custom categories
 * export const createCustomCategory = teamOwnerLimitedProcedure({
 *   resource: 'customCategories',
 *   errorMessage: 'Your team has reached the maximum number of custom categories for your plan',
 * })
 * .input(categorySchema)
 * .mutation(async ({ ctx, input }) => {
 *   // Create category logic
 * });
 * ```
 */
export const teamOwnerLimitedProcedure = (options: TierLimitsOptions) => t.procedure
  .use(loggedInMiddleware)
  .use(isTeamOwner)
  .use(tierLimitsMiddleware(options))
  .use(ratelimitMiddleware());

/**
 * Procedure for resource creation that checks if adding one more would exceed limits
 * 
 * @example
 * ```typescript
 * // Check if user can create one more document
 * export const createDocument = resourceProcedure({
 *   resource: 'documents',
 *   errorMessage: 'You have reached the maximum number of documents for your plan',
 * })
 * .input(documentSchema)
 * .mutation(async ({ ctx, input }) => {
 *   // Create document logic
 * });
 * ```
 */
export const resourceProcedure = (options: TierLimitsOptions) => t.procedure
  .use(loggedInMiddleware)
  .use(tierLimitsIncrementMiddleware(options))
  .use(ratelimitMiddleware());

/**
 * Team-based procedure for resource creation that checks if adding one more would exceed limits
 * 
 * @example
 * ```typescript
 * // Check if team can create one more project
 * export const createProject = teamResourceProcedure({
 *   resource: 'projects',
 *   errorMessage: 'Your team has reached the maximum number of projects for your plan',
 * })
 * .input(projectSchema)
 * .mutation(async ({ ctx, input }) => {
 *   // Create project logic
 * });
 * ```
 */
export const teamResourceProcedure = (options: TierLimitsOptions) => t.procedure
  .use(loggedInMiddleware)
  .use(isTeamUser)
  .use(tierLimitsIncrementMiddleware(options))
  .use(ratelimitMiddleware());
