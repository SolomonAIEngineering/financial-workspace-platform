/**
 * @fileoverview This module provides the main SolomonAI SDK client for interacting with the Solomon AI API.
 * The client handles authentication, request management, and provides typed interfaces for all API endpoints.
 */

import type { PermissionQuery } from '@solomonai/rbac'
import type { ErrorResponse } from './errors'
import type { paths } from './openapi'

import { type Telemetry, getTelemetry } from './telemetry'

/**
 * Configuration options for initializing the SolomonAI client.
 *
 * @example
 * ```typescript
 * // Initialize with root key (recommended)
 * const client = new SolomonAI({
 *   rootKey: 'your-root-key',
 *   baseUrl: 'https://api.solomon-ai.dev',
 *   retry: {
 *     attempts: 3,
 *     backoff: (retryCount) => retryCount * 1000
 *   }
 * });
 *
 * // Initialize with legacy token
 * const legacyClient = new SolomonAI({
 *   token: 'your-workspace-token'
 * });
 * ```
 */
export type SolomonAIOptions = (
  | {
      token?: never

      /**
       * The root key from solomon-ai.dev.
       * Required for authentication with the API.
       *
       * You can create/manage your root keys here:
       * https://solomon-ai.dev/app/settings/root-keys
       */
      rootKey: string
    }
  | {
      /**
       * The workspace key from solomon-ai.dev
       *
       * @deprecated Use `rootKey` instead for better security and features
       */
      token: string
      rootKey?: never
    }
) & {
  /**
   * The base URL for the Solomon AI API.
   * @default "https://api.solomon-ai.dev"
   */
  baseUrl?: string

  /**
   * Controls the SDK's telemetry data collection.
   * When enabled (default), the SDK sends:
   * - Runtime environment (Node.js / Edge)
   * - Platform information (Node.js / Vercel / AWS)
   * - SDK version
   *
   * Set to true to opt out of telemetry collection.
   */
  disableTelemetry?: boolean

  /**
   * Configuration for automatic retry behavior on network errors.
   */
  retry?: {
    /**
     * Number of retry attempts for failed requests.
     * Total requests made will be attempts + 1.
     * Set to 0 to disable retries.
     * @default 5
     */
    attempts?: number

    /**
     * Function to determine delay between retry attempts.
     * @param retryCount - The current retry attempt number (starts at 1)
     * @returns Number of milliseconds to wait before next attempt
     * @default (retryCount) => Math.round(Math.exp(retryCount) * 10)
     */
    backoff?: (retryCount: number) => number
  }

  /**
   * Controls the fetch cache behavior for requests.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
   */
  cache?: RequestCache

  /**
   * SDK version identifier for wrapper libraries.
   * Only needed when building a wrapper around this SDK.
   * @internal
   */
  wrapperSdkVersion?: string
}

/**
 * Represents an API request configuration.
 * @internal
 */
type ApiRequest = {
  path: string[]
} & (
  | {
      method: 'GET'
      body?: never
      query?: Record<string, string | number | boolean | null>
    }
  | {
      method: 'POST'
      body?: unknown
      query?: never
    }
)

/**
 * Generic type for API response handling.
 * Represents either a successful result or an error response.
 *
 * @template R - The expected result type for successful responses
 * @internal
 */
type Result<R> =
  | {
      result: R
      error?: never
    }
  | {
      result?: never
      error: {
        code: ErrorResponse['error']['code']
        message: ErrorResponse['error']['message']
        docs: ErrorResponse['error']['docs']
        requestId: string
      }
    }

/**
 * The main SolomonAI client class for interacting with the Solomon AI API.
 * Provides typed methods for all API endpoints and handles authentication, retries, and error handling.
 *
 * @example
 * ```typescript
 * // Initialize the client
 * const solomon = new SolomonAI({
 *   rootKey: 'your-root-key'
 * });
 *
 * // Use the client to interact with different API endpoints
 * const keys = await solomon.keys.list();
 * const apis = await solomon.apis.list();
 *
 * // Handle rate limits
 * const limits = await solomon.ratelimits.get();
 *
 * // Work with identities
 * const identity = await solomon.identities.create({
 *   name: 'test-identity'
 * });
 * ```
 */
