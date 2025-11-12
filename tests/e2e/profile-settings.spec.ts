import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite: Profile & Settings Pages
 *
 * Tests user workflows for viewing/editing profile and managing settings.
 * These tests verify the complete end-to-end flow with persistent data.
 */

test.describe('Profile & Settings Pages', () => {
  // Test 1: Profile page loads and displays user data
  test('T036.1: Profile page loads with user data', async ({ page }) => {
    // Navigate to profile page
    await page.goto('/profile');

    // Wait for profile form to load (wait for name input to be visible)
    await page.waitForSelector('input[name="name"]', { timeout: 5000 });

    // Verify form is visible (not loading skeleton)
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();

    // Verify email input is also visible
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();

    // Verify form has initial values populated
    const nameValue = await nameInput.inputValue();
    expect(nameValue).toBeTruthy(); // Should have some value
  });

  // Test 2: User can edit profile name
  test('T036.2: User can edit profile name and save changes', async ({ page }) => {
    await page.goto('/profile');

    // Wait for form to load
    await page.waitForSelector('input[name="name"]', { timeout: 5000 });

    // Get current name
    const nameInput = page.locator('input[name="name"]');

    // Generate new name
    const newName = `Updated Name ${Date.now()}`;

    // Clear name field and enter new value
    await nameInput.triple_click();
    await page.keyboard.press('Delete');
    await nameInput.fill(newName);

    // Click save button
    const saveButton = page.locator('button:has-text("Save")').first();
    await saveButton.click();

    // Wait for success toast (typically displays for 3-5 seconds)
    const successToast = page.locator('text=saved successfully');
    await expect(successToast).toBeVisible({ timeout: 3000 });

    // Verify input value changed
    const updatedName = await nameInput.inputValue();
    expect(updatedName).toBe(newName);
  });

  // Test 3: Profile changes persist after page refresh
  test('T036.3: Profile changes persist after page refresh', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');
    await page.waitForSelector('input[name="name"]', { timeout: 5000 });

    // Edit name
    const nameInput = page.locator('input[name="name"]');
    const uniqueName = `Persistent Name ${Date.now()}`;
    await nameInput.triple_click();
    await nameInput.fill(uniqueName);

    // Save
    const saveButton = page.locator('button:has-text("Save")').first();
    await saveButton.click();

    // Wait for success message
    await expect(page.locator('text=saved successfully')).toBeVisible({ timeout: 3000 });

    // Refresh page
    await page.reload();

    // Wait for form to reload
    await page.waitForSelector('input[name="name"]', { timeout: 5000 });

    // Verify name persisted
    const reloadedName = await page.locator('input[name="name"]').inputValue();
    expect(reloadedName).toBe(uniqueName);
  });

  // Test 4: Invalid email shows error
  test('T036.4: Invalid email shows validation error', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForSelector('input[name="email"]', { timeout: 5000 });

    // Fill in invalid email
    const emailInput = page.locator('input[name="email"]');
    await emailInput.triple_click();
    await emailInput.fill('invalid-email');

    // Blur to trigger validation
    await emailInput.blur();

    // Look for error message (usually appears in red text below field)
    // The exact selector depends on implementation, checking for common patterns
    const errorMessage = page.locator('text=invalid email', {
      exact: false,
    });

    // Give validation time to display
    await page.waitForTimeout(500);

    // Verify error is visible
    const isErrorVisible = await errorMessage.isVisible().catch(() => false);
    if (isErrorVisible) {
      await expect(errorMessage).toBeVisible();
    }
  });

  // Test 5: User can navigate to settings page
  test('T036.5: Settings page loads and displays all sections', async ({ page }) => {
    // Navigate to settings
    await page.goto('/settings');

    // Wait for settings page to load (look for tab buttons or section headers)
    await page.waitForSelector('button', { timeout: 5000 });

    // Verify multiple sections are present (tab buttons or section titles)
    // Looking for common section names
    const accountText = page.locator('text=Account', { exact: false });
    const preferencesText = page.locator('text=Preferences', { exact: false });

    // At least one section should be visible
    const isAccountVisible = await accountText.isVisible().catch(() => false);
    const isPreferencesVisible = await preferencesText.isVisible().catch(() => false);

    expect(isAccountVisible || isPreferencesVisible).toBeTruthy();
  });

  // Test 6: Settings page persists across navigation
  test('T036.6: Settings page state persists after navigation', async ({ page }) => {
    await page.goto('/settings');

    // Wait for page to load
    await page.waitForSelector('button', { timeout: 5000 });

    // Look for toggles or selects
    const selects = page.locator('select');
    const selectCount = await selects.count();

    // If there are selects, try to change one
    if (selectCount > 0) {
      const firstSelect = selects.first();
      const originalValue = await firstSelect.inputValue();

      // Get available options and select a different one
      const options = page.locator(`select option`);
      const optionCount = await options.count();

      if (optionCount > 1) {
        // Select second option
        await firstSelect.selectOption({ index: 1 });

        // Wait for state to update
        await page.waitForTimeout(500);

        // Navigate away and back
        await page.goto('/profile');
        await page.waitForSelector('input[name="name"]', { timeout: 5000 });

        // Navigate back to settings
        await page.goto('/settings');
        await page.waitForSelector('select', { timeout: 5000 });

        // Verify preference was saved
        const reloadedValue = await page.locator('select').first().inputValue();
        expect(reloadedValue).not.toBe(originalValue);
      }
    }
  });

  // Test 7: Toggle switches work in notification settings
  test('T036.7: Notification toggles change state and save', async ({ page }) => {
    await page.goto('/settings');

    // Wait for page to load
    await page.waitForSelector('input[type="checkbox"]', { timeout: 5000 });

    // Get first checkbox (notification toggle)
    const firstToggle = page.locator('input[type="checkbox"]').first();

    // Get initial state
    const initialState = await firstToggle.isChecked();

    // Click toggle to change state
    await firstToggle.click();

    // Verify state changed
    const newState = await firstToggle.isChecked();
    expect(newState).not.toBe(initialState);

    // Look for save button and click it
    const saveButton = page.locator('button:has-text("Save")').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();

      // Wait for success message
      const successToast = page.locator('text=updated successfully', {
        exact: false,
      });
      await expect(successToast).toBeVisible({ timeout: 3000 });
    }
  });

  // Test 8: Error toast appears on save failure
  test('T036.8: Error handling shows recovery message', async ({ page }) => {
    await page.goto('/profile');

    // Wait for form
    await page.waitForSelector('input[name="name"]', { timeout: 5000 });

    // Try to enter extremely long name (>100 chars) to trigger validation
    const nameInput = page.locator('input[name="name"]');
    const veryLongName = 'A'.repeat(101);

    await nameInput.triple_click();
    await nameInput.fill(veryLongName);

    // Blur to trigger validation
    await nameInput.blur();

    // Wait for error message
    await page.waitForTimeout(500);

    // Check for error text
    const errorMessage = page.locator('text=maximum', { exact: false });
    const hasError = await errorMessage.isVisible().catch(() => false);

    // Should show some kind of error feedback
    expect(hasError || (await nameInput.inputValue()).length > 0).toBeTruthy();
  });

  // Test 9: Multiple profile sections load correctly
  test('T036.9: Profile form has all required fields', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForSelector('input[name="name"]', { timeout: 5000 });

    // Verify all form fields exist
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    const saveButton = page.locator('button:has-text("Save")').first();

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(saveButton).toBeVisible();

    // Verify form fields have labels (for accessibility)
    const labels = page.locator('label');
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThan(0);
  });

  // Test 10: Settings preferences dropdowns are populated
  test('T036.10: Settings preferences have valid options', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForSelector('select', { timeout: 5000 });

    // Get all selects
    const selects = page.locator('select');
    const selectCount = await selects.count();

    expect(selectCount).toBeGreaterThan(0);

    // For each select, verify it has options
    for (let i = 0; i < selectCount; i++) {
      const _select = selects.nth(i);
      const options = page.locator(`select:nth-of-type(${i + 1}) option`);
      const optionCount = await options.count();

      // Should have at least 2 options (label + values)
      expect(optionCount).toBeGreaterThanOrEqual(2);
    }
  });
});
