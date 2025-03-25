import type { Stripe } from '@solomonai/lib/server-only/stripe'
import { prisma } from '@solomonai/prisma'
import { SubscriptionStatus } from '@solomonai/prisma/client'

export type OnSubscriptionDeletedOptions = {
  subscription: Stripe.Subscription
}

export const onSubscriptionDeleted = async ({
  subscription,
}: OnSubscriptionDeletedOptions) => {
  await prisma.subscription.update({
    where: {
      planId: subscription.id,
    },
    data: {
      status: SubscriptionStatus.INACTIVE,
    },
  })
}
