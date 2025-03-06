/// <reference types="jest" />

import { FeatureFlag, FeatureFlagError, FeatureFlagErrorType, FeatureFlagValue } from "../types";
import { FeatureFlagManager, validators } from "../manager";

import { ValidationError } from "../schema";

// Extend NodeJS.ProcessEnv to include any string key
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
  }
}

describe("FeatureFlagManager", () => {
  let manager: FeatureFlagManager;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    manager = new FeatureFlagManager();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("constructor", () => {
    it("should initialize with default configuration", () => {
      const manager = new FeatureFlagManager();
      expect(() => manager.get("non-existent")).toThrow(
        "Feature flag 'non-existent' is not registered"
      );
    });

    it("should initialize with empty registry", () => {
      const manager = new FeatureFlagManager();
      const flag: FeatureFlag<boolean> = {
        key: "test",
        envKey: "TEST",
        description: "Test flag",
        defaultValue: false,
      };

      expect(() => manager.get("test")).toThrow();
      manager.register(flag);
      expect(manager.get("test")).toBe(false);
    });

    it("should initialize with custom configuration", () => {
      const manager = new FeatureFlagManager({
        strict: true,
        envPrefix: "CUSTOM_",
      });
      const flag: FeatureFlag<boolean> = {
        key: "test",
        envKey: "TEST",
        description: "Test flag",
        defaultValue: false,
      };

      manager.register(flag);
      process.env.CUSTOM_TEST = "true";
      manager.load();
      expect(manager.get("test")).toBe(true);
    });
  });

  describe("registration", () => {
    it("should register a feature flag", () => {
      const flag: FeatureFlag<boolean> = {
        key: "test-flag",
        envKey: "TEST_FLAG",
        description: "Test flag",
        defaultValue: false,
      };

      manager.register(flag);
      expect(manager.get("test-flag")).toBe(false);
    });

    it("should throw on duplicate registration", () => {
      const flag: FeatureFlag<boolean> = {
        key: "test-flag",
        envKey: "TEST_FLAG",
        description: "Test flag",
        defaultValue: false,
      };

      manager.register(flag);
      expect(() => manager.register(flag)).toThrow(
        "Feature flag 'test-flag' is already registered"
      );
    });

    it("should handle multiple flag registrations", () => {
      const flags: FeatureFlag<FeatureFlagValue>[] = [
        {
          key: "flag1",
          envKey: "FLAG1",
          description: "Flag 1",
          defaultValue: false,
        },
        {
          key: "flag2",
          envKey: "FLAG2",
          description: "Flag 2",
          defaultValue: 0,
        },
        {
          key: "flag3",
          envKey: "FLAG3",
          description: "Flag 3",
          defaultValue: "default",
        },
      ];

      flags.forEach((flag) => manager.register(flag));
      flags.forEach((flag) => {
        expect(manager.get(flag.key)).toBe(flag.defaultValue);
      });
    });
  });

  describe("environment variable loading", () => {
    it("should load boolean flag from environment", () => {
      const flag: FeatureFlag<boolean> = {
        key: "test-flag",
        envKey: "TEST_FLAG",
        description: "Test flag",
        defaultValue: false,
      };

      process.env.FEATURE_TEST_FLAG = "true";
      manager.register(flag);
      manager.load();

      expect(manager.get("test-flag")).toBe(true);
    });

    it("should handle boolean flag case insensitivity", () => {
      const flag: FeatureFlag<boolean> = {
        key: "test-flag",
        envKey: "TEST_FLAG",
        description: "Test flag",
        defaultValue: false,
      };

      process.env.FEATURE_TEST_FLAG = "TRUE";
      manager.register(flag);
      manager.load();
      expect(manager.get("test-flag")).toBe(true);

      process.env.FEATURE_TEST_FLAG = "False";
      manager.load();
      expect(manager.get("test-flag")).toBe(false);
    });

    it("should load number flag from environment", () => {
      const flag: FeatureFlag<number> = {
        key: "test-number",
        envKey: "TEST_NUMBER",
        description: "Test number",
        defaultValue: 0,
      };

      process.env.FEATURE_TEST_NUMBER = "42";
      manager.register(flag);
      manager.load();

      expect(manager.get("test-number")).toBe(42);
    });

    it("should handle floating point numbers", () => {
      const flag: FeatureFlag<number> = {
        key: "test-float",
        envKey: "TEST_FLOAT",
        description: "Test float",
        defaultValue: 0,
      };

      process.env.FEATURE_TEST_FLOAT = "3.14";
      manager.register(flag);
      manager.load();
      expect(manager.get("test-float")).toBe(3.14);
    });

    it("should load string flag from environment", () => {
      const flag: FeatureFlag<string> = {
        key: "test-string",
        envKey: "TEST_STRING",
        description: "Test string",
        defaultValue: "default",
      };

      process.env.FEATURE_TEST_STRING = "value";
      manager.register(flag);
      manager.load();

      expect(manager.get("test-string")).toBe("value");
    });

    it("should handle empty string values", () => {
      const flag: FeatureFlag<string> = {
        key: "test-empty",
        envKey: "TEST_EMPTY",
        description: "Test empty string",
        defaultValue: "default",
      };

      process.env.FEATURE_TEST_EMPTY = "";
      manager.register(flag);
      manager.load();
      expect(manager.get("test-empty")).toBe("");
    });
  });

  describe("validation", () => {
    it("should use custom validator", () => {
      const flag: FeatureFlag<number> = {
        key: "test-number",
        envKey: "TEST_NUMBER",
        description: "Test number",
        defaultValue: 0,
        validator: (value): value is number =>
          typeof value === "number" && value >= 0 && value <= 100,
      };

      process.env.FEATURE_TEST_NUMBER = "150";
      manager.register(flag);

      const strictManager = new FeatureFlagManager({ strict: true });
      strictManager.register(flag);

      expect(() => strictManager.load()).toThrow(FeatureFlagError);
    });

    it("should validate using built-in validators", () => {
      const numberFlag: FeatureFlag<number> = {
        key: "number-flag",
        envKey: "NUMBER_FLAG",
        description: "Number flag",
        defaultValue: 0,
        validator: validators.number,
      };

      const stringFlag: FeatureFlag<string> = {
        key: "string-flag",
        envKey: "STRING_FLAG",
        description: "String flag",
        defaultValue: "",
        validator: validators.string,
      };

      const booleanFlag: FeatureFlag<boolean> = {
        key: "boolean-flag",
        envKey: "BOOLEAN_FLAG",
        description: "Boolean flag",
        defaultValue: false,
        validator: validators.boolean,
      };

      manager.register(numberFlag);
      manager.register(stringFlag);
      manager.register(booleanFlag);

      process.env.FEATURE_NUMBER_FLAG = "42";
      process.env.FEATURE_STRING_FLAG = "test";
      process.env.FEATURE_BOOLEAN_FLAG = "true";

      manager.load();

      expect(manager.get("number-flag")).toBe(42);
      expect(manager.get("string-flag")).toBe("test");
      expect(manager.get("boolean-flag")).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should fall back to default value in non-strict mode", () => {
      const flag: FeatureFlag<number> = {
        key: "test-number",
        envKey: "TEST_NUMBER",
        description: "Test number",
        defaultValue: 0,
      };

      process.env.FEATURE_TEST_NUMBER = "invalid";
      manager.register(flag);
      manager.load();

      expect(manager.get("test-number")).toBe(0);
    });

    it("should throw in strict mode for invalid values", () => {
      const strictManager = new FeatureFlagManager({ strict: true });
      const flag: FeatureFlag<number> = {
        key: "test-number",
        envKey: "TEST_NUMBER",
        description: "Test number",
        defaultValue: 0,
      };

      process.env.FEATURE_TEST_NUMBER = "invalid";
      strictManager.register(flag);

      expect(() => strictManager.load()).toThrow(FeatureFlagError);
    });

    it("should throw for missing environment variables in strict mode", () => {
      const strictManager = new FeatureFlagManager({ strict: true });
      const flag: FeatureFlag<string> = {
        key: "test-string",
        envKey: "TEST_STRING",
        description: "Test string",
        defaultValue: "default",
      };

      strictManager.register(flag);

      try {
        strictManager.load();
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(FeatureFlagError);
        expect((error as FeatureFlagError).type).toBe(FeatureFlagErrorType.MISSING_ENV_VAR);
      }
    });

    it("should handle multiple errors in strict mode", () => {
      const strictManager = new FeatureFlagManager({ strict: true });
      const flags: FeatureFlag[] = [
        {
          key: "flag1",
          envKey: "FLAG1",
          description: "Flag 1",
          defaultValue: true,
        },
        {
          key: "flag2",
          envKey: "FLAG2",
          description: "Flag 2",
          defaultValue: false,
        },
      ];

      process.env.FEATURE_FLAG1 = "invalid";
      process.env.FEATURE_FLAG2 = "not-boolean";

      flags.forEach((flag) => strictManager.register(flag));
      expect(() => strictManager.load()).toThrow(FeatureFlagError);
    });
  });

  describe("type safety", () => {
    it("should maintain type safety when getting values", () => {
      const numberFlag: FeatureFlag<number> = {
        key: "number-flag",
        envKey: "NUMBER_FLAG",
        description: "Number flag",
        defaultValue: 42,
      };

      const stringFlag: FeatureFlag<string> = {
        key: "string-flag",
        envKey: "STRING_FLAG",
        description: "String flag",
        defaultValue: "test",
      };

      manager.register(numberFlag);
      manager.register(stringFlag);

      const numberValue: number = manager.get("number-flag");
      const stringValue: string = manager.get("string-flag");

      expect(typeof numberValue).toBe("number");
      expect(typeof stringValue).toBe("string");
    });
  });

  describe("schema validation", () => {
    it("should validate flag key format", () => {
      const flag: FeatureFlag<boolean> = {
        key: "INVALID-KEY!",
        envKey: "TEST_FLAG",
        description: "Test flag",
        defaultValue: false,
      };

      expect(() => manager.register(flag)).toThrow(ValidationError);
    });

    it("should validate environment key format", () => {
      const flag: FeatureFlag<boolean> = {
        key: "test-flag",
        envKey: "invalid-env-key",
        description: "Test flag",
        defaultValue: false,
      };

      expect(() => manager.register(flag)).toThrow(ValidationError);
    });

    it("should validate description length", () => {
      const flag: FeatureFlag<boolean> = {
        key: "test-flag",
        envKey: "TEST_FLAG",
        description: "",
        defaultValue: false,
      };

      expect(() => manager.register(flag)).toThrow(ValidationError);
    });

    it("should validate value types", () => {
      const flag = {
        key: "test-flag",
        envKey: "TEST_FLAG",
        description: "Test flag",
        defaultValue: { invalid: "type" },
      };

      expect(() => manager.register(flag as any)).toThrow(ValidationError);
    });
  });

  describe("bulk registration", () => {
    it("should register multiple flags", () => {
      const flags: FeatureFlag<FeatureFlagValue>[] = [
        {
          key: "flag1",
          envKey: "FLAG1",
          description: "Flag 1",
          defaultValue: false,
        },
        {
          key: "flag2",
          envKey: "FLAG2",
          description: "Flag 2",
          defaultValue: 0,
        },
        {
          key: "flag3",
          envKey: "FLAG3",
          description: "Flag 3",
          defaultValue: "default",
        },
      ];

      manager.registerBulk(flags);
      flags.forEach((flag) => {
        expect(manager.has(flag.key)).toBe(true);
        expect(manager.get(flag.key)).toBe(flag.defaultValue);
      });
    });

    it("should validate all flags in bulk registration", () => {
      const flags = [
        {
          key: "valid-flag",
          envKey: "VALID_FLAG",
          description: "Valid flag",
          defaultValue: false,
        },
        {
          key: "INVALID-KEY!",
          envKey: "VALID_FLAG",
          description: "Invalid flag",
          defaultValue: false,
        },
      ];

      expect(() => manager.registerBulk(flags as any[])).toThrow(ValidationError);
      expect(manager.has("valid-flag")).toBe(false);
    });

    it("should prevent duplicate keys in bulk registration", () => {
      const flags: FeatureFlag<FeatureFlagValue>[] = [
        {
          key: "duplicate",
          envKey: "FLAG1",
          description: "Flag 1",
          defaultValue: false,
        },
        {
          key: "duplicate",
          envKey: "FLAG2",
          description: "Flag 2",
          defaultValue: true,
        },
      ];

      expect(() => manager.registerBulk(flags)).toThrow("Duplicate feature flag key: duplicate");
    });

    it("should prevent registration of existing keys", () => {
      const existingFlag: FeatureFlag<boolean> = {
        key: "existing",
        envKey: "EXISTING",
        description: "Existing flag",
        defaultValue: false,
      };

      const newFlags: FeatureFlag<FeatureFlagValue>[] = [
        {
          key: "new-flag",
          envKey: "NEW_FLAG",
          description: "New flag",
          defaultValue: true,
        },
        {
          key: "existing",
          envKey: "DUPLICATE",
          description: "Duplicate flag",
          defaultValue: true,
        },
      ];

      manager.register(existingFlag);
      expect(() => manager.registerBulk(newFlags)).toThrow("Duplicate feature flag key: existing");
      expect(manager.has("new-flag")).toBe(false);
    });
  });

  describe("utility methods", () => {
    it("should check flag existence", () => {
      const flag: FeatureFlag<boolean> = {
        key: "test-flag",
        envKey: "TEST_FLAG",
        description: "Test flag",
        defaultValue: false,
      };

      expect(manager.has("test-flag")).toBe(false);
      manager.register(flag);
      expect(manager.has("test-flag")).toBe(true);
    });

    it("should get all registered flags", () => {
      const flags: FeatureFlag<FeatureFlagValue>[] = [
        {
          key: "flag1",
          envKey: "FLAG1",
          description: "Flag 1",
          defaultValue: false,
        },
        {
          key: "flag2",
          envKey: "FLAG2",
          description: "Flag 2",
          defaultValue: 0,
        },
      ];

      manager.registerBulk(flags);
      const allFlags = manager.getAll();

      expect(allFlags.size).toBe(2);
      expect(allFlags.get("flag1")).toBe(false);
      expect(allFlags.get("flag2")).toBe(0);
    });
  });
});
