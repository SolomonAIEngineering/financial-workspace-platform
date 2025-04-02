import { IS_BILLING_ENABLED } from '@solomonai/lib/constants/app'
import type { Subscription } from '@solomonai/prisma/client'
import { getPlatformPlanPriceIds } from '../stripe/get-platform-plan-prices'
import { prisma } from '@solomonai/prisma/server'
import { subscriptionsContainsActivePlan } from '@solomonai/lib/utils/billing'
import { z } from 'zod'

/**
 * Zod schema for validating platform plan check options
 *
 * @schema
 * @property {string} userId - The ID of the user to check
 * @property {string} [teamId] - Optional team ID to check team-wide subscriptions
 */
export const ZIsDocumentPlatformOptions = z.object({
  userId: z.string(),
  teamId: z.string().optional(),
})

export type IsDocumentPlatformOptions = z.infer<
  typeof ZIsDocumentPlatformOptions
>

/**
 * Checks if a user or team has platform-level access
 *
 * @async
 * @function isDocumentPlatform
 * @description
 * Determines whether a user or their team has platform-level access.
 * If billing is disabled, returns true by default.
 * If a teamId is provided, checks the team's subscriptions. Otherwise, checks
 * the user's personal subscriptions.
 *
 * @example
 * ```typescript
 * // Check user's personal platform access
 * const hasPlatformAccess = await isDocumentPlatform({ userId: '123' });
 *
 * // Check team platform access
 * const hasTeamPlatformAccess = await isDocumentPlatform({
 *   userId: '123',
 *   teamId: '456'
 * });
 * ```
 *
 * @param {IsDocumentPlatformOptions} options - Options for checking platform access
 * @param {string} options.userId - The ID of the user to check
 * @param {string} [options.teamId] - Optional team ID to check team-wide access
 * @returns {Promise<boolean>} True if the user/team has platform-level access
 */
export const isDocumentPlatform = async ({
  userId,
  teamId,
}: IsDocumentPlatformOptions): Promise<boolean> => {
  let subscriptions: Subscription[] = []

  if (!IS_BILLING_ENABLED()) {
    return true
  }

  if (teamId) {
    subscriptions = await prisma.team
      .findFirstOrThrow({
        where: {
          id: teamId,
        },
        select: {
          usersOnTeam: {
            where: {
              userId,
            },
            include: {
              user: {
                include: {
                  subscriptions: true,
                },
              },
            },
          },
        },
      })
      .then((team) =>
        team.usersOnTeam.map((user) => user.user.subscriptions).flat(),
      )
  } else {
    subscriptions = await prisma.user
      .findFirstOrThrow({
        where: {
          id: userId,
        },
        select: {
          subscriptions: true,
        },
      })
      .then((user) => user.subscriptions)
  }

  if (subscriptions.length === 0) {
    return false
  }

  const platformPlanPriceIds = await getPlatformPlanPriceIds()

  return subscriptionsContainsActivePlan(subscriptions, platformPlanPriceIds)
}
