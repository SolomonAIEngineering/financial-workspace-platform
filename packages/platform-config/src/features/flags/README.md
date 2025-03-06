# Feature Flag System

A type-safe, environment-variable-based feature flag system with runtime validation and Zod schema support.

## End-to-End Example

Here's a complete example showing how to set up and use feature flags in a real application:

```typescript
// src/config/feature-flags.ts
import { FeatureFlagManager, FeatureFlag, FeatureFlagValue } from '@polar-sh/platform-config';

// 1. Define your feature flags with types
interface AppFeatureFlags {
  'dark-mode': boolean;
  'api-timeout': number;
  'api-url': string;
  'max-items': number;
}

// 2. Create flag definitions
const featureFlags: Record<keyof AppFeatureFlags, FeatureFlag<FeatureFlagValue>> = {
  'dark-mode': {
    key: 'dark-mode',
    envKey: 'DARK_MODE',
    description: 'Enable dark mode theme',
    defaultValue: false,
    validator: (value): value is boolean => typeof value === 'boolean'
  },
  'api-timeout': {
    key: 'api-timeout',
    envKey: 'API_TIMEOUT',
    description: 'API request timeout in milliseconds',
    defaultValue: 5000,
    validator: (value): value is number =>
      typeof value === 'number' && value >= 1000 && value <= 30000
  },
  'api-url': {
    key: 'api-url',
    envKey: 'API_URL',
    description: 'API base URL',
    defaultValue: 'https://api.default.com',
    validator: (value): value is string =>
      typeof value === 'string' && value.startsWith('https://')
  },
  'max-items': {
    key: 'max-items',
    envKey: 'MAX_ITEMS',
    description: 'Maximum items per page',
    defaultValue: 10,
    validator: (value): value is number =>
      typeof value === 'number' && value > 0 && value <= 100
  }
};

// 3. Initialize the manager
const manager = new FeatureFlagManager({
  strict: process.env.NODE_ENV === 'development',
  envPrefix: 'FEATURE_'
});

// 4. Register all flags
manager.registerBulk(Object.values(featureFlags));

// 5. Load values from environment
manager.load();

// 6. Create a type-safe getter
function getFlag<K extends keyof AppFeatureFlags>(key: K): AppFeatureFlags[K] {
  return manager.get(key);
}

export { manager, getFlag };

// src/config/.env
// Environment variables setup
FEATURE_DARK_MODE=true
FEATURE_API_TIMEOUT=15000
FEATURE_API_URL=https://api.production.com
FEATURE_MAX_ITEMS=50

// src/components/App.tsx
import { getFlag } from '../config/feature-flags';

function App() {
  // 7. Use the flags in your application
  const isDarkMode = getFlag('dark-mode');
  const apiTimeout = getFlag('api-timeout');
  const apiUrl = getFlag('api-url');
  const maxItems = getFlag('max-items');

  // Example API call using the flags
  async function fetchItems() {
    try {
      const response = await fetch(`${apiUrl}/items?limit=${maxItems}`, {
        signal: AbortSignal.timeout(apiTimeout)
      });

      if (!response.ok) throw new Error('Failed to fetch items');

      const items = await response.json();
      return items;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }

  // Example theme application
  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className={isDarkMode ? 'dark' : 'light'}>
      {/* Your app content */}
    </div>
  );
}

// src/config/feature-flags.test.ts
import { manager, getFlag } from './feature-flags';

describe('Feature Flags', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.FEATURE_DARK_MODE = 'true';
    process.env.FEATURE_API_TIMEOUT = '15000';
    process.env.FEATURE_MAX_ITEMS = '50';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('loads boolean flag correctly', () => {
    expect(getFlag('dark-mode')).toBe(true);
  });

  test('loads number flag correctly', () => {
    expect(getFlag('api-timeout')).toBe(15000);
  });

  test('falls back to default value when env var is missing', () => {
    delete process.env.FEATURE_DARK_MODE;
    manager.load();
    expect(getFlag('dark-mode')).toBe(false);
  });

  test('validates flag values', () => {
    process.env.FEATURE_API_TIMEOUT = '999'; // Below minimum
    expect(() => manager.load()).toThrow();
  });
});
```

This example demonstrates:

1. Type-safe feature flag definitions
2. Environment-based configuration
3. Custom validation rules
4. Integration with React components
5. Error handling
6. Unit testing
7. Default values and fallbacks
8. Runtime validation

The setup provides:

