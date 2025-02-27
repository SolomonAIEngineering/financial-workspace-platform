/**
 * Feature flags configuration
 *
 * This file provides a centralized way to manage feature flags for the
 * application. Feature flags allow us to toggle features on/off without
 * deploying new code.
 *
 * Environment variables should be prefixed with NEXT_PUBLIC_ to be accessible
 * in the browser.
 */

export const FeatureFlags = {
  /** Whether the analytics feature is enabled */
  ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',

  /**
   * Whether the document sending feature is enabled Set to true to enable the
   * full document sending interface Set to false to show the "coming soon"
   * development notice
   */
  DOCUMENT_SENDING_ENABLED:
    process.env.NEXT_PUBLIC_DOCUMENT_SENDING_ENABLED === 'true',

  /** Whether the document signing feature is enabled */
  DOCUMENT_SIGNING_ENABLED:
    process.env.NEXT_PUBLIC_DOCUMENT_SIGNING_ENABLED === 'true',

  /** Whether the templates feature is enabled */
  TEMPLATES_ENABLED: process.env.NEXT_PUBLIC_TEMPLATES_ENABLED === 'true',
};

/**
 * Check if a feature is enabled
 *
 * @param featureKey The feature key to check
 * @returns Whether the feature is enabled
 */
export function isFeatureEnabled(
  featureKey: keyof typeof FeatureFlags
): boolean {
  return FeatureFlags[featureKey];
}

/**
 * Check if a feature is enabled with a default fallback
 *
 * @param featureKey The feature key to check
 * @param defaultValue The default value to return if the feature flag is not
 *   defined
 * @returns Whether the feature is enabled
 */
export function isFeatureEnabledWithDefault(
  featureKey: keyof typeof FeatureFlags,
  defaultValue: boolean
): boolean {
  const value = FeatureFlags[featureKey];

  return value === undefined ? defaultValue : value;
}
