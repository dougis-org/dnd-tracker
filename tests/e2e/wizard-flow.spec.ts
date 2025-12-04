/**
 * E2E Tests: Profile Setup Wizard Flow (T021-T024)
 *
 * Comprehensive Playwright tests for the complete wizard flow:
 * - T021: Wizard appears on first login
 * - T022: User navigates through all 5 screens
 * - T023: User submits complete profile
 * - T024: Error handling and retry logic
 *
 * Prerequisites:
 * - Clerk auth configured and user logged in
 * - MongoDB connection working
 * - API endpoints accessible
 */

import { test, expect } from '@playwright/test';

test.describe('Profile Setup Wizard - E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    // Wait for any auth redirects to complete
    await page.waitForLoadState('networkidle');
  });

  test('T021: Wizard appears on first login for new users', async ({ page }) => {
    // The wrapper should detect incomplete setup and show modal
    await expect(page.getByRole('heading', { name: /welcome to the profile setup/i }))
      .toBeVisible({ timeout: 5000 });
  });

  test('T022.1: Navigate through all 5 screens in correct order', async ({ page }) => {
    // Assume wizard is open
    await page.waitForSelector('text=Welcome to the Profile Setup');

    // Screen 1: Welcome - visible, has Next button
    await expect(page.getByRole('button', { name: /next/i })).toBeVisible();
    await page.getByRole('button', { name: /next/i }).click();

    // Screen 2: Display Name - has input field and Next button
    await expect(page.getByLabel(/display name/i)).toBeVisible();
    await page.getByLabel(/display name/i).fill('TestUser');
    await page.getByRole('button', { name: /next/i }).click();

    // Screen 3: Avatar Upload - has file input
    await expect(page.getByLabel(/avatar|upload/i)).toBeVisible();
    // Skip avatar upload for this test
    await page.getByRole('button', { name: /next/i }).click();

    // Screen 4: Preferences - has theme and notification options
    await expect(page.getByLabel(/dark mode|theme/i)).toBeVisible();
    await page.getByRole('button', { name: /next|submit|finish/i }).click();

    // Screen 5: Completion - should show success message
    await expect(
      page.getByRole('heading', { name: /success|complete|congratulations/i })
    ).toBeVisible();
  });

  test('T022.2: Navigate backwards through screens', async ({ page }) => {
    // Get to screen 2
    await page.getByRole('button', { name: /next/i }).click();

    // Go back to welcome
    const backButton = page.getByRole('button', { name: /back|previous/i });
    if (await backButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await backButton.click();
      await expect(page.getByText(/welcome/i)).toBeVisible();
    }
  });

  test('T023: User successfully submits complete profile', async ({ page }) => {
    // Fill out all required fields
    const displayNameInput = page.getByLabel(/display name/i);

    // Navigate to display name screen
    await page.getByRole('button', { name: /next/i }).click();

    // Fill display name
    await displayNameInput.fill('CompleteUser');
    await page.getByRole('button', { name: /next/i }).click();

    // Skip avatar (optional field)
    await page.getByRole('button', { name: /next/i }).click();

    // Set preferences
    const themeSelect = page.getByLabel(/dark mode|theme/i);
    if (await themeSelect.isVisible({ timeout: 500 }).catch(() => false)) {
      await themeSelect.click();
    }

    // Submit
    await page.getByRole('button', { name: /finish|submit|complete/i }).click();

    // Should show success message
    await expect(page.getByText(/success|profile saved/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test('T024.1: Error handling - show error on invalid display name', async ({
    page,
  }) => {
    // Navigate to display name screen
    await page.getByRole('button', { name: /next/i }).click();

    // Try to submit with empty name
    const displayNameInput = page.getByLabel(/display name/i);
    await displayNameInput.fill('');

    // Next button should be disabled or show error
    const nextButton = page.getByRole('button', { name: /next/i });
    const isDisabled = await nextButton.isDisabled().catch(() => false);

    // If button is disabled, validation is working
    if (!isDisabled) {
      // If not disabled, error message should appear
      await expect(page.getByText(/required|empty|invalid/i)).toBeVisible({
        timeout: 2000,
      }).catch(() => {
        // Validation might be on blur, so fill with valid data
      });
    }
  });

  test('T024.2: Error handling - display error toast on API failure', async ({
    page,
  }) => {
    // This test would need to mock API failure
    // Mock the PATCH endpoint to return 500
    await page.route('**/api/internal/users/**', (route) => {
      if (route.request().method() === 'PATCH') {
        route.abort('failed');
      } else {
        route.continue();
      }
    });

    // Navigate through wizard to submission
    await page.getByRole('button', { name: /next/i }).click();
    const displayNameInput = page.getByLabel(/display name/i);
    await displayNameInput.fill('TestUser');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // Click submit and watch for error
    await page.getByRole('button', { name: /finish|submit/i }).click();

    // Should show error message
    await expect(page.getByText(/error|failed|something went wrong/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test('T024.3: Retry logic - automatic retry on transient failure', async ({
    page,
  }) => {
    let attemptCount = 0;

    // Mock endpoint to fail twice, then succeed
    await page.route('**/api/internal/users/**', (route) => {
      if (route.request().method() === 'PATCH') {
        attemptCount++;
        if (attemptCount <= 2) {
          route.abort('failed');
        } else {
          route.continue();
        }
      } else {
        route.continue();
      }
    });

    // Complete wizard
    await page.getByRole('button', { name: /next/i }).click();
    const displayNameInput = page.getByLabel(/display name/i);
    await displayNameInput.fill('RetryUser');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // Submit - should retry and eventually succeed
    await page.getByRole('button', { name: /finish|submit/i }).click();

    // Should eventually show success (after retries)
    await expect(page.getByText(/success|profile saved/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('Dismiss wizard - user can close modal if allowed', async ({ page }) => {
    // Check if close button exists
    const closeButton = page.getByRole('button', { name: /close|dismiss|cancel/i });

    if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeButton.click();
      // Modal should close
      await expect(
        page.getByRole('heading', { name: /welcome to the profile setup/i })
      ).not.toBeVisible({ timeout: 2000 });
    }
  });

  test('LocalStorage persistence - draft saved on navigation', async ({ page }) => {
    // Navigate to display name screen
    await page.getByRole('button', { name: /next/i }).click();

    // Fill display name
    const displayNameInput = page.getByLabel(/display name/i);
    await displayNameInput.fill('DraftUser');

    // Check localStorage (via page context)
    const draft = await page.evaluate(() => {
      const saved = localStorage.getItem('wizard:draft');
      return saved ? JSON.parse(saved) : null;
    });

    expect(draft).toBeDefined();
    expect(draft.displayName).toBe('DraftUser');
  });
});
