import { APP_BASE_URL } from '@solomonai/lib/constants/app'

import { FREE_PLAN_LIMITS } from './constants'
import type { TLimitsResponseSchema } from './schema'
import { ZLimitsResponseSchema } from './schema'

/**
 * Options for fetching usage limits from the API
 *
 * @interface GetLimitsOptions
 * @property {Record<string, string>} [headers] - Optional HTTP headers to include in the request
 * @property {string | null} [teamId] - Optional team ID to fetch team-specific limits
 * @property {string | null} [userId] - Optional user ID to fetch user-specific limits
 */
export type GetLimitsOptions = {
  headers?: Record<string, string>
  teamId?: string | null
  userId?: string | null
  email?: string | null
}

/**
 * Fetches usage limits from the API
 *
 * @async
 * @function getLimits
 * @description
 * Retrieves the current usage limits for a team or user from the API.
 * If the request fails, returns the default FREE_PLAN_LIMITS.
 * Headers, teamId, and userId are optional parameters that can be used to
 * customize the request context.
 *
 * @example
 * ```typescript
 * // Fetch limits for a team
 * const teamLimits = await getLimits({ teamId: '123' });
 *
 * // Fetch limits for a user
 * const userLimits = await getLimits({ userId: '456' });
 *
 * // Fetch limits with custom headers
 * const limitsWithHeaders = await getLimits({
 *   headers: { 'custom-header': 'value' }
 * });
 * ```
 *
 * @param {GetLimitsOptions} options - Options for the limits request
 * @param {Record<string, string>} [options.headers] - Optional HTTP headers
 * @param {string | null} [options.teamId] - Optional team ID
 * @param {string | null} [options.userId] - Optional user ID
 * @returns {Promise<TLimitsResponseSchema>} A promise that resolves to the limits response
 * @throws Will not throw, returns FREE_PLAN_LIMITS on error
 */
export const getLimits = async ({
  headers,
  teamId,
  userId,
  email,
}: GetLimitsOptions = {}) => {
  const requestHeaders = headers ?? {}

  const url = new URL('/api/limits', APP_BASE_URL() ?? 'http://localhost:3000')

  if (teamId) {
    requestHeaders['team-id'] = teamId.toString()
  }

  if (userId) {
    requestHeaders['user-id'] = userId.toString()
  }

  if (email) {
    requestHeaders['email'] = email.toString()
  }

  return fetch(url, {
    headers: {
      ...requestHeaders,
    },
  })
    .then(async (res) => res.json())
    .then((res) => ZLimitsResponseSchema.parse(res))
    .catch((_err) => {
      return {
        quota: FREE_PLAN_LIMITS,
        remaining: FREE_PLAN_LIMITS,
      } satisfies TLimitsResponseSchema
    })
}
