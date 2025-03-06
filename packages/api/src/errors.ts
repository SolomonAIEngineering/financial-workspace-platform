/**
 * @fileoverview Defines error response types for the Solomon AI SDK.
 * This module provides type definitions for standardized error responses from the API.
 */

import type { paths } from './openapi'

/**
 * Represents the standardized error response structure from the Solomon AI API.
 * This type is derived from the OpenAPI specification and includes detailed error information.
 *
 * @example
 * ```typescript
 * const errorResponse: ErrorResponse = {
 *   error: {
 *     code: "INVALID_REQUEST",
 *     message: "The request was invalid",
 *     docs: "https://docs.solomon-ai.dev/errors#invalid-request",
 *     requestId: "req_123"
 *   }
 * };
 * ```
 *
 * The error response includes:
 * - code: A machine-readable error code
 * - message: A human-readable error message
 * - docs: URL to relevant documentation
 * - requestId: Unique identifier for the request (useful for debugging)
 */
export type ErrorResponse =
  paths['/v1/liveness']['get']['responses']['500']['content']['application/json']
