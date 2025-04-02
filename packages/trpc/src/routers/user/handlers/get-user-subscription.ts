import type Stripe from 'stripe'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { stripe } from '@solomonai/lib/clients'

/**
 * Get a user's subscription details from Stripe
 * 
 * This procedure:
 * 1. Verifies the user is authenticated
 * 2. Checks if the user has a Stripe customer ID
 * 3. Retrieves active subscriptions from Stripe
 * 4. Returns formatted subscription details
 * 
 * @returns Subscription details including plan, status, and renewal information
 */
export const getUserSubscription = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.session?.userId

  // Get the user's Stripe customer ID
  const user = await prisma.user.findUnique({
    select: { stripeCustomerId: true },
    where: { id: userId },
  })

  if (!user?.stripeCustomerId) {
    // No subscription found, return null values
    return {
      id: null,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
      plan: null,
      status: null,
    }
  }

  try {
    // Get all subscriptions for this customer
    // Use simpler expand pattern to avoid Stripe API limitations
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      expand: ['data.default_payment_method'],
      status: 'all',
    })

    // First try to find an active subscription
    let subscription = subscriptions.data.find(
      (sub) => sub.status === 'active',
    )

    // If no active subscription, check for canceled subscription that's still in period
    if (!subscription) {
      subscription = subscriptions.data.find(
        (sub) =>
          sub.status === 'canceled' &&
          sub.current_period_end * 1000 > Date.now(),
      )
    }
    // If still no subscription, get the most recent one
    if (!subscription && subscriptions.data.length > 0) {
      subscription = subscriptions.data[0]
    }
    if (!subscription) {
      // No subscription found, return null values
      return {
        id: null,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
        plan: null,
        status: null,
      }
    }

    // Get the price and product details in separate calls to avoid deep nesting
    const priceId = subscription.items.data[0].price.id

    // Get price with expanded product
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product'],
    })

    const product = price.product as Stripe.Product

    // Return formatted subscription details
    return {
      id: subscription.id,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      plan: {
        id: priceId,
        amount: price.unit_amount,
        interval: price.recurring?.interval || 'month',
        name: product.name,
      },
      status: subscription.status,
    }
  } catch (error) {
    console.error('Error retrieving subscription:', error)

    // Return null values if there's an error
    return {
      id: null,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
      plan: null,
      status: null,
    }
  }
})
