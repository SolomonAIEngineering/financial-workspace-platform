import 'server-only'

import { Redis } from '@upstash/redis'

/**
 * Redis client instance for interacting with Upstash Redis.
 *
 * This client is configured using environment variables:
 * - UPSTASH_REDIS_REST_URL: The REST URL for your Upstash Redis instance
 * - UPSTASH_REDIS_REST_TOKEN: Authentication token for Upstash Redis
 *
 * @remarks
 * This is a server-side only module and should not be imported in client-side code.
 * Make sure both environment variables are properly set in your deployment environment.
 *
 * @example
 * ```typescript
 * import { client } from './index';
 *
 * // Use the client to interact with Redis
 * await client.set('key', 'value');
 * const value = await client.get('key');
 * ```
 */
export const client = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
