import type {
  App,
  BankAccount,
  Invoice,
  Report,
  Subscription,
  Team,
  TrackerProject,
  UsersOnTeam,
} from '@solomonai/prisma'
import {
  FREE_PLAN_LIMITS,
  SELFHOSTED_PLAN_LIMITS,
  TEAM_PLAN_LIMITS,
} from './constants.js'

import { DateTime } from 'luxon'
import { ERROR_CODES } from './errors.js'
import { IS_BILLING_ENABLED } from '@solomonai/lib/constants/app'
import { SubscriptionStatus } from '@solomonai/prisma/kysely/types.js'
import type { TLimitsResponseSchema } from './schema.js'
import { ZLimitsSchema } from './schema.js'
import { getDocumentRelatedPrices } from '../stripe/get-document-related-prices.ts.js'
import { prisma } from '@solomonai/prisma'
import { z } from 'zod'

/**
 * Zod schema for validating server limits options
 */
export const ZGetServerLimitsOptions = z.object({
  email: z.string().nullable(),
  teamId: z.string().nullable(),
  userId: z.string().nullable(),
})

export type GetServerLimitsOptions = z.infer<typeof ZGetServerLimitsOptions>

/**
 * Zod schema for validating user limits options
 */
const ZHandleUserLimitsOptions = z.object({
  email: z.string(),
  userId: z.string(),
})

type HandleUserLimitsOptions = z.infer<typeof ZHandleUserLimitsOptions>

/**
 * Zod schema for validating team limits options
 */
const ZHandleTeamLimitsOptions = z.object({
  email: z.string(),
  teamId: z.string().nullable(),
  userId: z.string(),
})

type HandleTeamLimitsOptions = z.infer<typeof ZHandleTeamLimitsOptions>

/**
 * Gets the server-side limits for a user or team
 *
 * @param {GetServerLimitsOptions} options - The options for getting server limits
 * @param {string | null} options.email - The user's email
 * @param {string | null} options.teamId - The team ID (optional)
 * @param {string | null} options.userId - The user ID
 * @returns {Promise<TLimitsResponseSchema>} The limits response containing quota and remaining values
 * @throws {Error} If billing is enabled but required parameters are missing
 */
export const getServerLimits = async ({
  email,
  teamId,
  userId,
}: GetServerLimitsOptions): Promise<TLimitsResponseSchema> => {
  if (!IS_BILLING_ENABLED()) {
    return {
      quota: SELFHOSTED_PLAN_LIMITS,
      remaining: SELFHOSTED_PLAN_LIMITS,
    }
  }

  if (!userId) {
    throw new Error(ERROR_CODES.INVALID_USER_ID)
  }

  if (!email) {
    throw new Error(ERROR_CODES.UNAUTHORIZED)
  }

  return teamId
    ? handleTeamLimits({ email, teamId, userId })
    : handleUserLimits({ email, userId })
}

/**
 * Fetches a user with their subscriptions
 *
 * @param {HandleUserLimitsOptions} options - The options for fetching the user
 * @returns {Promise<User>} The user with their subscriptions
 * @throws {Error} If the user is not found
 */
const fetchUserWithSubscriptions = async ({
  email,
  userId,
}: HandleUserLimitsOptions) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      email,
    },
    include: {
      subscriptions: true,
    },
  })

  if (!user) {
    throw new Error(ERROR_CODES.USER_FETCH_FAILED)
  }

  return user
}

/**
 * Gets the highest quota from active subscriptions
 *
 * @param {Subscription[]} subscriptions - The user's subscriptions
 * @returns {Promise<{ quota: TLimitsSchema; remaining: TLimitsSchema }>} The highest quota and remaining values
 */
const getHighestQuotaFromSubscriptions = async (
  subscriptions: Subscription[],
) => {
  let quota = structuredClone(FREE_PLAN_LIMITS)
  let remaining = structuredClone(FREE_PLAN_LIMITS)

  const activeSubscriptions = subscriptions.filter(
    ({ status }) => status === SubscriptionStatus.ACTIVE,
  )

  if (activeSubscriptions.length > 0) {
    const documentPlanPrices = await getDocumentRelatedPrices()

    for (const subscription of activeSubscriptions) {
      const price = documentPlanPrices.find(
        (price) => price.id === subscription.priceId,
      )

      if (
        !price ||
        typeof price.product === 'string' ||
        price.product.deleted
      ) {
        continue
      }

      const currentQuota = ZLimitsSchema.parse(
        'metadata' in price.product ? price.product.metadata : {},
      )

      if (
        currentQuota.documents > quota.documents &&
        currentQuota.recipients > quota.recipients
      ) {
        quota = currentQuota
        remaining = structuredClone(quota)
      }
    }

    remaining.directTemplates = Infinity
  }

  return { quota, remaining }
}

/**
 * Gets document counts for a user
 *
 * @param {string} userId - The user ID
 * @returns {Promise<{ documents: number; directTemplates: number }>} The document counts
 */
