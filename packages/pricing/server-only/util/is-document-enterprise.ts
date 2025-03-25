import { IS_BILLING_ENABLED } from '@solomonai/lib/constants/app'
import { subscriptionsContainsActivePlan } from '@solomonai/lib/utils/billing'
import { prisma } from '@solomonai/prisma'
import type { Subscription } from '@solomonai/prisma/client'
import { z } from 'zod'
import { getEnterprisePlanPriceIds } from '../stripe/get-enterprise-plan-prices'

/**
 * Zod schema for validating enterprise plan check options
 *
 * @schema
 * @property {string} userId - The ID of the user to check
 * @property {string} [teamId] - Optional team ID to check team-wide subscriptions
 */
export const ZIsDocumentEnterpriseOptions = z.object({
  userId: z.string(),
  teamId: z.string().optional(),
})

export type IsDocumentEnterpriseOptions = z.infer<
  typeof ZIsDocumentEnterpriseOptions
>

/**
 * Checks if a user or team has enterprise-level access
 *
 * @async
 * @function isDocumentEnterprise
 * @description
 * Determines whether a user or their team has enterprise-level access.
 * If billing is disabled, returns true by default.
 * If a teamId is provided, checks the team's subscriptions. Otherwise, checks
 * the user's personal subscriptions.
 *
 * @example
 * ```typescript
 * // Check user's personal enterprise access
 * const hasEnterpriseAccess = await isDocumentEnterprise({ userId: '123' });
 *
 * // Check team enterprise access
 * const hasTeamEnterpriseAccess = await isDocumentEnterprise({
 *   userId: '123',
 *   teamId: '456'
 * });
 * ```
 *
 * @param {IsDocumentEnterpriseOptions} options - Options for checking enterprise access
 * @param {string} options.userId - The ID of the user to check
 * @param {string} [options.teamId] - Optional team ID to check team-wide access
 * @returns {Promise<boolean>} True if the user/team has enterprise-level access
 */
export const isDocumentEnterprise = async ({
  userId,
  teamId,
}: IsDocumentEnterpriseOptions): Promise<boolean> => {
  let subscriptions: Subscription[] = []

  if (!IS_BILLING_ENABLED()) {
    return false
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

  const enterprisePlanPriceIds = await getEnterprisePlanPriceIds()

  return subscriptionsContainsActivePlan(
    subscriptions,
    enterprisePlanPriceIds,
    true,
  )
}
