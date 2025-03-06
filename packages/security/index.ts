/**
 * @module SecurityClient
 * @description A security module that provides protection against common attacks and bot traffic using Arcjet.
 * This module exports utilities for securing API routes and web applications with features like bot detection,
 * rate limiting, and shield protection.
 */

import arcjet, {
  type ArcjetBotCategory,
  type ArcjetWellKnownBot,
  detectBot,
  request,
  shield,
} from '@arcjet/next'
import { env } from '@repo/env'

/**
 * Base Arcjet instance configured with default security settings.
 * This instance can be imported and extended in each route for customized security rules.
 *
 * @example
 * ```typescript
 * // Import and use the base configuration
 * import { base } from './security';
 *
 * // Extend with additional rules
 * const customSecurity = base.withRule(
 *   detectBot({ mode: 'LIVE', allow: ['googlebot'] })
 * );
 * ```
 */
const base = arcjet({
  key: env.ARCJET_KEY,
  characteristics: ['ip.src'],
  rules: [
    shield({
      mode: 'LIVE',
    }),
  ],
})

/**
 * Secures an endpoint by applying bot detection and other security rules.
 *
 * @param {(ArcjetWellKnownBot | ArcjetBotCategory)[]} allow - Array of allowed bot types or categories
 * @param {Request} [sourceRequest] - Optional request object to analyze. If not provided, the current request will be used
 * @throws {Error} Throws an error if the request is denied due to bot detection, rate limiting, or other security rules
 *
 * @example
 * ```typescript
 * // Allow specific bots
 * await secure(['googlebot', 'bingbot']);
 *
 * // Allow categories of bots
 * await secure(['search', 'social']);
 *
 * // Custom request object
 * await secure(['googlebot'], customRequest);
 * ```
 */
export const secure = async (
  allow: (ArcjetWellKnownBot | ArcjetBotCategory)[],
  sourceRequest?: Request,
) => {
  const req = sourceRequest ?? (await request())
  const aj = base.withRule(detectBot({ mode: 'LIVE', allow }))
  const decision = await aj.protect(req)

  if (decision.isDenied()) {
    if (decision.reason.isBot()) {
      throw new Error('No bots allowed')
    }

    if (decision.reason.isRateLimit()) {
      throw new Error('Rate limit exceeded')
    }

    throw new Error('Access denied')
  }
}
