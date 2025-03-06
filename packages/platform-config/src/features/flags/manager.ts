import {
  EnvironmentConfig,
  FeatureFlag,
  FeatureFlagError,
  FeatureFlagErrorType,
  FeatureFlagManagerConfig,
  FeatureFlagRegistry,
  FeatureFlagValue,
} from "./types";
import { validateFeatureFlag, validateFeatureFlags } from "./schema";

/**
 * Default type validators for common feature flag types
 */
export const validators = {
  boolean: (value: unknown): value is boolean => typeof value === "boolean",
  string: (value: unknown): value is string => typeof value === "string",
  number: (value: unknown): value is number => typeof value === "number" && !isNaN(value),
};

/**
 * Feature Flag Manager class responsible for loading and managing feature flags
 */
export class FeatureFlagManager {
  private readonly config: Required<FeatureFlagManagerConfig>;
  private readonly registry: FeatureFlagRegistry = {};
  private readonly values: Map<string, FeatureFlagValue> = new Map();

  constructor(config: FeatureFlagManagerConfig = {}) {
    this.config = {
      strict: false,
      envPrefix: "FEATURE_",
      environment: "NODE_ENV" as keyof EnvironmentConfig,
      logLevel: "info",
      environmentDefaults: {},
      globalValidators: {},
      ...config,
    };
  }

  /**
   * Register a new feature flag
   */
  register<T extends FeatureFlagValue>(flag: FeatureFlag<T>): void {
    // Validate flag schema
    validateFeatureFlag(flag);

    if (this.registry[flag.key]) {
      throw new Error(`Feature flag '${flag.key}' is already registered`);
    }
    this.registry[flag.key] = flag;
  }

  /**
   * Register multiple feature flags at once
   */
  registerBulk(flags: FeatureFlag<FeatureFlagValue>[]): void {
    // Validate all flags
    validateFeatureFlags(flags);

    // Check for duplicate keys
    const keys = new Set<string>();
    flags.forEach((flag) => {
      if (this.registry[flag.key] || keys.has(flag.key)) {
        throw new Error(`Duplicate feature flag key: ${flag.key}`);
      }
      keys.add(flag.key);
    });

    // Register all flags
    flags.forEach((flag) => {
      this.registry[flag.key] = flag;
    });
  }

  /**
   * Load all registered feature flags from environment variables
   */
  load(): void {
    Object.values(this.registry).forEach((flag) => {
      try {
        const value = this.loadFlag(flag);
        this.values.set(flag.key, value);
      } catch (error) {
        if (this.config.strict) {
          throw error;
        }
        // In non-strict mode, fall back to default value
        this.values.set(flag.key, flag.defaultValue);
      }
    });
  }

  /**
   * Get the value of a feature flag
   */
  get<T extends FeatureFlagValue>(key: string): T {
    if (!this.registry[key]) {
      throw new Error(`Feature flag '${key}' is not registered`);
    }
    return (this.values.get(key) as T) ?? this.registry[key].defaultValue;
  }

  /**
   * Get all registered feature flags
   */
  getAll(): ReadonlyMap<string, FeatureFlagValue> {
    // Initialize with default values
    const allFlags = new Map<string, FeatureFlagValue>();

    // Add all registered flags with their current values or defaults
    Object.entries(this.registry).forEach(([key, flag]) => {
      allFlags.set(key, this.values.get(key) ?? flag.defaultValue);
    });

    return allFlags;
  }

  /**
   * Check if a feature flag is registered
   */
  has(key: string): boolean {
    return key in this.registry;
  }

  /**
   * Load a single feature flag from environment variables
   */
  private loadFlag<T extends FeatureFlagValue>(flag: FeatureFlag<T>): T {
    const envKey = `${this.config.envPrefix}${flag.envKey}`;
    const envValue = process.env[envKey];

    if (envValue === undefined) {
      throw new FeatureFlagError(
        FeatureFlagErrorType.MISSING_ENV_VAR,
        flag.key,
        `Environment variable '${envKey}' is not set`
      );
    }

    const parsedValue = this.parseValue(envValue, flag as FeatureFlag<FeatureFlagValue>);

    if (flag.validator && !flag.validator(parsedValue)) {
      throw new FeatureFlagError(
        FeatureFlagErrorType.VALIDATION_FAILED,
        flag.key,
        `Value '${parsedValue}' failed validation for feature flag '${flag.key}'`
      );
    }

    return parsedValue as T;
  }

  /**
   * Parse a string value from environment variable into the correct type
   */
  private parseValue(value: string, flag: FeatureFlag<FeatureFlagValue>): FeatureFlagValue {
    try {
      if (typeof flag.defaultValue === "boolean") {
        const lowerValue = value.toLowerCase();
        if (lowerValue !== "true" && lowerValue !== "false") {
          throw new Error("Invalid boolean value");
        }
        return lowerValue === "true";
      }
      if (typeof flag.defaultValue === "number") {
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error("Invalid number");
        }
        return num;
      }
      // For string values, return the raw value, including empty strings
      return value;
    } catch (error) {
      throw new FeatureFlagError(
        FeatureFlagErrorType.INVALID_VALUE,
        flag.key,
        `Failed to parse value '${value}' for feature flag '${flag.key}'`
      );
    }
  }
}
