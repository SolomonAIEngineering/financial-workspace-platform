/**
 * @fileoverview Main entry point for the Solomon AI SDK.
 * This module exports all public interfaces, types, and functions needed to interact with the Solomon AI API.
 *
 * @example
 * ```typescript
 * import { SolomonAI, verifyKey, and, or } from '@repo/api';
 *
 * // Initialize the SDK
 * const client = new SolomonAI({
 *   rootKey: 'your-root-key'
 * });
 *
 * // Use permission helpers
 * const permissions = and([
 *   { resource: 'users', action: 'read' },
 *   or([
 *     { resource: 'posts', action: 'create' },
 *     { resource: 'comments', action: 'create' }
 *   ])
 * ]);
 *
 * // Verify API keys
 * const { result } = await verifyKey('your-api-key');
 * ```
 */

/**
 * Re-export RBAC (Role-Based Access Control) utilities from @repo/rbac.
 * These utilities help in constructing complex permission queries.
 */
export { and, or, type Flatten } from '@repo/rbac'

/**
 * Export core client functionality including the main SolomonAI client class
 * and related configuration types.
 */
export * from './client'

/**
 * Export error handling types and utilities for proper error management
 * in applications using the SDK.
 */
export * from './errors'

/**
 * Export key verification utilities for simplified API key validation
 * without needing to initialize the full client.
 */
export * from './verify'
