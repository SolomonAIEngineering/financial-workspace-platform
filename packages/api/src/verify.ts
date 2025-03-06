/**
 * @fileoverview Provides key verification functionality for the Solomon AI SDK.
 * This module offers a simplified interface for verifying API keys without requiring full SDK initialization.
 */

import { SolomonAI } from './client'

/**
 * Verifies the validity of a Solomon AI API key.
 * This function provides a simplified way to verify keys without needing to initialize the full SDK client.
 * It can be used for quick key validation in middleware or authentication layers.
 *
 * @param req - Either a string key or an object containing key and apiId
 * @returns A promise resolving to the verification result
 *
 * @example
 * ```typescript
 * // Verify using just the key
 * const { result, error } = await verifyKey("key_123");
 * if (error) {
 *   console.error('Verification failed:', error.message);
 *   console.log('See docs:', error.docs);
 *   return;
 * }
 *
 * if (!result.valid) {
 *   console.log('Key is invalid');
 *   return;
 * }
 *
 * console.log('Key is valid:', result);
 *
 * // Verify with specific API ID
 * const verificationResult = await verifyKey({
 *   key: "key_123",
 *   apiId: "api_456"
 * });
 *
 * if (verificationResult.result?.valid) {
 *   console.log('Key is valid for the specified API');
 * }
 * ```
 *
 * @throws Will not throw errors directly, but returns them in the error field
 * of the result object
 */
export function verifyKey(req: string | { key: string; apiId: string }) {
  // Initialize client with public access for key verification
  const kmgr = new SolomonAI({ rootKey: 'public' })
  return kmgr.keys.verify(typeof req === 'string' ? { key: req } : req)
}
