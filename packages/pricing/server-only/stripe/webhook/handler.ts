import type { NextApiRequest, NextApiResponse } from 'next'
import {
  mapStripeSubscriptionToPrismaUpsertAction,
  onSubscriptionUpdated,
} from './on-subscription-updated'

import { STRIPE_PLAN_TYPE } from '@solomonai/lib/constants/billing'
import type { Stripe } from '@solomonai/lib/server-only/stripe'
import { TeamRole } from '@solomonai/prisma/client'
import { buffer } from 'micro'
import { match } from 'ts-pattern'
import { onSubscriptionDeleted } from './on-subscription-deleted'
import { prisma } from '@solomonai/prisma/server'
import { stripe } from '@solomonai/lib/server-only/stripe'

/**
 * Response type for Stripe webhook handlers
 *
 * @interface StripeWebhookResponse
 * @property {boolean} success - Whether the webhook was processed successfully
 * @property {string} message - A descriptive message about the webhook processing result
 */
type StripeWebhookResponse = {
  success: boolean
  message: string
}

export const stripeWebhookHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<StripeWebhookResponse>,
) => {
  try {
    const signature =
      typeof req.headers['stripe-signature'] === 'string'
        ? req.headers['stripe-signature']
        : ''

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'No signature found in request',
      })
    }

    const body = await buffer(req)

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? '',
    )

    await match(event.type)
      .with('checkout.session.completed', async () => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const session = event.data.object as Stripe.Checkout.Session

        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id

        // Attempt to get the user ID from the client reference id.
        let userId = session.client_reference_id

        // If the user ID is not found, attempt to get it from the Stripe customer metadata.
        if (!userId && customerId) {
          const customer = await stripe.customers.retrieve(customerId)

          if (!customer.deleted) {
            userId = customer.metadata.userId
          }
        }

        // Finally, attempt to get the user ID from the subscription within the database.
        if (!userId && customerId) {
          const result = await prisma.user.findFirst({
            select: {
              id: true,
            },
            where: {
              stripeCustomerId: customerId,
            },
          })

          if (result?.id) {
            userId = result.id
          }
        }

        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id

        if (!subscriptionId) {
          return res.status(500).json({
            success: false,
            message: 'Invalid session',
          })
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        // Handle team creation after seat checkout.
        if (
          subscription.items.data[0].price.metadata.plan ===
          STRIPE_PLAN_TYPE.TEAM
        ) {
          await handleTeamSeatCheckout({ subscription })

          return res.status(200).json({
            success: true,
            message: 'Webhook received',
          })
        }

        // Validate user ID.
        if (!userId) {
          return res.status(500).json({
            success: false,
            message: 'Invalid session or missing user ID',
          })
        }

        await onSubscriptionUpdated({ userId, subscription })

        return res.status(200).json({
          success: true,
          message: 'Webhook received',
        })
      })
      .with('customer.subscription.updated', async () => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const subscription = event.data.object as Stripe.Subscription

        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id

        if (
          subscription.items.data[0].price.metadata.plan ===
          STRIPE_PLAN_TYPE.TEAM
        ) {
          const team = await prisma.team.findFirst({
            where: {
              stripeCustomerId: customerId,
            },
          })

          if (!team) {
            return res.status(500).json({
              success: false,
              message: 'No team associated with subscription found',
            })
          }

          await onSubscriptionUpdated({ teamId: team.id, subscription })

          return res.status(200).json({
            success: true,
            message: 'Webhook received',
          })
        }

        const result = await prisma.user.findFirst({
          select: {
            id: true,
          },
          where: {
            stripeCustomerId: customerId,
          },
        })

        if (!result?.id) {
          return res.status(500).json({
            success: false,
            message: 'User not found',
          })
        }

        await onSubscriptionUpdated({ userId: result.id, subscription })

        return res.status(200).json({
          success: true,
          message: 'Webhook received',
        })
      })
      .with('invoice.payment_succeeded', async () => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.billing_reason !== 'subscription_cycle') {
          return res.status(200).json({
            success: true,
            message: 'Webhook received',
          })
        }

        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id

        const subscriptionId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id

        if (!customerId || !subscriptionId) {
          return res.status(500).json({
            success: false,
            message: 'Invalid invoice',
          })
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        if (subscription.status === 'incomplete_expired') {
          return res.status(200).json({
            success: true,
            message: 'Webhook received',
          })
        }

        if (
          subscription.items.data[0].price.metadata.plan ===
          STRIPE_PLAN_TYPE.TEAM
        ) {
          const team = await prisma.team.findFirst({
            where: {
              stripeCustomerId: customerId,
            },
          })

          if (!team) {
            return res.status(500).json({
              success: false,
              message: 'No team associated with subscription found',
            })
          }

          await onSubscriptionUpdated({ teamId: team.id, subscription })

          return res.status(200).json({
            success: true,
            message: 'Webhook received',
          })
        }

        const result = await prisma.user.findFirst({
          select: {
            id: true,
          },
          where: {
            stripeCustomerId: customerId,
          },
        })

        if (!result?.id) {
          return res.status(500).json({
            success: false,
            message: 'User not found',
          })
        }

        await onSubscriptionUpdated({ userId: result.id, subscription })

        return res.status(200).json({
          success: true,
          message: 'Webhook received',
        })
      })
      .with('invoice.payment_failed', async () => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const invoice = event.data.object as Stripe.Invoice

        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id

        const subscriptionId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id

        if (!customerId || !subscriptionId) {
          return res.status(500).json({
            success: false,
            message: 'Invalid invoice',
          })
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        if (subscription.status === 'incomplete_expired') {
          return res.status(200).json({
            success: true,
            message: 'Webhook received',
          })
        }

        if (
          subscription.items.data[0].price.metadata.plan ===
          STRIPE_PLAN_TYPE.TEAM
        ) {
          const team = await prisma.team.findFirst({
            where: {
              stripeCustomerId: customerId,
            },
          })

          if (!team) {
            return res.status(500).json({
              success: false,
              message: 'No team associated with subscription found',
            })
          }

          await onSubscriptionUpdated({ teamId: team.id, subscription })

          return res.status(200).json({
            success: true,
            message: 'Webhook received',
          })
        }

        const result = await prisma.user.findFirst({
          select: {
            id: true,
          },
          where: {
            stripeCustomerId: customerId,
          },
        })

        if (!result?.id) {
          return res.status(500).json({
            success: false,
            message: 'User not found',
          })
        }

        await onSubscriptionUpdated({ userId: result.id, subscription })

        return res.status(200).json({
          success: true,
          message: 'Webhook received',
        })
      })
      .with('customer.subscription.deleted', async () => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const subscription = event.data.object as Stripe.Subscription

        await onSubscriptionDeleted({ subscription })

        return res.status(200).json({
          success: true,
          message: 'Webhook received',
        })
      })
      .otherwise(() => {
        return res.status(200).json({
          success: true,
          message: 'Webhook received',
        })
      })
  } catch (err) {
    console.error(err)

    res.status(500).json({
      success: false,
      message: 'Unknown error',
    })
  }
}

