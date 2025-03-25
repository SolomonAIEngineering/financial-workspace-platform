import { STRIPE_PLAN_TYPE } from '@solomonai/lib/constants/billing'
import type Stripe from 'stripe'
import { getPricesByPlan } from './get-prices-by-plan'
import { z } from 'zod'

/**
 * Schema for validating platform prices response
 */
const PlatformPricesSchema = z.array(z.custom<Stripe.Price>())

/**
 * Schema for validating platform price IDs response
 */
const PlatformPriceIdsSchema = z.array(z.string())

/**
 * Retrieves all Stripe prices for the platform plan
 *
 * @returns Promise resolving to an array of Stripe prices for the platform plan
 * @throws {Stripe.errors.StripeError} If there's an error fetching the prices
 *
 * @example
 * ```ts
 * const prices = await getPlatformPlanPrices();
 * console.info(prices.map(p => p.id));
 * ```
 */
export const getPlatformPlanPrices = async () => {
  const prices = await getPricesByPlan(STRIPE_PLAN_TYPE.PLATFORM)

  // Validate response
  PlatformPricesSchema.parse(prices)
  return prices
}

/**
 * Retrieves all Stripe price IDs for the platform plan
 *
 * @returns Promise resolving to an array of Stripe price IDs for the platform plan
 * @throws {Stripe.errors.StripeError} If there's an error fetching the prices
 *
 * @example
 * ```ts
 * const priceIds = await getPlatformPlanPriceIds();
 * console.info(priceIds); // ['price_123', 'price_456', ...]
 * ```
 */
export const getPlatformPlanPriceIds = async () => {
  const prices = await getPlatformPlanPrices()
  const priceIds = prices.map((price) => price.id)

  // Validate response
  PlatformPriceIdsSchema.parse(priceIds)
  return priceIds
}
