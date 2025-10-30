/**
 * Shared helpers for character API routes
 */

import { NextResponse } from 'next/server';
import { ApiErrors } from './common';

export const handleCharacterNotFound = (error: unknown): NextResponse | null => {
  if (
    error instanceof RangeError &&
    error.message === 'Character not found'
  ) {
    return ApiErrors.notFound('Character not found');
  }
  return null;
};

export const handleCharacterErrors = (
  endpoint: string,
  error: unknown
): void => {
  console.error(`${endpoint} error:`, error);
  throw error;
};
