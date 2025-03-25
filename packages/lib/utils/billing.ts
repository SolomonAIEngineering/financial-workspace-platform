import type { Subscription } from '@solomonai/prisma';
import { SubscriptionStatus } from '@solomonai/prisma';

/**
 * Returns true if there is a subscription that is active and is one of the provided price IDs.
 */
export const subscriptionsContainsActivePlan = (
  subscriptions: Subscription[],
  priceIds: string[],
  allowPastDue?: boolean,
) => {
  const allowedSubscriptionStatuses: SubscriptionStatus[] = [SubscriptionStatus.ACTIVE];

  if (allowPastDue) {
    allowedSubscriptionStatuses.push(SubscriptionStatus.PAST_DUE);
  }

  return subscriptions.some(
    (subscription) =>
      allowedSubscriptionStatuses.includes(subscription.status) &&
      priceIds.includes(subscription.priceId),
  );
};

/**
 * Returns true if there is a subscription that is active and is one of the provided product IDs.
 */
export const subscriptionsContainsActiveProductId = (
  subscriptions: Subscription[],
  productId: string[],
) => {
  return subscriptions.some(
    (subscription) =>
      subscription.status === SubscriptionStatus.ACTIVE && productId.includes(subscription.planId),
  );
};
