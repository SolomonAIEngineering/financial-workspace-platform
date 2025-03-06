import {
  EnvironmentConfig,
  FeatureFlag,
  FeatureFlagError,
  FeatureFlagErrorType,
  FeatureFlagGroup,
  FeatureFlagValue,
  isEnvironmentConfig,
  isFeatureFlag,
  isFeatureFlagGroup,
} from "./types";

/**
 * Default environment configuration
 */
export const defaultEnvironmentConfig: Required<EnvironmentConfig> = {
  NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig["NODE_ENV"]) || "development",
  LOG_LEVEL: (process.env.LOG_LEVEL as EnvironmentConfig["LOG_LEVEL"]) || "info",
  FEATURE_PREFIX: process.env.FEATURE_PREFIX || "FEATURE_",
};

/**
 * Environment-specific feature flag defaults
 */
export const environmentDefaults: Record<
  keyof typeof defaultEnvironmentConfig,
  Partial<Record<string, FeatureFlagValue>>
> = {
  NODE_ENV: {},
  LOG_LEVEL: {},
  FEATURE_PREFIX: {},
};

/**
 * Default feature flag groups
 */
export const defaultFeatureGroups: FeatureFlagGroup[] = [
  {
    name: "core",
    description: "Core system features",
    flags: [
      {
        key: "debug-mode",
        envKey: "DEBUG_MODE",
        description: "Enable debug mode",
        defaultValue: false,
        environments: {
          NODE_ENV: "development",
        },
      } as FeatureFlag<boolean>,
      {
        key: "log-level",
        envKey: "LOG_LEVEL",
        description: "Application log level",
        defaultValue: "info",
        environments: {
          NODE_ENV: "development",
        },
      } as FeatureFlag<string>,
    ],
  },
  {
    name: "api",
    description: "API-related features",
    flags: [
      {
        key: "api-timeout",
        envKey: "API_TIMEOUT",
        description: "API request timeout in milliseconds",
        defaultValue: 10000,
        validator: (value): value is number =>
          typeof value === "number" && value > 0 && value <= 60000,
      } as FeatureFlag<number>,
    ],
  },
];

/**
 * Configuration initialization options
 */
export interface ConfigInitOptions {
  environment?: EnvironmentConfig["NODE_ENV"];
  groups?: FeatureFlagGroup[];
  overrides?: Record<string, FeatureFlagValue>;
  strict?: boolean;
}

/**
 * Initialize configuration with environment-specific defaults
 */
export function initializeConfig(options: ConfigInitOptions = {}): {
  environment: Required<EnvironmentConfig>;
  flags: FeatureFlag<FeatureFlagValue>[];
} {
  const environment: Required<EnvironmentConfig> = {
    ...defaultEnvironmentConfig,
    NODE_ENV: options.environment || defaultEnvironmentConfig.NODE_ENV,
  };

  if (!isEnvironmentConfig(environment)) {
    throw new FeatureFlagError(
      FeatureFlagErrorType.INVALID_ENVIRONMENT,
      "environment",
      `Invalid environment configuration: ${JSON.stringify(environment)}`
    );
  }

  const groups = options.groups || defaultFeatureGroups;
  if (!groups.every(isFeatureFlagGroup)) {
    throw new FeatureFlagError(
      FeatureFlagErrorType.INVALID_CONFIG,
      "groups",
      "Invalid feature flag group configuration"
    );
  }

  // Collect all flags from groups
  const flags = groups.flatMap((group) => group.flags);

  // Apply environment-specific defaults
  flags.forEach((flag) => {
    if (flag.environments?.NODE_ENV !== undefined) {
      flag.defaultValue = flag.environments.NODE_ENV as unknown as typeof flag.defaultValue;
    }
  });

  // Apply overrides
  if (options.overrides) {
    Object.entries(options.overrides).forEach(([key, value]) => {
      const flag = flags.find((f) => f.key === key);
      if (flag) {
        if (flag.validator && !flag.validator(value)) {
          throw new FeatureFlagError(
            FeatureFlagErrorType.VALIDATION_FAILED,
            key,
            `Override value failed validation for flag '${key}'`
          );
        }
        flag.defaultValue = value as typeof flag.defaultValue;
      }
    });
  }

  return { environment, flags };
}

/**
 * Load environment variables for configuration
 */
export function loadEnvironmentVariables(
  prefix: string = defaultEnvironmentConfig.FEATURE_PREFIX
): Record<string, string> {
  const vars: Record<string, string> = {};

  Object.entries(process.env).forEach(([key, value]) => {
    if (key.startsWith(prefix) && value !== undefined) {
      const flagKey = key.slice(prefix.length).toLowerCase().replace(/_/g, "-");
      vars[flagKey] = value;
    }
  });

  return vars;
}

/**
 * Validate configuration
 */
export function validateConfiguration(
  flags: FeatureFlag<FeatureFlagValue>[],
  environment: Required<EnvironmentConfig>
): void {
  // Check for duplicate keys
  const keys = new Set<string>();
  flags.forEach((flag) => {
    if (keys.has(flag.key)) {
      throw new FeatureFlagError(
        FeatureFlagErrorType.INVALID_CONFIG,
        flag.key,
        `Duplicate feature flag key: ${flag.key}`
      );
    }
    keys.add(flag.key);
  });

  // Validate each flag
  flags.forEach((flag) => {
    if (!isFeatureFlag(flag)) {
      throw new FeatureFlagError(
        FeatureFlagErrorType.INVALID_CONFIG,
        (flag as { key?: string }).key ?? "unknown",
        `Invalid feature flag configuration: ${JSON.stringify(flag)}`
      );
    }

    // Validate environment-specific values
    if (flag.environments) {
      Object.entries(flag.environments).forEach(([env, value]) => {
        if (flag.validator && !flag.validator(value)) {
          throw new FeatureFlagError(
            FeatureFlagErrorType.VALIDATION_FAILED,
            flag.key,
            `Environment-specific value failed validation for flag '${flag.key}' in environment '${env}'`
          );
        }
      });
    }
  });
}
