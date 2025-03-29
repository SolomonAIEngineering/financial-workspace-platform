'use server';

import { Subscription, prisma } from '@solomonai/prisma';

import { z } from 'zod';

export const getSubscriptionsByUserIdSchema = z.object({
  userId: z.string(),
});

/**
 * The options type for getting subscriptions by user id.
 */
export type GetSubscriptionsByUserIdOptions = z.infer<typeof getSubscriptionsByUserIdSchema>;

/**
 * Get subscriptions by user id.
 */
export const getSubscriptionsByUserId = async ({ userId }: GetSubscriptionsByUserIdOptions): Promise<Subscription[]> => {
  return await prisma.subscription.findMany({
    where: {
      userId,
    },
  });
};
