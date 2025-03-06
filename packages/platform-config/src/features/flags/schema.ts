import { FeatureFlagValue } from "./types";
import { z } from "zod";

/**
 * Schema for feature flag key validation
 */
export const flagKeySchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, {
    message: "Flag key must contain only lowercase letters, numbers, and hyphens",
  });

/**
 * Schema for environment variable key validation
 */
export const envKeySchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[A-Z0-9_]+$/, {
    message: "Environment key must contain only uppercase letters, numbers, and underscores",
  });

/**
 * Schema for feature flag description validation
 */
export const descriptionSchema = z.string().min(1).max(500);

/**
 * Schema for feature flag value validation
 */
export const valueSchema = z.union([z.boolean(), z.number(), z.string()]);

/**
 * Schema for custom validator function
 */
export const validatorSchema = z.function().args(z.unknown()).returns(z.boolean()).optional();

/**
 * Schema for a single feature flag
 */
export const featureFlagSchema = z.object({
  key: flagKeySchema,
  envKey: envKeySchema,
  description: descriptionSchema,
  defaultValue: valueSchema,
  validator: validatorSchema,
});

/**
 * Schema for bulk feature flag registration
 */
export const bulkFeatureFlagSchema = z.array(featureFlagSchema);

/**
 * Type inference helpers
 */
export type FeatureFlagSchema = z.infer<typeof featureFlagSchema>;
export type BulkFeatureFlagSchema = z.infer<typeof bulkFeatureFlagSchema>;

/**
 * Validation error aggregator
 */
export class ValidationError extends Error {
  constructor(
    public readonly errors: z.ZodError[],
    message: string = "Feature flag validation failed"
  ) {
    super(message);
    this.name = "ValidationError";
  }

  /**
   * Get formatted error messages
   */
  getFormattedErrors(): string[] {
    return this.errors.flatMap((error) =>
      error.errors.map((e) => `${e.path.join(".")}: ${e.message}`)
    );
  }
}

/**
 * Validate a single feature flag
 */
export function validateFeatureFlag<T extends FeatureFlagValue>(
  flag: unknown
): asserts flag is FeatureFlagSchema & { defaultValue: T } {
  try {
    featureFlagSchema.parse(flag);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError([error]);
    }
    throw error;
  }
}

/**
 * Validate multiple feature flags
 */
export function validateFeatureFlags(
  flags: unknown[]
): asserts flags is (FeatureFlagSchema & { defaultValue: FeatureFlagValue })[] {
  const errors: z.ZodError[] = [];

  flags.forEach((flag, index) => {
    try {
      featureFlagSchema.parse(flag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Add array index to error path
        error.errors.forEach((e) => {
          e.path.unshift(index.toString());
        });
        errors.push(error);
      } else {
        throw error;
      }
    }
  });

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
}
