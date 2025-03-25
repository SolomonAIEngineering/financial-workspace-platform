'use server'

import { stripe } from '@solomonai/lib/server-only/stripe'
import type Stripe from 'stripe'
import { z } from 'zod'

/**
 * Schema for validating checkout session options
 */
export const GetCheckoutSessionSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  priceId: z.string().min(1, 'Price ID is required'),
  returnUrl: z.string().url('Return URL must be a valid URL'),
  subscriptionMetadata: z.record(z.string()).optional(),
})

/**
 * Type for checkout session options
 */
export type GetCheckoutSessionOptions = z.infer<typeof GetCheckoutSessionSchema>

/**
 * Creates a Stripe checkout session for subscription creation
 *
 * @param options - Options for creating the checkout session
 * @param options.customerId - The ID of the customer to create the session for
 * @param options.priceId - The ID of the price to subscribe to
 * @param options.returnUrl - The URL to redirect to after checkout completion
 * @param options.subscriptionMetadata - Optional metadata to attach to the subscription
 * @returns Promise resolving to the checkout session URL
 * @throws {Stripe.errors.StripeError} If there's an error creating the session
 * @throws {ZodError} If the input validation fails
 *
 * @example
 * ```ts
 * const sessionUrl = await getCheckoutSession({
 *   customerId: 'cus_123',
 *   priceId: 'price_123',
 *   returnUrl: 'https://example.com/success',
 *   subscriptionMetadata: { plan: 'premium' }
 * });
 * ```
 */
export const getCheckoutSession = async ({
  customerId,
  priceId,
  returnUrl,
  subscriptionMetadata,
}: GetCheckoutSessionOptions) => {
  'use server'

  // Validate input
  GetCheckoutSessionSchema.parse({
    customerId,
    priceId,
    returnUrl,
    subscriptionMetadata,
  })

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${returnUrl}?success=true`,
    cancel_url: `${returnUrl}?canceled=true`,
    subscription_data: {
      metadata: subscriptionMetadata,
    },
  })

  return session.url
}
