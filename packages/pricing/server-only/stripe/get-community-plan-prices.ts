import { STRIPE_PLAN_TYPE } from '@solomonai/lib/constants/billing'
import type Stripe from 'stripe'
import { getPricesByPlan } from './get-prices-by-plan'
import { z } from 'zod'

/**
 * Schema for validating community prices response
 */
const CommunityPricesSchema = z.array(z.custom<Stripe.Price>())

/**
 * Schema for validating community price IDs response
 */
const CommunityPriceIdsSchema = z.array(z.string())

/**
 * Retrieves all Stripe prices for the community plan
 *
 * @returns Promise resolving to an array of Stripe prices for the community plan
 * @throws {Stripe.errors.StripeError} If there's an error fetching the prices
 *
 * @example
 * ```ts
 * const prices = await getCommunityPlanPrices();
 * console.info(prices.map(p => p.id));
 * ```
 */
export const getCommunityPlanPrices = async () => {
  const prices = await getPricesByPlan(STRIPE_PLAN_TYPE.COMMUNITY)

  // Validate response
  CommunityPricesSchema.parse(prices)
  return prices
}

/**
 * Retrieves all Stripe price IDs for the community plan
 *
 * @returns Promise resolving to an array of Stripe price IDs for the community plan
 * @throws {Stripe.errors.StripeError} If there's an error fetching the prices
 *
 * @example
 * ```ts
 * const priceIds = await getCommunityPlanPriceIds();
 * console.info(priceIds); // ['price_123', 'price_456', ...]
 * ```
 */
export const getCommunityPlanPriceIds = async () => {
  const prices = await getCommunityPlanPrices()
  const priceIds = prices.map((price) => price.id)

  // Validate response
  CommunityPriceIdsSchema.parse(priceIds)
  return priceIds
}
