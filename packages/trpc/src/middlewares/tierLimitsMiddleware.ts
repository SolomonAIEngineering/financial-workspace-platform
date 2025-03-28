/**
 * @fileoverview Tier Limits Middleware
 *
 * This middleware enforces resource limits based on the user's subscription tier.
 * It integrates with the pricing package to get quota information and ensures
 * that users cannot exceed their plan limits.
 *
 * @module tierLimitsMiddleware
 */

import {
  ZLimitsSchema,
  type TLimitsResponseSchema,
  type TLimitsSchema,
} from '@solomonai/pricing/server-only/limits/schema'
import { getServerLimits } from '@solomonai/pricing/server-only/limits/server'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import type { TrpcContext } from '../context'
import { t } from '../trpc'

/**
 * Supported resource types that can be limited by the middleware
 */
export type LimitableResource = keyof TLimitsSchema

/**
 * Enum of all available resource types derived from the pricing package
 * This provides better autocomplete and type safety
 */
export const LimitableResourceEnum: Record<string, LimitableResource> = {
  // Resource types from pricing/limits package
  Documents: 'documents',
  Recipients: 'recipients',
  DirectTemplates: 'directTemplates',
  Teams: 'teams',
  TeamMembers: 'teamMembers',
  StorageGb: 'storageGb',
  Reports: 'reports',
  Invoices: 'invoices',
  BankAccounts: 'bankAccounts',
  Integrations: 'integrations',
  ApiRequestsPerDay: 'apiRequestsPerDay',
  MaxFileSizeMb: 'maxFileSizeMb',
  Apps: 'apps',
  TransactionHistoryDays: 'transactionHistoryDays',
  CustomCategories: 'customCategories',
  TrackerProjects: 'trackerProjects',
} as const

/**
 * Schema for tier limits middleware options
 */
export const tierLimitsOptionsSchema = z.object({
  /**
   * The type of resource being limited (e.g. 'teams', 'documents', etc.)
   */
  resource: z.enum(Object.values(LimitableResourceEnum) as [LimitableResource, ...LimitableResource[]]),

  /**
   * Custom error message when the limit is exceeded
   */
  errorMessage: z.string().optional(),

  /**
   * Custom function to get the current count of resources.
   * If not provided, the middleware will use the remaining value from the quota.
   */
  getCurrentCount: z
    .function()
    .args(
      z.object({
        ctx: z.custom<TrpcContext>(),
        limits: z.custom<TLimitsResponseSchema>(),
      }),
    )
    .returns(z.promise(z.number()))
    .optional(),

  /**
   * If true, will throw an error even for infinite limits.
   * Useful for testing or when you want to temporarily disable a feature.
   */
  enforceInfiniteLimits: z.boolean().default(false),
})

/**
 * Options for tier limits middleware
 * Making enforceInfiniteLimits optional in TypeScript since it has a default value in Zod
 */
export type TierLimitsOptions = Omit<
  z.infer<typeof tierLimitsOptionsSchema>,
  'enforceInfiniteLimits'
> & {
  enforceInfiniteLimits?: boolean
}

/**
 * Gets the quota and usage information for a user or team
 */
const getLimits = async (ctx: TrpcContext): Promise<TLimitsResponseSchema> => {
  if (!ctx.session?.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User not authenticated',
    })
  }

  const teamId = ctx.teamId?.toString() || null

  return getServerLimits({
    email: ctx.user?.email || null,
    teamId,
    userId: ctx.session.userId,
  })
}

/**
 * Creates a middleware that enforces tier-based limits for specific resources
 *
 * @example
 * ```typescript
 * // Check if user can create more teams
 * export const createTeam = protectedProcedure
 *   .use(
 *     tierLimitsMiddleware({
 *       resource: LimitableResourceEnum.Teams,
 *       errorMessage: 'You have reached the maximum number of teams for your plan',
 *     })
 *   )
 *   .mutation(async ({ ctx, input }) => {
 *     // Create team logic here
 *   });
 * ```
 */
export const tierLimitsMiddleware = (options: TierLimitsOptions) => {
  // Validate the options
  const validatedOptions = tierLimitsOptionsSchema.parse(options)

  return t.middleware(async ({ ctx, next }) => {
    // Get the user's limits from the pricing service
    const limits = await getLimits(ctx)

    // Get the current count, either from the provided function or from the limits
    let currentCount: number
    if (validatedOptions.getCurrentCount) {
      currentCount = await validatedOptions.getCurrentCount({ ctx, limits })
    } else {
      // If no custom count function is provided, use the quota and remaining values
      // Use type assertion to ensure TypeScript knows this is a valid resource key
      const resource = validatedOptions.resource as LimitableResource
      const quota = limits.quota[resource]
      const remaining = limits.remaining[resource]
      currentCount = quota - remaining
    }

    // Get the maximum allowed value for this resource
    // Use type assertion to ensure TypeScript knows this is a valid resource key
    const resource = validatedOptions.resource as LimitableResource
    const maxAllowed = limits.quota[resource]

    // Check if the user has reached their limit
    const isInfinite = maxAllowed === Infinity
    if (
      (isInfinite && !validatedOptions.enforceInfiniteLimits) ||
      currentCount < maxAllowed
    ) {
      // User has not reached their limit, allow the operation
      return next({
        ctx: {
          ...ctx,
          limits: {
            ...limits,
            currentCount,
            maxAllowed,
            resource: validatedOptions.resource,
          },
        },
      })
    }

    // User has reached their limit, throw an error
    const errorMessage =
      validatedOptions.errorMessage ||
      `You have reached the maximum limit of ${maxAllowed} ${validatedOptions.resource} for your current plan`

    throw new TRPCError({
      code: 'FORBIDDEN',
      message: errorMessage,
    })
  })
}

/**
 * Creates a middleware that automatically increments the count of a resource before checking limits
 * Useful for creation operations where you want to check if adding one more would exceed the limit
 */
export const tierLimitsIncrementMiddleware = (options: TierLimitsOptions) => {
  const validatedOptions = tierLimitsOptionsSchema.parse(options)

  return tierLimitsMiddleware({
    ...validatedOptions,
    getCurrentCount: async ({ ctx, limits }) => {
      if (validatedOptions.getCurrentCount) {
        const currentCount = await validatedOptions.getCurrentCount({
          ctx,
          limits,
        })
        return currentCount + 1 // Increment by one to simulate adding a new resource
      }

      // Calculate from quota and remaining if no custom count function
      // Use type assertion to ensure TypeScript knows this is a valid resource key
      const resource = validatedOptions.resource as LimitableResource
      const quota = limits.quota[resource]
      const remaining = limits.remaining[resource]
      return quota - remaining + 1 // Add one for the new resource being created
    },
  })
}
