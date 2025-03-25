import { AppError } from '@solomonai/lib/errors/app-error'
import { STRIPE_PLAN_TYPE } from '@solomonai/lib/constants/billing'
import type Stripe from 'stripe'
import { getPricesByPlan } from './get-prices-by-plan'
import { z } from 'zod'

/**
 * Schema for validating price data
 */
const PriceDataSchema = z.object({
  priceId: z.string(),
  description: z.string(),
  features: z.array(z.object({ name: z.string() })),
})

/**
 * Schema for validating team prices response
 */
const TeamPricesSchema = z.object({
  monthly: z.object({
    friendlyInterval: z.literal('Monthly'),
    interval: z.literal('monthly'),
    priceId: z.string(),
    description: z.string(),
    features: z.array(z.object({ name: z.string() })),
  }),
  yearly: z.object({
    friendlyInterval: z.literal('Yearly'),
    interval: z.literal('yearly'),
    priceId: z.string(),
    description: z.string(),
    features: z.array(z.object({ name: z.string() })),
  }),
  priceIds: z.array(z.string()),
})

/**
 * Type for team prices response
 */
export type TeamPrices = z.infer<typeof TeamPricesSchema>

/**
 * Retrieves and formats team-related prices from Stripe
 *
 * @returns Promise resolving to formatted team prices including monthly and yearly options
 * @throws {AppError} If monthly or yearly prices are missing
 * @throws {Stripe.errors.StripeError} If there's an error fetching the prices
 *
 * @example
 * ```ts
 * const teamPrices = await getTeamPrices();
 * console.info(teamPrices.monthly.priceId);
 * console.info(teamPrices.yearly.priceId);
 * ```
 */
export const getTeamPrices = async (): Promise<TeamPrices> => {
  const prices = (await getPricesByPlan(STRIPE_PLAN_TYPE.TEAM)).filter(
    (price) => price.active,
  )

  const monthlyPrice = prices.find(
    (price) => price.recurring?.interval === 'month',
  )
  const yearlyPrice = prices.find(
    (price) => price.recurring?.interval === 'year',
  )
  const priceIds = prices.map((price) => price.id)

  if (!monthlyPrice || !yearlyPrice) {
    throw new AppError('INVALID_CONFIG', {
      message: 'Missing monthly or yearly price',
    })
  }

  const result = {
    monthly: {
      friendlyInterval: 'Monthly',
      interval: 'monthly',
      ...extractPriceData(monthlyPrice),
    },
    yearly: {
      friendlyInterval: 'Yearly',
      interval: 'yearly',
      ...extractPriceData(yearlyPrice),
    },
    priceIds,
  } as const

  // Validate response
  TeamPricesSchema.parse(result)
  return result
}

/**
 * Extracts relevant data from a Stripe price object
 *
 * @param price - The Stripe price object to extract data from
 * @returns Object containing price ID, description, and features
 */
const extractPriceData = (price: Stripe.Price) => {
  const product =
    typeof price.product !== 'string' && !price.product.deleted
      ? price.product
      : null

  const result = {
    priceId: price.id,
    description: product?.description ?? '',
    features: product?.features ?? [],
  }

  // Validate extracted data
  PriceDataSchema.parse(result)
  return result
}
