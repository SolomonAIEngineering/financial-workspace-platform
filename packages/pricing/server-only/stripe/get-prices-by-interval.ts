import { STRIPE_PLAN_TYPE } from '@solomonai/lib/constants/billing'
import type Stripe from 'stripe'
import { stripe } from '@solomonai/lib/server-only/stripe'
import { z } from 'zod'

// Utility type to handle usage of the `expand` option.
type PriceWithProduct = Stripe.Price & { product: Stripe.Product }

/**
 * Schema for validating price intervals
 */
const PriceIntervalsSchema = z.record(z.array(z.custom<PriceWithProduct>()))

/**
 * Schema for validating get prices by interval options
 */
export const GetPricesByIntervalSchema = z.object({
  plans: z
    .array(
      z.enum([
        STRIPE_PLAN_TYPE.COMMUNITY,
        STRIPE_PLAN_TYPE.PLATFORM,
        STRIPE_PLAN_TYPE.TEAM,
        STRIPE_PLAN_TYPE.ENTERPRISE,
      ]),
    )
    .optional(),
})

/**
 * Type for price intervals
 */
export type PriceIntervals = z.infer<typeof PriceIntervalsSchema>

/**
 * Type for get prices by interval options
 */
export type GetPricesByIntervalOptions = z.infer<
  typeof GetPricesByIntervalSchema
>

/**
 * Type guard to check if a string is a valid plan type
 */
const isValidPlanType = (
  plan: string | undefined,
): plan is
  | typeof STRIPE_PLAN_TYPE.COMMUNITY
  | typeof STRIPE_PLAN_TYPE.PLATFORM
  | typeof STRIPE_PLAN_TYPE.TEAM
  | typeof STRIPE_PLAN_TYPE.ENTERPRISE => {
  return (
    plan !== undefined &&
    [
      STRIPE_PLAN_TYPE.COMMUNITY,
      STRIPE_PLAN_TYPE.PLATFORM,
      STRIPE_PLAN_TYPE.TEAM,
      STRIPE_PLAN_TYPE.ENTERPRISE,
    ].includes(plan as any)
  )
}

/**
 * Retrieves Stripe prices grouped by their billing interval
 *
 * @param options - Options for filtering prices
 * @param options.plans - Optional array of plan types to filter prices by
 * @returns Promise resolving to prices grouped by billing interval (day, week, month, year)
 * @throws {Stripe.errors.StripeError} If there's an error fetching the prices
 * @throws {ZodError} If the input validation fails
 *
 * @example
 * ```ts
 * // Get all prices
 * const allPrices = await getPricesByInterval();
 *
 * // Get prices for specific plans
 * const platformPrices = await getPricesByInterval({
 *   plans: [STRIPE_PLAN_TYPE.PLATFORM]
 * });
 *
 * // Access prices by interval
 * console.info(allPrices.monthly);
 * console.info(allPrices.yearly);
 * ```
 */
export const getPricesByInterval = async ({
  plans,
}: GetPricesByIntervalOptions = {}) => {
  // Validate input
  GetPricesByIntervalSchema.parse({ plans })

  let { data: prices } = await stripe.prices.search({
    query: `active:'true' type:'recurring'`,
    expand: ['data.product'],
    limit: 100,
  })

  prices = prices.filter((price) => {
    // We use `expand` to get the product, but it's not typed as part of the Price type.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const product = price.product as Stripe.Product

    const productPlan = product.metadata?.plan
    const filter =
      !plans || (isValidPlanType(productPlan) && plans.includes(productPlan))

    // Filter out prices for products that are not active.
    return product.active && filter
  })

  const intervals: PriceIntervals = {
    day: [],
    week: [],
    month: [],
    year: [],
  }

  // Add each price to the correct interval.
  for (const price of prices) {
    if (price.recurring?.interval) {
      // We use `expand` to get the product, but it's not typed as part of the Price type.
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      intervals[price.recurring.interval].push(price as PriceWithProduct)
    }
  }

  // Order all prices by unit_amount.
  intervals.day.sort((a, b) => Number(a.unit_amount) - Number(b.unit_amount))
  intervals.week.sort((a, b) => Number(a.unit_amount) - Number(b.unit_amount))
  intervals.month.sort((a, b) => Number(a.unit_amount) - Number(b.unit_amount))
  intervals.year.sort((a, b) => Number(a.unit_amount) - Number(b.unit_amount))

  // Validate response
  PriceIntervalsSchema.parse(intervals)
  return intervals
}
