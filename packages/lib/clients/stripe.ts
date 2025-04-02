/**
 * Stripe API Client
 *
 * This module provides a centralized Stripe client instance for use throughout
 * the application. It ensures we're using a single instance with consistent
 * configuration.
 *
 * @module lib/stripe
 */

import Stripe from 'stripe';

/**
 * The Stripe API version being used. Should be updated when intentionally
 * migrating to a newer API version.
 */
export const STRIPE_API_VERSION = '2025-02-24.acacia' as const;

export const STRIPE_API_KEY_PRODUCTION =
  process.env.STRIPE_API_KEY || '';

export const STRIPE_API_KEY_TEST =
  process.env.STRIPE_API_KEY || '';

export const STRIPE_API_KEY =
  process.env.NODE_ENV === 'production'
    ? STRIPE_API_KEY_PRODUCTION
    : STRIPE_API_KEY_TEST;

// Dummy key used during build/indexing time (like trigger.dev deployments)
// This prevents errors when environment variables aren't available
const DUMMY_API_KEY_FOR_INDEXING = 'sk_test_dummy_key_for_indexing';

/**
 * Creates and returns a Stripe client instance with the provided API key.
 * This function is useful when you need custom Stripe client instances.
 */
export function createStripeClient(apiKey: string) {
  return new Stripe(apiKey, {
    apiVersion: STRIPE_API_VERSION,
    appInfo: {
      name: 'SMB Financial Management Platform',
      version: '1.0.0',
    },
  });
}

/**
 * Singleton Stripe client instance configured with API key from environment
 * variables. Use this instance for all Stripe API calls throughout the
 * application.
 *
 * Note: During build/indexing processes (like trigger.dev deployments), this will use
 * a dummy API key to prevent initialization errors. The actual API calls will
 * still require proper credentials at runtime.
 *
 * @example
 *   ```typescript
 *   import { stripe } from '@/lib/stripe';
 *
 *   // Get a customer
 *   const customer = await stripe.customers.retrieve('cus_123');
 *   ```;
 */
export const stripe = createStripeClient(
  // Use a dummy key during build/indexing if no real key is available
  STRIPE_API_KEY || DUMMY_API_KEY_FOR_INDEXING
);
