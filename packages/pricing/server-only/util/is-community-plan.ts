import type { Subscription } from '@solomonai/prisma'
import { getCommunityPlanPriceIds } from '../stripe/get-community-plan-prices'
import { prisma } from '@solomonai/prisma/server'
import { subscriptionsContainsActivePlan } from '@solomonai/lib/utils/billing'
import { z } from 'zod'

/**
 * Zod schema for validating community plan check options
 *
 * @schema
 * @property {string} userId - The ID of the user to check
 * @property {string} [teamId] - Optional team ID to check team-wide subscriptions
 */
export const ZIsCommunityPlanOptions = z.object({
  userId: z.string(),
  teamId: z.string().optional(),
})

export type IsCommunityPlanOptions = z.infer<typeof ZIsCommunityPlanOptions>

/**
 * Checks if a user or team is on the community plan
 *
 * @async
 * @function isCommunityPlan
 * @description
 * Determines whether a user or their team has an active community plan subscription.
 * If a teamId is provided, it checks the team's subscriptions. Otherwise, it checks
 * the user's personal subscriptions.
 *
 * @example
 * ```typescript
 * // Check user's personal subscription
 * const isUserOnCommunity = await isCommunityPlan({ userId: '123' });
 *
 * // Check team subscription
 * const isTeamOnCommunity = await isCommunityPlan({
 *   userId: '123',
 *   teamId: '456'
 * });
 * ```
 *
 * @param {IsCommunityPlanOptions} options - Options for checking community plan status
 * @param {string} options.userId - The ID of the user to check
 * @param {string} [options.teamId] - Optional team ID to check team-wide subscriptions
 * @returns {Promise<boolean>} True if the user/team has an active community plan
 */
export const isCommunityPlan = async ({
  userId,
  teamId,
}: IsCommunityPlanOptions): Promise<boolean> => {
  let subscriptions: Subscription[] = []

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

  const communityPlanPriceIds = await getCommunityPlanPriceIds()

  return subscriptionsContainsActivePlan(subscriptions, communityPlanPriceIds)
}
