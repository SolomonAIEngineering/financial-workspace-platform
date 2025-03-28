import { TRPCError } from '@trpc/server'
import { checkoutSessionSchema } from '../schema'
import { prisma } from '@solomonai/prisma'
import { protectedProcedure } from '../../../middlewares/procedures'
import { stripe } from '@solomonai/lib/clients'

/**
 * Create a Stripe Checkout session for subscription
 * 
 * This procedure:
 * 1. Verifies the user is authenticated
 * 2. Gets or creates a Stripe customer for the user
 * 3. Creates a checkout session for the specified price
 * 
 * @input priceId - The Stripe Price ID for the subscription
 * @returns Object containing the checkout session URL
 * 
 * @throws {TRPCError} NOT_FOUND - If the user cannot be found
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error creating the session
 */
export const createCheckoutSession = protectedProcedure
  .input(checkoutSessionSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId
    const { priceId } = input

    // Get the user to see if they already have a Stripe customer ID
    const user = await prisma.user.findUnique({
      select: { email: true, name: true, stripeCustomerId: true },
      where: { id: userId },
    })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    // Base URL for redirects
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
      'http://localhost:3000'

    // Create or retrieve the Stripe customer
    let customerId = user.stripeCustomerId

    if (!customerId) {
      // Create a new customer if one doesn't exist
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          userId: userId,
        },
        name: user.name || undefined,
      })

      customerId = customer.id

      // Save the customer ID to the user
      await prisma.user.update({
        data: { stripeCustomerId: customerId },
        where: { id: userId },
      })
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      cancel_url: `${baseUrl}/api/stripe/return?status=canceled`,
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
      },
      mode: 'subscription',
      payment_method_types: ['card'],
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
      success_url: `${baseUrl}/api/stripe/return?status=success&session_id={CHECKOUT_SESSION_ID}`,
    })

    return { url: session.url }
  })
