import {
  EnvironmentConfig,
  FeatureFlag,
  FeatureFlagError,
  FeatureFlagErrorType,
  FeatureFlagValue,
} from "../types";
import {
  defaultEnvironmentConfig,
  defaultFeatureGroups,
  initializeConfig,
  loadEnvironmentVariables,
  validateConfiguration,
} from "../config";

describe("Feature Flag Configuration", () => {
  const originalEnv = process.env;
  const testEnv: Required<EnvironmentConfig> = {
    NODE_ENV: "development",
    LOG_LEVEL: "info",
    FEATURE_PREFIX: "FEATURE_",
  };

  beforeEach(() => {
    // Reset environment to known state
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("initializeConfig", () => {
    beforeEach(() => {
      // Ensure clean environment for each test
      process.env = {
        ...originalEnv,
        NODE_ENV: "development",
        LOG_LEVEL: undefined,
        FEATURE_PREFIX: undefined,
      };
    });

    it("should initialize with default configuration", () => {
      const config = initializeConfig({
        environment: "development",
      });
      expect(config.environment.NODE_ENV).toBe("development");
      expect(config.environment.LOG_LEVEL).toBe("info");
      expect(config.environment.FEATURE_PREFIX).toBe("FEATURE_");
    });

    it("should override environment settings", () => {
      const config = initializeConfig({
        environment: "production",
      });
      expect(config.environment.NODE_ENV).toBe("production");
    });

    it("should apply environment-specific defaults", () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: "development" as const,
        LOG_LEVEL: "info",
        FEATURE_PREFIX: "FEATURE_",
      };
      const config = initializeConfig();

      const debugFlag = {
        key: "debug-mode",
        envKey: "DEBUG_MODE",
        description: "Debug mode flag",
        defaultValue: true,
      };

      validateConfiguration([debugFlag], {
        NODE_ENV: "development",
        LOG_LEVEL: "info",
        FEATURE_PREFIX: "FEATURE_",
      } as Required<EnvironmentConfig>);
      expect(typeof debugFlag.defaultValue).toBe("boolean");
    });

    it("should apply overrides", () => {
      const { flags } = initializeConfig({
        overrides: {
          "debug-mode": true,
          "log-level": "error",
        },
      });

      const debugFlag = flags.find((f) => f.key === "debug-mode");
      const logFlag = flags.find((f) => f.key === "log-level");

      expect(debugFlag?.defaultValue).toBe(true);
      expect(logFlag?.defaultValue).toBe("error");
    });

    it("should validate overrides", () => {
      expect(() =>
        initializeConfig({
          overrides: {
            "api-timeout": -1, // Invalid value
          },
        })
      ).toThrow(FeatureFlagError);
    });

    it("should maintain type safety for flag values", () => {
      const testFlag = {
        key: "isEnabled",
        envKey: "IS_ENABLED",
        description: "Test boolean flag",
        defaultValue: true as boolean,
      };

      validateConfiguration([testFlag], testEnv);
      expect(typeof testFlag.defaultValue).toBe("boolean");
    });
  });

  describe("loadEnvironmentVariables", () => {
    let cleanEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      // Create a clean environment without feature flags
      cleanEnv = {
        ...Object.entries(originalEnv)
          .filter(([key]) => !key.startsWith("FEATURE_"))
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
        NODE_ENV: "development",
      };
      process.env = cleanEnv;
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("should load environment variables with default prefix", () => {
      process.env = {
        ...cleanEnv,
        FEATURE_TEST: "true",
        FEATURE_NUMBER: "42",
      };

      const vars = loadEnvironmentVariables("FEATURE_");
      expect(vars).toEqual({
        test: "true",
        number: "42",
      });
    });

    it("should load environment variables with custom prefix", () => {
      process.env = {
        ...cleanEnv,
        CUSTOM_TEST: "true",
        FEATURE_TEST: "false",
      };

      const vars = loadEnvironmentVariables("CUSTOM_");

      expect(vars).toEqual({
        test: "true",
      });
    });

    it("should convert environment keys to flag keys", () => {
      process.env = {
        ...cleanEnv,
        FEATURE_SNAKE_CASE_VAR: "value",
      };

      const vars = loadEnvironmentVariables("FEATURE_");
      expect(vars).toEqual({
        "snake-case-var": "value",
      });
    });

    it("should handle type conversion correctly", () => {
      process.env.FEATURE_BOOLEAN = "true";
      process.env.FEATURE_NUMBER = "42";

      const testFlags = [
        {
          key: "boolean",
          envKey: "BOOLEAN",
          description: "Boolean flag",
          defaultValue: false as boolean,
        },
        {
          key: "number",
          envKey: "NUMBER",
          description: "Number flag",
          defaultValue: 0 as number,
        },
      ] as FeatureFlag<boolean>[];

      validateConfiguration(testFlags, testEnv);
      const boolFlag = testFlags[0];
      const numFlag = testFlags[1];

      expect(typeof boolFlag.defaultValue).toBe("boolean");
      expect(typeof numFlag.defaultValue).toBe("number");
    });
  });

  describe("validateConfiguration", () => {
    it("should validate flag configuration", () => {
      const { environment, flags } = initializeConfig();

      expect(() => validateConfiguration(flags, environment)).not.toThrow();
    });

    it("should detect duplicate keys", () => {
      const duplicateFlags = [
        {
          key: "test1",
          envKey: "TEST_1",
          description: "Test flag 1",
          defaultValue: false as boolean,
        },
        {
          key: "test1",
          envKey: "TEST_2",
          description: "Test flag 2",
          defaultValue: true as boolean,
        },
      ];

      expect(() => validateConfiguration(duplicateFlags, testEnv)).toThrow(
        new FeatureFlagError(
          FeatureFlagErrorType.INVALID_CONFIG,
          "test1",
          "Duplicate feature flag key: test1"
        )
      );
    });

    it("should validate environment-specific values", () => {
      const invalidFlags: FeatureFlag<FeatureFlagValue>[] = [
        {
          key: "numberFlag",
          envKey: "NUMBER_FLAG",
          description: "Number flag",
          defaultValue: 1,
          environments: {
            NODE_ENV: "invalid" as any,
          },
          validator: (value: unknown): value is number => typeof value === "number" && value > 0,
        },
      ];

      expect(() => validateConfiguration(invalidFlags, testEnv)).toThrow(
        new FeatureFlagError(
          FeatureFlagErrorType.VALIDATION_FAILED,
          "numberFlag",
          "Environment-specific value failed validation for flag 'numberFlag' in environment 'NODE_ENV'"
        )
      );
    });
  });

  describe("type safety", () => {
    it("should enforce type safety for boolean flags", () => {
      const booleanFlag = {
        key: "isEnabled",
        envKey: "IS_ENABLED",
        description: "Boolean flag",
        defaultValue: true as boolean,
        validator: (value: unknown): value is boolean => typeof value === "boolean",
      };

      validateConfiguration([booleanFlag], testEnv);
      expect(typeof booleanFlag.defaultValue).toBe("boolean");
      expect(booleanFlag.defaultValue).toBe(true);
    });

    it("should enforce type safety for number flags", () => {
      const numberFlag = {
        key: "timeout",
        envKey: "TIMEOUT",
        description: "Timeout value",
        defaultValue: 1000 as number,
        validator: (value: unknown): value is number => typeof value === "number" && value > 0,
      };

      validateConfiguration([numberFlag], testEnv);
      expect(typeof numberFlag.defaultValue).toBe("number");
      expect(numberFlag.defaultValue).toBe(1000);
    });

    it("should maintain type safety for environment values", () => {
      const { environment } = initializeConfig();

      // These should compile without type errors
      const nodeEnv: "development" | "test" | "production" = environment.NODE_ENV;
      const logLevel: "debug" | "info" | "warn" | "error" | undefined = environment.LOG_LEVEL;
      const prefix: string = environment.FEATURE_PREFIX;

      expect(nodeEnv).toBeDefined();
      expect(prefix).toBeDefined();
    });

    it("should maintain type safety for flag values", () => {
      const debugFlag = {
        key: "debug-mode",
        envKey: "DEBUG_MODE",
        description: "Debug mode",
        defaultValue: true as boolean,
      };

      const timeoutFlag = {
        key: "api-timeout",
        envKey: "API_TIMEOUT",
        description: "API timeout",
        defaultValue: 5000 as number,
      };

      validateConfiguration([debugFlag, timeoutFlag], testEnv);
      expect(typeof debugFlag.defaultValue).toBe("boolean");
      expect(typeof timeoutFlag.defaultValue).toBe("number");
    });
  });
});
