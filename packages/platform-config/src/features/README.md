# Features

This package provides a flexible and type-safe feature flag management system.

## Feature Flags

Feature flags support three value types:

- `boolean`: For toggle features
- `number`: For numeric configurations
- `string`: For text-based configurations

### Basic Usage

```typescript
import { FeatureFlagManager } from "./flags";

// Create a manager instance
const manager = new FeatureFlagManager({
  strict: false, // Set to true to throw errors on invalid values
  envPrefix: "FEATURE_", // Default prefix for environment variables
});

// Register a boolean flag
manager.register({
  key: "dark-mode",
  envKey: "DARK_MODE",
  description: "Enable dark mode",
  defaultValue: false,
});

// Register a numeric flag
manager.register({
  key: "api-timeout",
  envKey: "API_TIMEOUT",
  description: "API timeout in milliseconds",
  defaultValue: 5000,
  validator: (value): value is number => typeof value === "number" && value > 0 && value <= 60000,
});

// Load values from environment
manager.load();

// Get flag values
const isDarkMode = manager.get("dark-mode"); // boolean
const timeout = manager.get("api-timeout"); // number
```

### Type Safety

The system provides full type safety:

```typescript
import { FeatureFlag, FeatureFlagValue } from "./flags/types";

// Type-safe flag definition
const flag: FeatureFlag<number> = {
  key: "max-items",
  envKey: "MAX_ITEMS",
  description: "Maximum number of items",
  defaultValue: 100,
};

// Type-safe bulk registration
const flags: FeatureFlag<FeatureFlagValue>[] = [
  {
    key: "feature-a",
    envKey: "FEATURE_A",
    description: "Feature A",
    defaultValue: true,
  },
  {
    key: "max-retries",
    envKey: "MAX_RETRIES",
    description: "Maximum retry attempts",
    defaultValue: 3,
  },
];

manager.registerBulk(flags);
```

### Validation

The system includes built-in validators and supports custom validation:

```typescript
import { validators } from "./flags";

const flag: FeatureFlag<number> = {
  key: "port",
  envKey: "PORT",
  description: "Server port",
  defaultValue: 3000,
  validator: (value): value is number =>
    validators.number(value) && value >= 1000 && value <= 65535,
};
```

### Environment Variables

Feature flags are configured through environment variables:

```bash
# Boolean flags (case-insensitive)
FEATURE_DARK_MODE=true
FEATURE_BETA_FEATURES=false

# Numeric flags
FEATURE_MAX_ITEMS=50
FEATURE_API_TIMEOUT=10000

# String flags
FEATURE_API_URL=https://api.example.com
```

### Naming Conventions

- Flag keys: `lowercase-with-hyphens`
- Environment keys: `UPPERCASE_WITH_UNDERSCORES`
- Environment prefix: `FEATURE_` (configurable)

### Error Handling

In strict mode, the manager throws `FeatureFlagError` for:

- Missing environment variables
- Invalid value types
- Failed validations
- Configuration errors

```typescript
try {
  manager.load();
} catch (error) {
  if (error instanceof FeatureFlagError) {
    console.error(`Error type: ${error.type}`);
    console.error(`Flag key: ${error.flagKey}`);
    console.error(`Message: ${error.message}`);
  }
}
```

### Feature Groups

Organize related flags into groups:

```typescript
const groups: FeatureFlagGroup[] = [
  {
    name: "api",
    description: "API-related features",
    flags: [
      {
        key: "api-timeout",
        envKey: "API_TIMEOUT",
        description: "API timeout in milliseconds",
        defaultValue: 5000,
      },
    ],
  },
];

const config = initializeConfig({ groups });
```

### Environment-Specific Defaults

Configure different defaults for different environments:

```typescript
const flag: FeatureFlag<boolean> = {
  key: "debug-mode",
  envKey: "DEBUG_MODE",
  description: "Enable debug mode",
  defaultValue: false,
  environments: {
    NODE_ENV: "development", // Enabled in development
  },
};
```
