/**
 * @fileoverview Telemetry module for collecting and managing SDK usage information.
 * This module handles the collection of runtime environment data, platform information,
 * and SDK version tracking for monitoring and debugging purposes.
 */

import type { SolomonAIOptions } from './client'
import { version } from '../package.json'

/**
 * Represents telemetry data collected by the SDK.
 * This information helps in understanding the SDK usage patterns and debugging issues.
 *
 * @example
 * ```typescript
 * const telemetry: Telemetry = {
 *   sdkVersions: ['@solomonai/api@1.0.0', 'custom-wrapper@2.0.0'],
 *   platform: 'vercel',
 *   runtime: 'node@v18.12.0'
 * };
 * ```
 */
export type Telemetry = {
  /**
   * Array of SDK versions in use.
   * Includes the core SDK version and any wrapper SDK versions.
   *
   * @example ['@solomonai/api@v1.1.1', 'custom-wrapper@2.0.0']
   */
  sdkVersions: string[]

  /**
   * The platform where the SDK is running.
   * Automatically detected for common cloud platforms.
   *
   * @example 'vercel', 'aws', 'cloudflare'
   */
  platform?: string

  /**
   * The runtime environment where the SDK is executing.
   * Includes the runtime type and version information.
   *
   * @example 'node@v18', 'edge-light'
   */
  runtime?: string
}

/**
 * Generates telemetry data based on the current environment and SDK configuration.
 * Automatically detects the runtime environment, platform, and collects SDK version information.
 * Respects telemetry opt-out through the SOLOMONAI_DISABLE_TELEMETRY environment variable.
 *
 * @param opts - The SDK configuration options
 * @returns Telemetry data object or null if telemetry is disabled
 *
 * @example
 * ```typescript
 * const telemetry = getTelemetry({
 *   rootKey: 'key_123',
 *   wrapperSdkVersion: 'custom-wrapper@1.0.0'
 * });
 *
 * if (telemetry) {
 *   console.info('Running on:', telemetry.platform);
 *   console.info('Runtime:', telemetry.runtime);
 *   console.info('SDK Versions:', telemetry.sdkVersions);
 * }
 * ```
 */
export function getTelemetry(opts: SolomonAIOptions): Telemetry | null {
  let platform: string | undefined
  let runtime: string | undefined
  const sdkVersions = [`@solomonai/api@${version}`]

  try {
    if (typeof process !== 'undefined') {
      if (process.env.SOLOMONAI_DISABLE_TELEMETRY) {
        return null
      }
      platform = process.env.VERCEL
        ? 'vercel'
        : process.env.AWS_REGION
          ? 'aws'
          : undefined

      // @ts-ignore
      if (typeof EdgeRuntime !== 'undefined') {
        runtime = 'edge-light'
      } else {
        runtime = `node@${process.version}`
      }
    }

    if (opts.wrapperSdkVersion) {
      sdkVersions.push(opts.wrapperSdkVersion)
    }
  } catch (_error) { }

  return { platform, runtime, sdkVersions }
}