export class SolomonAI {
  /**
   * The base URL for the Solomon AI API.
   * This is set during client initialization and used for all API requests.
   */
  public readonly baseUrl: string

  /**
   * The authentication root key for the API.
   * This is used to authenticate all requests to the API.
   * @private
   */
  private readonly rootKey: string

  /**
   * Cache configuration for fetch requests.
   * Controls how responses are cached by the fetch API.
   * @private
   */
  private readonly cache?: RequestCache

  /**
   * Telemetry information for SDK usage tracking.
   * Contains runtime, platform, and SDK version information.
   * @private
   */
  private readonly telemetry?: Telemetry | null

  /**
   * Retry configuration for failed requests.
   * Defines the number of retry attempts and backoff strategy.
   */
  public readonly retry: {
    attempts: number
    backoff: (retryCount: number) => number
  }

  /**
   * Creates a new instance of the SolomonAI client.
   *
   * @param opts - Configuration options for the client
   * @throws {Error} If neither rootKey nor token is provided
   *
   * @example
   * ```typescript
   * const client = new SolomonAI({
   *   rootKey: 'your-root-key',
   *   baseUrl: 'https://api.solomon-ai.dev',
   *   retry: {
   *     attempts: 3,
   *     backoff: (retryCount) => retryCount * 1000
   *   }
   * });
   * ```
   */
  constructor(opts: SolomonAIOptions) {
    this.baseUrl = opts.baseUrl ?? 'https://api.solomon-ai.dev'
    this.rootKey = opts.rootKey ?? opts.token
    if (!opts.disableTelemetry) {
      this.telemetry = getTelemetry(opts)
    }

    this.cache = opts.cache
    /**
     * Even though typescript should prevent this, some people still pass undefined or empty strings
     */
    if (!this.rootKey) {
      throw new Error(
        'SolomonAI root key must be set, maybe you passed in `undefined` or an empty string?',
      )
    }

    this.retry = {
      attempts: opts.retry?.attempts ?? 5,
      backoff: opts.retry?.backoff ?? ((n) => Math.round(Math.exp(n) * 10)),
    }
  }

  /**
   * Generates the headers required for API requests.
   * Includes authentication, content type, and telemetry information.
   *
   * @returns {Record<string, string>} Headers object for fetch requests
   * @private
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.rootKey}`,
    }
    if (this.telemetry?.sdkVersions) {
      headers['SolomonAI-Telemetry-SDK'] = this.telemetry.sdkVersions.join(',')
    }
    if (this.telemetry?.platform) {
      headers['SolomonAI-Telemetry-Platform'] = this.telemetry.platform
    }
    if (this.telemetry?.runtime) {
      headers['SolomonAI-Telemetry-Runtime'] = this.telemetry.runtime
    }
    return headers
  }

  /**
   * Makes an HTTP request to the Solomon AI API with retry capability.
   * Handles request formatting, error responses, and implements the retry strategy.
   *
   * @template TResult - The expected response type
   * @param {ApiRequest} req - The request configuration
   * @returns {Promise<Result<TResult>>} A promise that resolves to either a success result or error response
   * @private
   *
   * @example
   * ```typescript
   * // Internal usage
   * const result = await this.fetch<ApiResponse>({
   *   path: ['v1', 'endpoint'],
   *   method: 'GET',
   *   query: { param: 'value' }
   * });
   * ```
   */
  private async fetch<TResult>(req: ApiRequest): Promise<Result<TResult>> {
    let res: Response | null = null
    let err: Error | null = null

    for (let i = 0; i <= this.retry.attempts; i++) {
      const url = new URL(`${this.baseUrl}/${req.path.join('/')}`)
      if (req.query) {
        for (const [k, v] of Object.entries(req.query)) {
          if (typeof v === 'undefined' || v === null) {
            continue
          }
          url.searchParams.set(k, v.toString())
        }
      }

      try {
        res = await fetch(url, {
          method: req.method,
          headers: this.getHeaders(),
          cache: this.cache,
          body: JSON.stringify(req.body),
        })

        if (res.ok) {
          const data = await res.json()
          return { result: data as TResult }
        }

        // Handle error responses
        try {
          const errorData: any = await res.json()
          if (errorData.error) {
            return {
              error: {
                code: errorData.error.code,
                message: errorData.error.message,
                docs: errorData.error.docs,
                requestId:
                  errorData.error.requestId ||
                  res.headers.get('unkey-request-id') ||
                  'N/A',
              },
            }
          }
        } catch (jsonError) {
          // Handle JSON parsing errors
          return {
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Invalid JSON response',
              docs: 'https://developer.mozilla.org/en-US/docs/Web/API/fetch',
              requestId: res.headers.get('unkey-request-id') || 'N/A',
            },
          }
        }

        // Handle empty error responses
        return {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Empty error response',
            docs: 'https://developer.mozilla.org/en-US/docs/Web/API/fetch',
            requestId: res.headers.get('unkey-request-id') || 'N/A',
          },
        }
      } catch (fetchError) {
        err = fetchError as Error
        // Continue to retry logic
      }

