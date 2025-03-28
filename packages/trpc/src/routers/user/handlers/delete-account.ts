import { loops, stripe } from '@solomonai/lib/clients'

import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Delete the user's account and all associated data
 * 
 * This procedure:
 * 1. Verifies the user is authenticated
 * 2. Cancels and cleans up any Stripe subscriptions
 * 3. Removes the user from Loops (marketing/communication tool)
 * 4. Deletes all team associations
 * 5. Deletes the user account and all cascading data
 * 
 * @returns Success confirmation
 * 
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If account deletion fails
 */
export const deleteAccount = protectedProcedure.mutation(async ({ ctx }) => {
  // First, check if user has a Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { id: ctx.session?.userId },
    select: { stripeCustomerId: true, email: true },
  })

  // If user has a Stripe customer ID, delete the customer
  if (user?.stripeCustomerId) {
    try {
      // First, cancel any active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
      })

      // Cancel all active subscriptions
      for (const subscription of subscriptions.data) {
        if (
          subscription.status === 'active' ||
          subscription.status === 'trialing'
        ) {
          await stripe.subscriptions.cancel(subscription.id, {
            invoice_now: false,
            prorate: true,
          })
        }
      }

      // Optional: Delete the customer (or mark as deleted - depends on stripe retention policy)
      const deletedCustomer = await stripe.customers.del(user.stripeCustomerId)
      if (!deletedCustomer.deleted) {
        console.error('Failed to delete Stripe customer:', deletedCustomer)
      }

      console.info(
        `Stripe customer ${user.stripeCustomerId} deleted successfully`,
      )
    } catch (error) {
      console.error('Failed to delete Stripe customer:', error)
      // Continue with account deletion even if Stripe deletion fails
    }
  }

  // delete the user from loops
  try {
    // Delete contact in Loops using the SDK
    const response = await loops.deleteContact({
      email: ctx.user?.email ?? '',
      userId: ctx.session?.userId ?? '',
    })

    if (!response.success) {
      console.error('Failed to delete contact from Loops:', response)
    }
  } catch (error) {
    console.error('Error deleting contact from Loops:', error)
    // Continue with account deletion even if Loops deletion fails
  }

  try {
    // First delete team associations to avoid foreign key constraint violation
    await prisma.usersOnTeam.deleteMany({
      where: { userId: ctx.session?.userId ?? '' },
    })
    // With onDelete: Cascade set in the Prisma schema,
    // we don't need to manually delete related records first
    // Just delete the user and all related records will be deleted automatically
    await prisma.user.delete({
      where: { id: ctx.session?.userId ?? '' },
    })

    return { success: true }
  } catch (error) {
    console.error('Error during account deletion:', error)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
  }
})