- Type safety throughout the application
- Runtime validation of flag values
- Environment-specific defaults
- Easy testing capabilities
- Clean integration with application code

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Validation Rules](#validation-rules)
- [Error Handling](#error-handling)
- [Testing Guide](#testing-guide)
- [Examples](#examples)

## Installation

```bash
# If using npm
npm install @polar-sh/platform-config

# If using yarn
yarn add @polar-sh/platform-config

# If using pnpm
pnpm add @polar-sh/platform-config
```

## Quick Start

```typescript
import { FeatureFlagManager } from "@polar-sh/platform-config";

// Create a feature flag manager
const manager = new FeatureFlagManager();

// Define a feature flag
const darkModeFlag = {
  key: "dark-mode",
  envKey: "DARK_MODE",
  description: "Enable dark mode theme",
  defaultValue: false,
};

// Register the flag
manager.register(darkModeFlag);

// Load values from environment variables
manager.load();

// Use the feature flag
if (manager.get("dark-mode")) {
  // Dark mode is enabled
}
```

## Configuration

### Manager Configuration

```typescript
const manager = new FeatureFlagManager({
  // Throw errors instead of using default values
  strict: true,

  // Custom environment variable prefix (default: "FEATURE_")
  envPrefix: "APP_FEATURE_",
});
```

### Feature Flag Definition

```typescript
// Boolean flag
const booleanFlag = {
  key: "dark-mode",          // Lowercase with hyphens
  envKey: "DARK_MODE",       // Uppercase with underscores
  description: "Dark mode",  // Human-readable description
  defaultValue: false,       // Default when env var is missing
  validator?: (value) => boolean, // Optional custom validation
};

// Number flag
const numberFlag = {
  key: "max-items",
  envKey: "MAX_ITEMS",
  description: "Maximum items per page",
  defaultValue: 10,
  validator: (value): value is number =>
    typeof value === "number" && value > 0 && value <= 100,
};

// String flag
const stringFlag = {
  key: "api-url",
  envKey: "API_URL",
  description: "API endpoint URL",
  defaultValue: "https://api.default.com",
  validator: (value): value is string =>
    typeof value === "string" && value.startsWith("https://"),
};
```

## API Reference

### Registration Methods

```typescript
// Single flag registration
manager.register(flag);

// Bulk registration
manager.registerBulk([flag1, flag2, flag3]);
```

### Flag Management

```typescript
// Get a flag value
const value = manager.get("flag-key");

// Check if a flag exists
const exists = manager.has("flag-key");

// Get all flags
const allFlags = manager.getAll();

// Load values from environment
manager.load();
```

### Built-in Validators

```typescript
import { validators } from "@polar-sh/platform-config";

const flag = {
  // ...
  validator: validators.boolean, // or .string, .number
};
```

## Environment Variables

Feature flags are configured through environment variables:

```bash
# Format: ${envPrefix}${envKey}
FEATURE_DARK_MODE=true
FEATURE_MAX_ITEMS=50
FEATURE_API_URL=https://api.example.com
```

### Naming Convention

- Prefix: `FEATURE_` (configurable)
- Key: Uppercase with underscores
- Example: `FEATURE_DARK_MODE`

## Validation Rules

### Key Validation

- Flag keys: `^[a-z0-9-]+$`

  - Lowercase letters
  - Numbers
  - Hyphens
  - Example: `dark-mode`

- Environment keys: `^[A-Z0-9_]+$`
  - Uppercase letters
  - Numbers
  - Underscores
  - Example: `DARK_MODE`

### Value Validation

- Boolean: `"true"` or `"false"` (case-insensitive)
- Number: Valid number string (including decimals)
- String: Any string value (including empty string)

## Error Handling

### Error Types

1. `ValidationError`: Schema validation failures
2. `FeatureFlagError`: Runtime errors
   - `MISSING_ENV_VAR`
   - `INVALID_VALUE`
   - `VALIDATION_FAILED`

### Error Handling Example

```typescript
try {
  manager.load();
} catch (error) {
  if (error instanceof ValidationError) {
    // Schema validation error
    console.error(error.getFormattedErrors());
  } else if (error instanceof FeatureFlagError) {
    // Runtime error
    console.error(`${error.type}: ${error.message}`);
  }
}
```

## Testing Guide

### Test Setup

```typescript
describe("Feature Flags", () => {
  let manager: FeatureFlagManager;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    manager = new FeatureFlagManager();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Tests...
});
```

### Testing Scenarios

```typescript
// Registration
test("register flag", () => {
  manager.register(flag);
  expect(manager.has(flag.key)).toBe(true);
});

// Environment variables
test("load from env", () => {
  process.env.FEATURE_TEST = "true";
  manager.register(flag);
  manager.load();
  expect(manager.get(flag.key)).toBe(true);
});

// Validation
test("validate flag", () => {
  const invalidFlag = {
    /* ... */
  };
  expect(() => manager.register(invalidFlag)).toThrow(ValidationError);
});
```

## Examples

### Feature Flag Groups

```typescript
const flags = {
  darkMode: {
    key: "dark-mode",
    envKey: "DARK_MODE",
    description: "Dark mode theme",
    defaultValue: false,
  },
  maxItems: {
    key: "max-items",
    envKey: "MAX_ITEMS",
    description: "Items per page",
    defaultValue: 10,
    validator: (value): value is number => typeof value === "number" && value > 0,
  },
};

manager.registerBulk(Object.values(flags));
```

### Type-Safe Usage

```typescript
// Type inference
const maxItems: number = manager.get("max-items");
const darkMode: boolean = manager.get("dark-mode");

// With custom types
interface AppFlags {
  "dark-mode": boolean;
  "max-items": number;
}

function getFlag<K extends keyof AppFlags>(key: K): AppFlags[K] {
  return manager.get(key);
}
```

### Integration Example

```typescript
// config/feature-flags.ts
export const manager = new FeatureFlagManager({
  strict: process.env.NODE_ENV === "development",
});

export const flags = {
  // ... flag definitions
};

manager.registerBulk(Object.values(flags));
manager.load();

// Usage
import { manager } from "./config/feature-flags";

if (manager.get("dark-mode")) {
  applyDarkTheme();
}
```
