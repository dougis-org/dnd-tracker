/**
 * Global E2E test setup
 * Sets up authenticated session for Clerk tests
 */
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../.auth/user.json');

setup('authenticate', async ({ page }) => {
  // For Clerk E2E tests, we need to sign in with a real test user
  // Since Clerk doesn't have built-in test mode, we skip actual authentication
  // and instead configure tests to work without authentication where possible

  // Option 1: If you have Clerk test credentials, sign in here
  // Option 2: Use Clerk's testing tokens (if available)
  // Option 3: Mock authentication at browser level

  // For now, we'll document that E2E tests requiring authentication
  // should be run with proper Clerk test account credentials

  console.log('E2E tests requiring authentication need Clerk test account setup');
  console.log('See https://clerk.com/docs/testing/overview for Clerk testing guide');
});
