import { STRIPE_PLAN_TYPE } from '@solomonai/lib/constants/billing'
import type Stripe from 'stripe'
import { getPricesByPlan } from './get-prices-by-plan'
import { z } from 'zod'

/**
 * Schema for validating enterprise prices response
 */
const EnterprisePricesSchema = z.array(z.custom<Stripe.Price>())

/**
 * Schema for validating enterprise price IDs response
 */
const EnterprisePriceIdsSchema = z.array(z.string())

/**
 * Retrieves all Stripe prices for the enterprise plan
 *
 * @returns Promise resolving to an array of Stripe prices for the enterprise plan
 * @throws {Stripe.errors.StripeError} If there's an error fetching the prices
 *
 * @example
 * ```ts
 * const prices = await getEnterprisePlanPrices();
 * console.info(prices.map(p => p.id));
 * ```
 */
export const getEnterprisePlanPrices = async () => {
  const prices = await getPricesByPlan(STRIPE_PLAN_TYPE.ENTERPRISE)

  // Validate response
  EnterprisePricesSchema.parse(prices)
  return prices
}

/**
 * Retrieves all Stripe price IDs for the enterprise plan
 *
 * @returns Promise resolving to an array of Stripe price IDs for the enterprise plan
 * @throws {Stripe.errors.StripeError} If there's an error fetching the prices
 *
 * @example
 * ```ts
 * const priceIds = await getEnterprisePlanPriceIds();
 * console.info(priceIds); // ['price_123', 'price_456', ...]
 * ```
 */
export const getEnterprisePlanPriceIds = async () => {
  const prices = await getEnterprisePlanPrices()
  const priceIds = prices.map((price) => price.id)

  // Validate response
  EnterprisePriceIdsSchema.parse(priceIds)
  return priceIds
}
