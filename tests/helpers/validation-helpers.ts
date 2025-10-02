/**
 * Test helper utilities for validation testing
 * Reduces complexity in validation test files
 */

import { ZodSchema } from 'zod';

/**
 * Test that a schema validates successfully with given data
 */
export function expectValidationSuccess<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Expected validation to succeed but got errors: ${JSON.stringify(result.error.format())}`
    );
  }
  return result.data;
}

/**
 * Test that a schema validation fails with given data
 */
export function expectValidationFailure<T>(
  schema: ZodSchema<T>,
  data: unknown,
  expectedErrorPath?: string
): void {
  const result = schema.safeParse(data);
  if (result.success) {
    throw new Error(
      `Expected validation to fail but it succeeded with data: ${JSON.stringify(result.data)}`
    );
  }

  if (expectedErrorPath) {
    const hasExpectedError = result.error.errors.some(
      (err) => err.path.join('.') === expectedErrorPath
    );
    if (!hasExpectedError) {
      throw new Error(
        `Expected error at path '${expectedErrorPath}' but got errors at: ${result.error.errors.map((e) => e.path.join('.')).join(', ')}`
      );
    }
  }
}

/**
 * Test that a schema accepts all values from an array
 */
export function expectAllValid<T>(
  schema: ZodSchema<T>,
  values: unknown[]
): void {
  values.forEach((value) => {
    expectValidationSuccess(schema, value);
  });
}

/**
 * Test that a schema rejects all values from an array
 */
export function expectAllInvalid<T>(
  schema: ZodSchema<T>,
  values: unknown[]
): void {
  values.forEach((value) => {
    expectValidationFailure(schema, value);
  });
}
