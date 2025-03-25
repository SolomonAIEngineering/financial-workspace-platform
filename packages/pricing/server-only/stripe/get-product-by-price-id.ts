import { stripe } from '@solomonai/lib/server-only/stripe'
import { z } from 'zod'

/**
 * Schema for validating get product by price ID options
 */
export const GetProductByPriceIdSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
})

/**
 * Type for get product by price ID options
 */
export type GetProductByPriceIdOptions = z.infer<
  typeof GetProductByPriceIdSchema
>

/**
 * Retrieves a Stripe product associated with a given price ID
 *
 * @param options - The options for retrieving the product
 * @param options.priceId - The ID of the price to get the product for
 *
 * @returns Promise resolving to the Stripe product
 * @throws {Error} If the product is not found or has been deleted
 * @throws {Stripe.errors.StripeError} If there's an error retrieving the price
 * @throws {ZodError} If the input validation fails
 *
 * @example
 * ```ts
 * const product = await getProductByPriceId({
 *   priceId: 'price_123'
 * });
 * console.info(product.name);
 * ```
 */
export const getProductByPriceId = async ({
  priceId,
}: GetProductByPriceIdOptions) => {
  // Validate input
  GetProductByPriceIdSchema.parse({ priceId })

  const { product } = await stripe.prices.retrieve(priceId, {
    expand: ['product'],
  })

  if (typeof product === 'string' || 'deleted' in product) {
    throw new Error('Product not found')
  }

  return product
}
