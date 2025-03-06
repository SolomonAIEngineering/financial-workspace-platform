import { z } from "zod";

/**
 * Supported feature flag value types
 */
export type FeatureFlagValue = boolean | string | number;

/**
 * Environment names
 */
export type Environment = "development" | "test" | "production";

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
  NODE_ENV: Environment;
  LOG_LEVEL?: "debug" | "info" | "warn" | "error";
  FEATURE_PREFIX?: string;
}

/**
 * Validator function type
 */
export type Validator<T> = (value: T) => boolean;

/**
 * Feature flag configuration interface
 */
export interface FeatureFlag<T extends FeatureFlagValue = boolean> {
  key: string;
  envKey: string;
  description: string;
  defaultValue: T;
  // Type guard validator
  validator?: (value: unknown) => value is T;
  // Additional validators for different aspects of the feature
  validators?: {
    [key: string]: Validator<any>;
  };
  // Environment-specific configuration
  environments?: {
    NODE_ENV: Environment;
  };
  isEnabled?: boolean;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Feature flag group configuration
 */
export interface FeatureFlagGroup {
  name: string;
  description: string;
  flags: FeatureFlag<FeatureFlagValue>[];
  isEnabled?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Feature flag configuration error types
 */
export enum FeatureFlagErrorType {
  MISSING_ENV_VAR = "MISSING_ENV_VAR",
  INVALID_VALUE = "INVALID_VALUE",
  VALIDATION_FAILED = "VALIDATION_FAILED",
  INVALID_CONFIG = "INVALID_CONFIG",
  INVALID_ENVIRONMENT = "INVALID_ENVIRONMENT",
}

/**
 * Feature flag configuration error
 */
export class FeatureFlagError extends Error {
  constructor(
    public readonly type: FeatureFlagErrorType,
    public readonly flagKey: string,
    message: string
  ) {
    super(message);
    this.name = "FeatureFlagError";
  }
}

/**
 * Feature flag manager configuration
 */
export type FeatureFlagManagerConfig = Partial<{
  /**
   * Whether to throw errors on invalid configurations
   * If false, will fall back to default values
   */
  strict: boolean;

  /**
   * Custom environment variable prefix
   * @default "FEATURE_"
   */
  envPrefix: string;

  /**
   * Current environment
   * @default process.env.NODE_ENV || "development"
   */
  environment: keyof EnvironmentConfig;

  /**
   * Log level for feature flag operations
   */
  logLevel: EnvironmentConfig["LOG_LEVEL"];

  /**
   * Default values for specific environments
   */
  environmentDefaults: {
    [K in keyof EnvironmentConfig]?: Partial<Record<string, FeatureFlagValue>>;
  };

  /**
   * Global validation rules
   */
  globalValidators: {
    [K in keyof EnvironmentConfig]?: (value: unknown) => boolean;
  };
}>;

/**
 * Feature flag registry to store all feature flag definitions
 */
export interface FeatureFlagRegistry {
  [key: string]: FeatureFlag<FeatureFlagValue>;
}

/**
 * Type guard for feature flag value
 */
export function isFeatureFlagValue(value: unknown): value is FeatureFlagValue {
  return (
    typeof value === "boolean" ||
    typeof value === "string" ||
    (typeof value === "number" && !isNaN(value))
  );
}

/**
 * Type guard for feature flag
 */
export function isFeatureFlag(value: unknown): value is FeatureFlag {
  return (
    typeof value === "object" &&
    value !== null &&
    "key" in value &&
    "envKey" in value &&
    "description" in value &&
    "defaultValue" in value &&
    isFeatureFlagValue((value as FeatureFlag).defaultValue)
  );
}

/**
 * Type guard for feature flag group
 */
export function isFeatureFlagGroup(value: unknown): value is FeatureFlagGroup {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "description" in value &&
    "flags" in value &&
    Array.isArray((value as FeatureFlagGroup).flags) &&
    (value as FeatureFlagGroup).flags.every(isFeatureFlag)
  );
}

/**
 * Type guard for environment config
 */
export function isEnvironmentConfig(value: unknown): value is EnvironmentConfig {
  return (
    typeof value === "object" &&
    value !== null &&
    "NODE_ENV" in value &&
    ["development", "test", "production"].includes((value as EnvironmentConfig).NODE_ENV)
  );
}
