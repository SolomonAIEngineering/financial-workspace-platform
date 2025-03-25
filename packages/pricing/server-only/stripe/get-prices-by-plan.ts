import { STRIPE_PLAN_TYPE } from '@solomonai/lib/constants/billing'
import { stripe } from '@solomonai/lib/server-only/stripe'
import { z } from 'zod'

type PlanType = (typeof STRIPE_PLAN_TYPE)[keyof typeof STRIPE_PLAN_TYPE]

/**
 * Schema for validating plan type
 */
const PlanTypeSchema = z.union([
  z.literal(STRIPE_PLAN_TYPE.COMMUNITY),
  z.literal(STRIPE_PLAN_TYPE.PLATFORM),
  z.literal(STRIPE_PLAN_TYPE.TEAM),
  z.literal(STRIPE_PLAN_TYPE.ENTERPRISE),
])

/**
 * Schema for validating plan parameter
 */
const PlanSchema = z.union([PlanTypeSchema, z.array(PlanTypeSchema)])

/**
 * Retrieves Stripe prices filtered by plan type(s)
 *
 * @param plan - Single plan type or array of plan types to filter prices by
 * @returns Promise resolving to an array of Stripe prices matching the plan type(s)
 * @throws {Stripe.errors.StripeError} If there's an error fetching the prices
 * @throws {ZodError} If the input validation fails
 *
 * @example
 * ```ts
 * // Get prices for a single plan
 * const communityPrices = await getPricesByPlan(STRIPE_PLAN_TYPE.COMMUNITY);
 *
 * // Get prices for multiple plans
 * const platformAndTeamPrices = await getPricesByPlan([
 *   STRIPE_PLAN_TYPE.PLATFORM,
 *   STRIPE_PLAN_TYPE.TEAM
 * ]);
 * ```
 */
export const getPricesByPlan = async (plan: PlanType | PlanType[]) => {
  // Validate input
  PlanSchema.parse(plan)

  const planTypes: string[] = typeof plan === 'string' ? [plan] : plan

  const prices = await stripe.prices.list({
    expand: ['data.product'],
    limit: 100,
  })

  return prices.data.filter(
    (price) =>
      price.type === 'recurring' && planTypes.includes(price.metadata.plan),
  )
}