      const backoff = this.retry.backoff(i)
      console.debug(
        'attempt %d of %d to reach %s failed, retrying in %d ms: %s | %s',
        i + 1,
        this.retry.attempts + 1,
        url,
        backoff,
        err?.message ?? `status=${res?.status}`,
        res?.headers.get('unkey-request-id'),
      )
      await new Promise((r) => setTimeout(r, backoff))
    }

    // Handle network errors
    return {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: err?.message || 'Network error',
        docs: 'https://developer.mozilla.org/en-US/docs/Web/API/fetch',
        requestId: 'N/A',
      },
    }
  }

  /**
   * API methods for managing API keys.
   * Provides functionality to create, update, verify, and delete API keys.
   *
   * @example
   * ```typescript
   * // Create a new API key
   * const result = await client.keys.create({
   *   apiId: 'api_123',
   *   prefix: 'my_key',
   *   byteLength: 32,
   *   meta: { environment: 'production' }
   * });
   *
   * // Verify an API key
   * const verified = await client.keys.verify({
   *   key: 'my_key_123',
   *   authorization: {
   *     permissions: { resource: 'users', action: 'read' }
   *   }
   * });
   * ```
   */
  public get keys() {
    return {
      /**
       * Creates a new API key with specified configuration.
       *
       * @param req - The key creation request parameters
       * @returns A promise resolving to the created key details
       *
       * @example
       * ```typescript
       * const key = await client.keys.create({
       *   apiId: 'api_123',
       *   prefix: 'test',
       *   meta: { environment: 'staging' }
       * });
       * ```
       */
      create: async (
        req: paths['/v1/keys.createKey']['post']['requestBody']['content']['application/json'],
      ): Promise<
        Result<
          paths['/v1/keys.createKey']['post']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'keys.createKey'],
          method: 'POST',
          body: req,
        })
      },

      /**
       * Updates an existing API key's configuration.
       *
       * @param req - The key update request parameters
       * @returns A promise resolving to the updated key details
       *
       * @example
       * ```typescript
       * const updated = await client.keys.update({
       *   keyId: 'key_123',
       *   meta: { environment: 'production' }
       * });
       * ```
       */
      update: async (
        req: paths['/v1/keys.updateKey']['post']['requestBody']['content']['application/json'],
      ): Promise<
        Result<
          paths['/v1/keys.updateKey']['post']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'keys.updateKey'],
          method: 'POST',
          body: req,
        })
      },

      /**
       * Verifies an API key and checks its permissions.
       *
       * @template TPermission - The type of permissions to verify
       * @param req - The key verification request parameters
       * @returns A promise resolving to the verification result
       *
       * @example
       * ```typescript
       * const result = await client.keys.verify({
       *   key: 'my_key_123',
       *   authorization: {
       *     permissions: { resource: 'users', action: 'read' }
       *   }
       * });
       * ```
       */
      verify: async <TPermission extends string = string>(
        req: Omit<
          paths['/v1/keys.verifyKey']['post']['requestBody']['content']['application/json'],
          'authorization'
        > & { authorization?: { permissions: PermissionQuery<TPermission> } },
      ): Promise<
        Result<
          paths['/v1/keys.verifyKey']['post']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'keys.verifyKey'],
          method: 'POST',
          body: req,
        })
      },

      /**
       * Deletes an API key.
       *
       * @param req - The key deletion request parameters
       * @returns A promise resolving to the deletion result
       *
       * @example
       * ```typescript
       * const result = await client.keys.delete({
       *   keyId: 'key_123'
       * });
       * ```
       */
      delete: async (
        req: paths['/v1/keys.deleteKey']['post']['requestBody']['content']['application/json'],
      ): Promise<
        Result<
          paths['/v1/keys.deleteKey']['post']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'keys.deleteKey'],
          method: 'POST',
          body: req,
        })
      },

      /**
       * Updates the remaining uses of an API key.
       *
       * @param req - The request parameters for updating remaining uses
       * @returns A promise resolving to the updated key details
       *
       * @example
       * ```typescript
       * const result = await client.keys.updateRemaining({
       *   keyId: 'key_123',
       *   remaining: 100
       * });
       * ```
       */
      updateRemaining: async (
        req: paths['/v1/keys.updateRemaining']['post']['requestBody']['content']['application/json'],
      ): Promise<
        Result<
          paths['/v1/keys.updateRemaining']['post']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'keys.updateRemaining'],
          method: 'POST',
          body: req,
        })
      },

      /**
       * Retrieves details of a specific API key.
       *
       * @param req - The key retrieval request parameters
       * @returns A promise resolving to the key details
       *
       * @example
       * ```typescript
       * const key = await client.keys.get({
       *   keyId: 'key_123'
       * });
       * ```
       */
      get: async (
        req: paths['/v1/keys.getKey']['get']['parameters']['query'],
      ): Promise<
        Result<
          paths['/v1/keys.getKey']['get']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'keys.getKey'],
          method: 'GET',
          query: req,
        })
      },

      /**
       * Retrieves verification history for an API key.
       *
       * @param req - The verification history request parameters
       * @returns A promise resolving to the verification history
       *
       * @example
       * ```typescript
       * const history = await client.keys.getVerifications({
       *   keyId: 'key_123',
       *   limit: 10
       * });
       * ```
       */
      getVerifications: async (
        req: paths['/v1/keys.getVerifications']['get']['parameters']['query'],
      ): Promise<
        Result<
          paths['/v1/keys.getVerifications']['get']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'keys.getVerifications'],
          method: 'GET',
          query: req,
        })
      },
    }
  }

  /**
   * API methods for managing APIs.
   * Provides functionality to create, update, and delete APIs.
   *
   * @example
   * ```typescript
   * // Create a new API
   * const api = await client.apis.create({
   *   name: 'My API',
   *   description: 'API for my service'
   * });
   *
   * // Delete an API
   * const result = await client.apis.delete({
   *   apiId: 'api_123'
   * });
   * ```
   */
  public get apis() {
    return {
      /**
       * Creates a new API.
       *
       * @param req - The API creation request parameters
       * @returns A promise resolving to the created API details
       *
       * @example
       * ```typescript
       * const api = await client.apis.create({
       *   name: 'My API',
       *   description: 'API for my service',
       *   ownerId: 'owner_123'
       * });
       * ```
       */
      create: async (
        req: paths['/v1/apis.createApi']['post']['requestBody']['content']['application/json'],
      ): Promise<
        Result<
          paths['/v1/apis.createApi']['post']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'apis.createApi'],
          method: 'POST',
          body: req,
        })
      },

      /**
       * Deletes an API.
       *
       * @param req - The API deletion request parameters
       * @returns A promise resolving to the deletion result
       *
       * @example
       * ```typescript
       * const result = await client.apis.delete({
       *   apiId: 'api_123'
       * });
       * ```
       */
      delete: async (
        req: paths['/v1/apis.deleteApi']['post']['requestBody']['content']['application/json'],
      ): Promise<
        Result<
          paths['/v1/apis.deleteApi']['post']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'apis.deleteApi'],
          method: 'POST',
          body: req,
        })
      },

      /**
       * Retrieves details of a specific API.
       *
       * @param req - The API retrieval request parameters
       * @returns A promise resolving to the API details
       *
       * @example
       * ```typescript
       * const api = await client.apis.get({
       *   apiId: 'api_123'
       * });
       * ```
       */
      get: async (
        req: paths['/v1/apis.getApi']['get']['parameters']['query'],
      ): Promise<
        Result<
          paths['/v1/apis.getApi']['get']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'apis.getApi'],
          method: 'GET',
          query: req,
        })
      },

      /**
       * Retrieves a list of API keys for a specific API.
       *
       * @param req - The API key list request parameters
       * @returns A promise resolving to the API key list
       *
       * @example
       * ```typescript
       * const keys = await client.apis.listKeys({
       *   apiId: 'api_123'
       * });
       * ```
       */
      listKeys: async (
        req: paths['/v1/apis.listKeys']['get']['parameters']['query'],
      ): Promise<
        Result<
          paths['/v1/apis.listKeys']['get']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'apis.listKeys'],
          method: 'GET',
          query: req,
        })
      },
    }
  }
  public get ratelimits() {
    return {
      limit: async (
        req: paths['/v1/ratelimits.limit']['post']['requestBody']['content']['application/json'],
      ): Promise<
        Result<
          paths['/v1/ratelimits.limit']['post']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'ratelimits.limit'],
          method: 'POST',
          body: req,
        })
      },
      getOverride: async (
        req: paths['/v1/ratelimits.getOverride']['get']['parameters']['query'],
      ): Promise<
        Result<
          paths['/v1/ratelimits.getOverride']['get']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'ratelimits.getOverride'],
          method: 'GET',
          query: req,
        })
      },
      listOverrides: async (
        req: paths['/v1/ratelimits.listOverrides']['get']['parameters']['query'],
      ): Promise<
        Result<
          paths['/v1/ratelimits.listOverrides']['get']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'ratelimits.listOverrides'],
          method: 'GET',
          query: req,
        })
      },

      setOverride: async (
        req: paths['/v1/ratelimits.setOverride']['post']['requestBody']['content']['application/json'],
      ): Promise<
        Result<
          paths['/v1/ratelimits.setOverride']['post']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'ratelimits.setOverride'],
          method: 'POST',
          body: req,
        })
      },

      deleteOverride: async (
        req: paths['/v1/ratelimits.deleteOverride']['post']['requestBody']['content']['application/json'],
      ): Promise<
        Result<
          paths['/v1/ratelimits.deleteOverride']['post']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'ratelimits.deleteOverride'],
          method: 'POST',
          body: req,
        })
      },
    }
  }
  public get identities() {
    return {
      create: async (
        req: paths['/v1/identities.createIdentity']['post']['requestBody']['content']['application/json'],
      ): Promise<
        Result<
          paths['/v1/identities.createIdentity']['post']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'identities.createIdentity'],
          method: 'POST',
          body: req,
        })
      },
      get: async (
        req: paths['/v1/identities.getIdentity']['get']['parameters']['query'],
      ): Promise<
        Result<
          paths['/v1/identities.getIdentity']['get']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'identities.getIdentity'],
          method: 'GET',
          query: req,
        })
      },
      list: async (
        req: paths['/v1/identities.listIdentities']['get']['parameters']['query'],
      ): Promise<
        Result<
          paths['/v1/identities.listIdentities']['get']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'identities.listIdentities'],
          method: 'GET',
          query: req,
        })
      },
      delete: async (
        req: paths['/v1/identities.deleteIdentity']['post']['requestBody']['content']['application/json'],
      ): Promise<
        Result<
          paths['/v1/identities.deleteIdentity']['post']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'identities.deleteIdentity'],
          method: 'POST',
          body: req,
        })
      },
      update: async (
        req: paths['/v1/identities.updateIdentity']['post']['requestBody']['content']['application/json'],
      ): Promise<
        Result<
          paths['/v1/identities.updateIdentity']['post']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'identities.updateIdentity'],
          method: 'POST',
          body: req,
        })
      },
    }
  }

  public get migrations() {
    return {
      createKeys: async (
        req: paths['/v1/migrations.createKeys']['post']['requestBody']['content']['application/json'],
      ): Promise<
        Result<
          paths['/v1/migrations.createKeys']['post']['responses']['200']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'migrations.createKeys'],
          method: 'POST',
          body: req,
        })
      },
      enqueueKeys: async (
        req: paths['/v1/migrations.enqueueKeys']['post']['requestBody']['content']['application/json'],
      ): Promise<
        Result<
          paths['/v1/migrations.enqueueKeys']['post']['responses']['202']['content']['application/json']
        >
      > => {
        return await this.fetch({
          path: ['v1', 'migrations.enqueueKeys'],
          method: 'POST',
          body: req,
        })
      },
    }
  }
}
