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
import { env } from '@/env';

/**
 * The Stripe API version being used. Should be updated when intentionally
 * migrating to a newer API version.
 */
export const STRIPE_API_VERSION = '2025-02-24.acacia' as const;

/**
 * Singleton Stripe client instance configured with API key from environment
 * variables. Use this instance for all Stripe API calls throughout the
 * application.
 *
 * @example
 *   ```typescript
 *   import { stripe } from '@/lib/stripe';
 *
 *   // Get a customer
 *   const customer = await stripe.customers.retrieve('cus_123');
 *   ```;
 */
export const stripe = new Stripe(env.STRIPE_API_KEY, {
  apiVersion: STRIPE_API_VERSION,
  appInfo: {
    name: 'SMB Financial Management Platform',
    version: '1.0.0',
  },
});
