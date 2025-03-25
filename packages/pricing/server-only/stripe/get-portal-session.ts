'use server'

import { stripe } from '@solomonai/lib/server-only/stripe'
import { z } from 'zod'

/**
 * Schema for validating portal session options
 */
export const GetPortalSessionSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  returnUrl: z.string().url('Invalid return URL').optional(),
})

/**
 * Type for portal session options
 */
export type GetPortalSessionOptions = z.infer<typeof GetPortalSessionSchema>

/**
 * Creates a Stripe Customer Portal session
 *
 * @param options - Options for creating the portal session
 * @param options.customerId - The ID of the customer to create the portal session for
 * @param options.returnUrl - Optional URL to redirect to after the customer portal session ends
 * @returns Promise resolving to the portal session URL
 * @throws {Stripe.errors.StripeError} If there's an error creating the portal session
 * @throws {ZodError} If the input validation fails
 *
 * @example
 * ```ts
 * const portalUrl = await getPortalSession({
 *   customerId: 'cus_123',
 *   returnUrl: 'https://example.com/account'
 * });
 * ```
 */
export const getPortalSession = async ({
  customerId,
  returnUrl,
}: GetPortalSessionOptions) => {
  'use server'

  // Validate input
  GetPortalSessionSchema.parse({ customerId, returnUrl })

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session.url
}
