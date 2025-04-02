'use server';

import { Subscription, SubscriptionStatus } from '@solomonai/prisma';

import { prisma } from '@solomonai/prisma/server';
import { z } from 'zod';

export const getActiveSubscriptionsByUserIdSchema = z.object({
  userId: z.string(),
});

/**
 * The options type for getting active subscriptions by user id.
 */
export type GetActiveSubscriptionsByUserIdOptions = z.infer<typeof getActiveSubscriptionsByUserIdSchema>;

/**
 * Get active subscriptions by user id.
 */
export const getActiveSubscriptionsByUserId = async ({
  userId,
}: GetActiveSubscriptionsByUserIdOptions): Promise<Subscription[]> => {
  return await prisma.subscription.findMany({
    where: {
      userId: userId,
      status: {
        not: SubscriptionStatus.INACTIVE,
      },
    },
  });
};
