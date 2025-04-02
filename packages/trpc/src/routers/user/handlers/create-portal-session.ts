import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { stripe } from '@solomonai/lib/clients'

/**
 * Create a Stripe Customer Portal session for managing subscriptions
 * 
 * This procedure:
 * 1. Verifies the user is authenticated
 * 2. Gets the user's Stripe customer ID
 * 3. Creates a portal session for managing subscriptions
 * 
 * @returns Object containing the portal session URL
 * 
 * @throws {TRPCError} BAD_REQUEST - If no Stripe customer is found for the user
 */
export const createPortalSession = protectedProcedure.mutation(async ({ ctx }) => {
  const userId = ctx.session?.userId ?? ''

  // Get the user's Stripe customer ID
  const user = await prisma.user.findUnique({
    select: { stripeCustomerId: true },
    where: { id: userId },
  })

  if (!user?.stripeCustomerId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'No Stripe customer found for this user',
    })
  }

  // Base URL for redirects
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    'http://localhost:3000'

  // Create a portal session
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${baseUrl}/api/stripe/return?source=portal`,
  })

  return { url: session.url }
})