const getUserDocumentCounts = async (userId: string) => {
  const [documents, directTemplates] = await Promise.all([
    prisma.document.count({
      where: {
        userId,
        createdAt: {
          gte: DateTime.utc().startOf('month').toJSDate(),
        },
        isTemplate: false,
      },
    }),
    prisma.document.count({
      where: {
        userId,
        isTemplate: true,
        isPublished: true,
      },
    }),
  ])

  return { documents, directTemplates }
}

/**
 * Handles limits for individual users
 *
 * @param {HandleUserLimitsOptions} options - The options for handling user limits
 * @returns {Promise<TLimitsResponseSchema>} The limits response
 */
const handleUserLimits = async ({ email, userId }: HandleUserLimitsOptions) => {
  const user = await fetchUserWithSubscriptions({ email, userId })
  const { quota, remaining } = await getHighestQuotaFromSubscriptions(
    user.subscriptions,
  )
  const { documents, directTemplates } = await getUserDocumentCounts(user.id)

  remaining.documents = Math.max(remaining.documents - documents, 0)
  remaining.directTemplates = Math.max(
    remaining.directTemplates - directTemplates,
    0,
  )

  return { quota, remaining }
}

/**
 * Fetches a team with its related data
 *
 * @param {HandleTeamLimitsOptions} options - The options for fetching the team
 * @returns {Promise<Team>} The team with its related data
 * @throws {Error} If the team is not found
 */
const fetchTeamWithData = async ({
  email,
  teamId,
  userId,
}: HandleTeamLimitsOptions) => {
  if (!teamId) {
    throw new Error(ERROR_CODES.INVALID_TEAM_ID)
  }

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      usersOnTeam: {
        some: {
          userId,
        },
      },
    },
    include: {
      subscription: true,
      usersOnTeam: {
        include: {
          user: true,
        },
      },
      reports: true,
      invoices: true,
      bankAccounts: true,
      apps: true,
      trackerProjects: true,
    },
  })

  if (!team) {
    throw new Error(ERROR_CODES.USER_FETCH_FAILED)
  }

  return team
}

/**
 * Gets document counts for all users in a team
 *
 * @param {string[]} userIds - Array of user IDs
 * @returns {Promise<{ documents: number; directTemplates: number }>} The document counts
 */
const getTeamDocumentCounts = async (userIds: string[]) => {
  const [documents, directTemplates] = await Promise.all([
    prisma.document.count({
      where: {
        userId: {
          in: userIds,
        },
        createdAt: {
          gte: DateTime.utc().startOf('month').toJSDate(),
        },
        isTemplate: false,
      },
    }),
    prisma.document.count({
      where: {
        userId: {
          in: userIds,
        },
        isTemplate: true,
        isPublished: true,
      },
    }),
  ])

  return { documents, directTemplates }
}

/**
 * Calculates remaining quotas for a team
 *
 * @param {Team & {
 *   subscription: Subscription | null;
 *   usersOnTeam: UsersOnTeam[];
 *   reports: Report[];
 *   invoices: Invoice[];
 *   bankAccounts: BankAccount[];
 *   apps: App[];
 *   trackerProjects: TrackerProject[];
 * }} team - The team with its related data
 * @returns {TLimitsResponseSchema} The limits response
 */
const calculateTeamQuotas = async (
  team: Team & {
    subscription: Subscription | null
    usersOnTeam: UsersOnTeam[]
    reports: Report[]
    invoices: Invoice[]
    bankAccounts: BankAccount[]
    apps: App[]
    trackerProjects: TrackerProject[]
  },
) => {
  const { subscription } = team

  if (subscription && subscription.status === SubscriptionStatus.INACTIVE) {
    return {
      quota: ZLimitsSchema.parse({}),
      remaining: ZLimitsSchema.parse({}),
    }
  }

  const quota = structuredClone(TEAM_PLAN_LIMITS)
  const remaining = structuredClone(TEAM_PLAN_LIMITS)

  // Calculate remaining quotas
  remaining.teamMembers = Math.max(
    quota.teamMembers - team.usersOnTeam.length,
    0,
  )
  remaining.reports = Math.max(quota.reports - team.reports.length, 0)
  remaining.invoices = Math.max(quota.invoices - team.invoices.length, 0)
  remaining.bankAccounts = Math.max(
    quota.bankAccounts - team.bankAccounts.length,
    0,
  )
  remaining.apps = Math.max(quota.apps - team.apps.length, 0)
  remaining.trackerProjects = Math.max(
    quota.trackerProjects - team.trackerProjects.length,
    0,
  )

  const { documents, directTemplates } = await getTeamDocumentCounts(
    team.usersOnTeam.map((u: UsersOnTeam) => u.userId),
  )

  remaining.documents = Math.max(quota.documents - documents, 0)
  remaining.directTemplates = Math.max(
    quota.directTemplates - directTemplates,
    0,
  )

  return { quota, remaining }
}

/**
 * Handles limits for teams
 *
 * @param {HandleTeamLimitsOptions} options - The options for handling team limits
 * @returns {Promise<TLimitsResponseSchema>} The limits response
 */
const handleTeamLimits = async ({
  email,
  teamId,
  userId,
}: HandleTeamLimitsOptions) => {
  const team = await fetchTeamWithData({ email, teamId, userId })
  return calculateTeamQuotas(team)
}
