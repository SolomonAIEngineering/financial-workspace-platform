import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const DEFAULT = {
  PORT: '3000',
};

export const env = createEnv({
  /**
   * Specify your client-side environment variables schema here. This way you
   * can ensure the app isn't built with invalid env vars. To expose them to the
   * client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_API_URL: z.string().default('http://localhost:4000'),
    NEXT_PUBLIC_APP_NAME: z.string().default('Solomon AI Contract Workspace'),
    NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
    NEXT_PUBLIC_ENVIRONMENT: z.string().default('development'),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().default(''),
    NEXT_PUBLIC_SITE_URL: z.string().optional(),
    NEXT_PUBLIC_STORAGE_PREFIX: z.string().default('/images'),
    // Stripe subscription plans
    NEXT_PUBLIC_STRIPE_PRICE_BASIC: z.string().default(''),
    NEXT_PUBLIC_STRIPE_PRICE_PRO: z.string().default(''),
    NEXT_PUBLIC_STRIPE_PRICE_TEAM: z.string().default(''),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().default(''),
  },

  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR:
   * z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge
   * runtimes (e.g. middlewares) or client-side so we need to destruct
   * manually.
   */
  experimental__runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL && process.env.VERCEL_ENV !== 'development'
        ? `https://${process.env.VERCEL_URL}`
        : `http://localhost:${process.env.PORT || DEFAULT.PORT}`),
    NEXT_PUBLIC_STORAGE_PREFIX: process.env.NEXT_PUBLIC_STORAGE_PREFIX,
    // Stripe subscription plans
    NEXT_PUBLIC_STRIPE_PRICE_BASIC: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC,
    NEXT_PUBLIC_STRIPE_PRICE_PRO: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    NEXT_PUBLIC_STRIPE_PRICE_TEAM: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Specify your server-side environment variables schema here. This way you
   * can ensure the app isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string(),
    EMAIL_DOMAIN: z.string().default('solomon-ai.app'),
    GITHUB_CLIENT_ID: z.string().default(''),
    GITHUB_CLIENT_SECRET: z.string().default(''),
    GOOGLE_API_KEY: z.string().default(''),
    GOOGLE_CLIENT_ID: z.string().default(''),
    GOOGLE_CLIENT_SECRET: z.string().default(''),
    OPENAI_API_KEY: z.string().default(''),
    PLAIN_API_KEY: z.string().default(''),
    PLAIN_FEEDBACK_LABEL_BUG: z
      .string()
      .default('lt_01JN2Y0T823VHEYPD9KX3YA3XZ'),
    PLAIN_FEEDBACK_LABEL_FEATURE: z
      .string()
      .default('lt_01HXTDSYX6SG3V7YB8CNB0YZB5'),
    PLAIN_FEEDBACK_LABEL_GENERAL: z
      .string()
      .default('lt_01JN2Y280HG5F8BH33Q1CDN7E7'),
    PLAIN_FEEDBACK_LABEL_SUPPORT: z
      .string()
      .default('lt_01JN2Y1BFY6FXD90REETNPWFJA'),
    PORT: z.string().default(DEFAULT.PORT),
    RESEND_API_KEY: z.string().default(''),
    SENTRY_DSN: z.string().default(''),
    SENTRY_ORG: z.string().default(''),
    SENTRY_PROJECT: z.string().default(''),
    STRIPE_API_KEY: z.string().default(''),
    STRIPE_WEBHOOK_SECRET: z.string().default(''),
    SUPERADMIN: z.string().default(''),
    UPSTASH_REDIS_REST_TOKEN: z.string().default(''),
    UPSTASH_REDIS_REST_URL: z.string().default(''),
  },
  shared: {
    NEXT_PUBLIC_APP_NAME: z.string().default('Solomon AI Contract Workspace'),
    NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
    NEXT_PUBLIC_ENVIRONMENT: z.string().default('development'),
    NEXT_PUBLIC_SITE_URL: z.string().default(''),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('production'),
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
