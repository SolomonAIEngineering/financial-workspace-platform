import { stripe } from '@solomonai/lib/server-only/stripe'
import type Stripe from 'stripe'
import { z } from 'zod'

/**
 * Schema for validating subscription item quantity update options
 */
export const UpdateSubscriptionItemQuantitySchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  priceId: z.string().min(1, 'Price ID is required'),
})

/**
 * Type for subscription item quantity update options
 */
export type UpdateSubscriptionItemQuantityOptions = z.infer<
  typeof UpdateSubscriptionItemQuantitySchema
>

/**
 * Updates the quantity of a specific subscription item
 *
 * @param options - The options for updating the subscription item quantity
 * @param options.subscriptionId - The ID of the subscription to update
 * @param options.quantity - The new quantity to set for the subscription item
 * @param options.priceId - The ID of the price to update the quantity for
 *
 * @throws {Error} If the subscription does not contain the required item
 * @throws {Stripe.errors.StripeError} If there's an error updating the subscription
 *
 * @example
 * ```ts
 * await updateSubscriptionItemQuantity({
 *   subscriptionId: 'sub_123',
 *   quantity: 2,
 *   priceId: 'price_123'
 * });
 * ```
 */
export const updateSubscriptionItemQuantity = async ({
  subscriptionId,
  quantity,
  priceId,
}: UpdateSubscriptionItemQuantityOptions) => {
  // Validate input
  UpdateSubscriptionItemQuantitySchema.parse({
    subscriptionId,
    quantity,
    priceId,
  })

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  const items = subscription.items.data.filter(
    (item) => item.price.id === priceId,
  )

  if (items.length !== 1) {
    throw new Error('Subscription does not contain required item')
  }

  const hasYearlyItem = items.find(
    (item) => item.price.recurring?.interval === 'year',
  )
  const oldQuantity = items[0].quantity

  if (oldQuantity === quantity) {
    return
  }

  const subscriptionUpdatePayload: Stripe.SubscriptionUpdateParams = {
    items: items.map((item) => ({
      id: item.id,
      quantity,
    })),
  }

  // Only invoice immediately when changing the quantity of yearly item.
  if (hasYearlyItem) {
    subscriptionUpdatePayload.proration_behavior = 'always_invoice'
  }

  await stripe.subscriptions.update(subscriptionId, subscriptionUpdatePayload)
}
