/**
 * E2E tests for authentication flow and redirects
 * Tests the complete authentication journey including:
 * - Sign-in redirects for authenticated users
 * - Sign-up redirects for authenticated users
 * - Profile setup flow for new users
 * - Dashboard access protection
 */
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow and Redirects', () => {
  test.describe('Unauthenticated User Flows', () => {
    test('should display sign-in page for unauthenticated users', async ({ page }) => {
      await page.goto('/sign-in');

      // Verify sign-in page loaded without redirect loops
      await expect(page).toHaveURL(/\/sign-in/);

      // Verify Clerk sign-in component is visible
      await expect(page.locator('[data-clerk-id]')).toBeVisible({ timeout: 5000 });

      // Verify no console errors about redirect loops
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Wait a bit to catch any console errors
      await page.waitForTimeout(1000);

      // Ensure no Clerk redirect warnings
      const redirectWarnings = errors.filter(e =>
        e.includes('cannot render when a user is already signed in')
      );
      expect(redirectWarnings).toHaveLength(0);
    });

    test('should display sign-up page for unauthenticated users', async ({ page }) => {
      await page.goto('/sign-up');

      // Verify sign-up page loaded without redirect loops
      await expect(page).toHaveURL(/\/sign-up/);

      // Verify Clerk sign-up component is visible
      await expect(page.locator('[data-clerk-id]')).toBeVisible({ timeout: 5000 });
    });

    test('should redirect to sign-in when accessing protected dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      // Should redirect to sign-in page
      await page.waitForURL(/\/sign-in/, { timeout: 5000 });

      // Verify sign-in component is displayed
      await expect(page.locator('[data-clerk-id]')).toBeVisible();
    });

    test('should redirect to sign-in when accessing profile setup', async ({ page }) => {
      await page.goto('/profile-setup');

      // Should redirect to sign-in page
      await page.waitForURL(/\/sign-in/, { timeout: 5000 });
    });
  });

  test.describe('URL Stability - No Redirect Loops', () => {
    test('sign-in page should not toggle URLs', async ({ page }) => {
      const urlChanges: string[] = [];

      page.on('framenavigated', () => {
        urlChanges.push(page.url());
      });

      await page.goto('/sign-in');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Should stay on sign-in page (maybe with query params)
      expect(page.url()).toMatch(/\/sign-in/);

      // Should not have excessive redirects (more than 3 URL changes indicates a loop)
      expect(urlChanges.length).toBeLessThan(4);
    });

    test('sign-up page should not toggle URLs', async ({ page }) => {
      const urlChanges: string[] = [];

      page.on('framenavigated', () => {
        urlChanges.push(page.url());
      });

      await page.goto('/sign-up');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Should stay on sign-up page
      expect(page.url()).toMatch(/\/sign-up/);

      // Should not have excessive redirects
      expect(urlChanges.length).toBeLessThan(4);
    });
  });

  test.describe('Profile Redirect Routes', () => {
    test('/profile should redirect to /settings/profile', async ({ page }) => {
      await page.goto('/profile');

      // Should redirect to settings profile (or sign-in if not authenticated)
      await page.waitForURL(/\/(settings\/profile|sign-in)/, { timeout: 5000 });
    });
  });

  test.describe('Console Error Monitoring', () => {
    test('should not show Clerk session warnings on sign-in page', async ({ page }) => {
      const consoleMessages: string[] = [];

      page.on('console', msg => {
        consoleMessages.push(msg.text());
      });

      await page.goto('/sign-in');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check for specific Clerk warning
      const clerkWarnings = consoleMessages.filter(msg =>
        msg.includes('cannot render when a user is already signed in')
      );

      expect(clerkWarnings).toHaveLength(0);
    });

    test('should not show Clerk session warnings on sign-up page', async ({ page }) => {
      const consoleMessages: string[] = [];

      page.on('console', msg => {
        consoleMessages.push(msg.text());
      });

      await page.goto('/sign-up');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const clerkWarnings = consoleMessages.filter(msg =>
        msg.includes('cannot render when a user is already signed in')
      );

      expect(clerkWarnings).toHaveLength(0);
    });
  });
});
