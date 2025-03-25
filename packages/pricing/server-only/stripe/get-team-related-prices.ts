import { STRIPE_PLAN_TYPE } from '@solomonai/lib/constants/billing'
import { getPricesByPlan } from './get-prices-by-plan'
import { z } from 'zod'

/**
 * Schema for validating team-related plan types
 */
const TeamRelatedPlanTypesSchema = z.array(
  z.enum([
    STRIPE_PLAN_TYPE.COMMUNITY,
    STRIPE_PLAN_TYPE.PLATFORM,
    STRIPE_PLAN_TYPE.ENTERPRISE,
  ]),
)

/**
 * Returns the Stripe prices of items that affect the amount of teams a user can create.
 *
 * @returns Promise resolving to an array of Stripe prices
 * @throws {Stripe.errors.StripeError} If there's an error fetching the prices
 *
 * @example
 * ```ts
 * const prices = await getTeamRelatedPrices();
 * console.info(prices.map(p => p.id));
 * ```
 */
export const getTeamRelatedPrices = async () => {
  const planTypes = [
    STRIPE_PLAN_TYPE.COMMUNITY,
    STRIPE_PLAN_TYPE.PLATFORM,
    STRIPE_PLAN_TYPE.ENTERPRISE,
  ]

  // Validate plan types
  TeamRelatedPlanTypesSchema.parse(planTypes)

  return await getPricesByPlan(planTypes)
}

/**
 * Returns the Stripe price IDs of items that affect the amount of teams a user can create.
 *
 * @returns Promise resolving to an array of Stripe price IDs
 * @throws {Stripe.errors.StripeError} If there's an error fetching the prices
 *
 * @example
 * ```ts
 * const priceIds = await getTeamRelatedPriceIds();
 * console.info(priceIds); // ['price_123', 'price_456', ...]
 * ```
 */
export const getTeamRelatedPriceIds = async () => {
  return await getTeamRelatedPrices().then((prices) =>
    prices.map((price) => price.id),
  )
}