/**
 * Options for handling team seat checkout process
 *
 * @interface HandleTeamSeatCheckoutOptions
 * @property {Stripe.Subscription} subscription - The Stripe subscription object containing team seat information
 */
export type HandleTeamSeatCheckoutOptions = {
  subscription: Stripe.Subscription
}

/**
 * Handles the checkout process for team seats
 *
 * This function processes a team seat subscription checkout by creating a team from a pending team record.
 * It validates the presence of a pending team ID in the subscription metadata before proceeding.
 *
 * @param {HandleTeamSeatCheckoutOptions} options - The options for handling team seat checkout
 * @returns {Promise<string>} The ID of the newly created team
 * @throws {Error} If the pending team ID is missing or invalid in the subscription metadata
 *
 * @example
 * ```ts
 * const teamId = await handleTeamSeatCheckout({
 *   subscription: stripeSubscription
 * });
 * ```
 */
const handleTeamSeatCheckout = async ({
  subscription,
}: HandleTeamSeatCheckoutOptions) => {
  if (subscription.metadata?.pendingTeamId === undefined) {
    throw new Error('Missing pending team ID')
  }

  const pendingTeamId = subscription.metadata.pendingTeamId

  if (!pendingTeamId) {
    throw new Error('Invalid pending team ID')
  }

  return await createTeamFromPendingTeam({ pendingTeamId, subscription }).then(
    (team) => team.id,
  )
}

/**
 * Options for creating a team from a pending team record
 *
 * @interface CreateTeamFromPendingTeamOptions
 * @property {string} pendingTeamId - The ID of the pending team record to convert into a real team
 * @property {Stripe.Subscription} subscription - The Stripe subscription associated with the team
 */
export type CreateTeamFromPendingTeamOptions = {
  pendingTeamId: string
  subscription: Stripe.Subscription
}

/**
 * Creates a new team from a pending team record
 *
 * This function performs the following operations in a transaction:
 * 1. Retrieves and validates the pending team record
 * 2. Deletes the pending team record
 * 3. Creates a new team with the pending team's information
 * 4. Creates a team member record for the owner with OWNER role
 * 5. Creates or updates the subscription record
 * 6. Updates the Stripe subscription metadata with the new team ID
 *
 * @param {CreateTeamFromPendingTeamOptions} options - The options for creating the team
 * @returns {Promise<Team>} The newly created team record
 * @throws {Error} If the pending team record cannot be found
 * @throws {Prisma.PrismaClientKnownRequestError} If there are database operation errors
 * @throws {Stripe.errors.StripeError} If there are errors updating the Stripe subscription
 *
 * @example
 * ```ts
 * const team = await createTeamFromPendingTeam({
 *   pendingTeamId: 'pending_123',
 *   subscription: stripeSubscription
 * });
 * ```
 */
export const createTeamFromPendingTeam = async ({
  pendingTeamId,
  subscription,
}: CreateTeamFromPendingTeamOptions) => {
  return await prisma.$transaction(async (tx) => {
    const pendingTeam = await tx.teamPending.findUniqueOrThrow({
      where: {
        id: pendingTeamId,
      },
    })

    await tx.teamPending.delete({
      where: {
        id: pendingTeamId,
      },
    })

    const team = await tx.team.create({
      data: {
        name: pendingTeam.name,
        stripeCustomerId: pendingTeam.customerId,
        slug: pendingTeam.name.toLowerCase().replace(/\s+/g, '-'),
        usersOnTeam: {
          create: [
            {
              userId: pendingTeam.ownerUserId,
              role: TeamRole.OWNER,
            },
          ],
        },
      },
    })

    await tx.subscription.upsert(
      mapStripeSubscriptionToPrismaUpsertAction(
        subscription,
        undefined,
        team.id,
      ),
    )

    // Attach the team ID to the subscription metadata for sanity reasons.
    await stripe.subscriptions
      .update(subscription.id, {
        metadata: {
          teamId: team.id.toString(),
        },
      })
      .catch((e) => {
        console.error(e)
        // Non-critical error, but we want to log it so we can rectify it.
        // Todo: Teams - Alert us.
      })

    return team
  })
}
