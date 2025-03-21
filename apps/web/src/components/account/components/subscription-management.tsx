/**
 * Component for managing user subscriptions with Stripe
 *
 * @file Subscription Management Component
 */

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/registry/default/potion-ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/react';
import { env } from '@/env';
import { useState } from 'react';

type SubscriptionDetails = {
  id: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
  plan: {
    id: string;
    amount: number;
    interval: 'month' | 'year';
    name: string;
  } | null;
  status: SubscriptionStatus;
};

interface SubscriptionManagementProps {
  userId: string;
}

type SubscriptionPlan = {
  id: string;
  features: string[];
  interval: 'month' | 'year';
  name: string;
  price: string;
  isPopular?: boolean;
};

type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'
  | null;

/** Component for displaying and managing user subscription information */
export function SubscriptionManagement({
  userId,
}: SubscriptionManagementProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the user's current subscription
  const { data: subscription, isLoading: isLoadingSubscription } =
    api.user.getUserSubscription.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  // Mutation for creating a checkout session
  const createCheckoutSession = api.user.createCheckoutSession.useMutation({
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsLoading(false),
  });

  // Mutation for creating a portal session (for managing existing subscription)
  const createPortalSession = api.user.createPortalSession.useMutation({
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsLoading(false),
  });

  // Handle subscription checkout
  const handleSubscribe = async (priceId: string) => {
    try {
      const { url } = await createCheckoutSession.mutateAsync({ priceId });

      if (url) window.location.href = url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    }
  };

  // Handle managing existing subscription
  const handleManageSubscription = async () => {
    try {
      const { url } = await createPortalSession.mutateAsync();

      if (url) window.location.href = url;
    } catch (error) {
      console.error('Failed to create portal session:', error);
    }
  };

  // Subscription plans using environment variables for price IDs
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: env.NEXT_PUBLIC_STRIPE_PRICE_BASIC,
      features: ['Core features', 'Limited storage', 'Basic support'],
      interval: 'month',
      name: 'Basic',
      price: '$3.99',
    },
    {
      id: env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
      features: [
        'All Basic features',
        'Unlimited storage',
        'Priority support',
        'Advanced analytics',
      ],
      interval: 'month',
      isPopular: true,
      name: 'Pro',
      price: '$6.99',
    },
    {
      id: env.NEXT_PUBLIC_STRIPE_PRICE_TEAM,
      features: [
        'All Pro features',
        'Team collaboration',
        'Admin controls',
        'Custom branding',
      ],
      interval: 'month',
      name: 'Team',
      price: '$8.99',
    },
  ];

  // Show subscription details if the user has an active subscription
  if (subscription?.id) {
    return (
      <Card className="w-full rounded-xl border-4 border-muted/10 p-[2%] shadow-md transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Your Subscription</CardTitle>
          <CardDescription>
            Manage your subscription plan and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingSubscription ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          ) : (
            <>
              <div className="rounded-lg border p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Current Plan</h3>
                    <span className="text-sm font-medium">
                      {subscription.plan?.name || 'Free'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Status</h3>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      {subscription.status === 'active'
                        ? 'Active'
                        : subscription.status}
                    </span>
                  </div>
                  {subscription.currentPeriodEnd && (
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Renewal Date</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(
                          subscription.currentPeriodEnd
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {subscription.cancelAtPeriodEnd && (
                    <div className="mt-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                      Your subscription will end on{' '}
                      {subscription.currentPeriodEnd
                        ? new Date(
                            subscription.currentPeriodEnd
                          ).toLocaleDateString()
                        : 'the next billing date'}
                      .
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            disabled={isLoading}
            onClick={handleManageSubscription}
          >
            {isLoading ? 'Loading...' : 'Manage Subscription'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Show subscription plans if the user doesn't have an active subscription
  return (
    <Card className="w-full rounded-xl border-4 border-muted/10 p-[2%] shadow-md transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Subscription Plans</CardTitle>
        <CardDescription>Choose a plan that works for you</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingSubscription ? (
          <div className="space-y-4">
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-lg border p-4 ${plan.isPopular ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-2 right-4 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    Popular
                  </span>
                )}
                <div className="mb-4 text-lg font-medium">{plan.name}</div>
                <div className="mb-2">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">/{plan.interval}</span>
                </div>
                <ul className="mb-4 space-y-2 text-sm">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg
                        className="mr-2 h-4 w-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.isPopular ? 'default' : 'outline'}
                  className="w-full"
                  disabled={isLoading || !plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {isLoading ? 'Loading...' : 'Subscribe'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
