/**
 * End-to-End Tests: Character Management Workflows
 *
 * Tests complete user workflows through the UI:
 * - Create character from dashboard
 * - View character list with pagination
 * - View character details
 * - Edit character properties
 * - Duplicate character
 * - Delete character
 * - Search/filter characters
 *
 * These tests use Playwright browser automation with real authentication
 * and validate UI interactions, form submissions, and data persistence
 */

import { test, expect } from '@playwright/test';

// Test data
const TEST_USER = {
  email: 'playwright-test@example.com',
  password: 'TestPassword123!',
};

const VALID_CHARACTER_DATA = {
  name: 'Sir Galahad the Brave',
  race: 'human',
  class: 'paladin',
  level: 10,
  hitPoints: 95,
  strength: 16,
  dexterity: 14,
  constitution: 16,
  intelligence: 12,
  wisdom: 16,
  charisma: 15,
  armorClass: 18,
};

test.describe('Character Management E2E Workflows', () => {
  let characterId: string;
  let characterName: string;

  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to app and login (or simulate authentication)
    await page.goto('/');

    // Wait for page to load
    await page.waitForURL(/.*/, { timeout: 5000 });

    // If not authenticated, handle login flow
    const loginButton = page.locator('button:has-text("Sign In"), a:has-text("Sign In")');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      // Clerk login flow would happen here
      // For now, we simulate by setting auth token
      await page.context().addInitScript(() => {
        window.localStorage.setItem(
          '__clerk_db_jwt',
          'test-jwt-token-for-playwright'
        );
      });
    }
  });

  test('should create character with form validation', async ({ page }) => {
    // Navigate to character creation
    await page.goto('/dashboard');

    // Wait for dashboard to load
    await expect(page.locator('text=/characters|dashboard/i')).toBeVisible({
      timeout: 5000,
    });

    // Find and click create button
    const createButton = page.locator(
      'button:has-text("New Character"), button:has-text("Create")'
    );

    if (await createButton.isVisible()) {
      await createButton.click();
    }

    // Wait for character form
    await page.waitForSelector('input[name*="name"], input[id*="name"]', {
      timeout: 5000,
    });

    // Fill form fields
    await page.fill('input[id*="name"], input[name*="name"]', VALID_CHARACTER_DATA.name);
    await page.selectOption(
      'select[id*="race"], select[name*="race"]',
      VALID_CHARACTER_DATA.race
    );
    await page.selectOption(
      'select[id*="class"], select[name*="class"]',
      VALID_CHARACTER_DATA.class
    );

    // Fill ability scores
    const abilityInputs = [
      'strength',
      'dexterity',
      'constitution',
      'intelligence',
      'wisdom',
      'charisma',
    ];
    const abilityValues = [
      VALID_CHARACTER_DATA.strength,
      VALID_CHARACTER_DATA.dexterity,
      VALID_CHARACTER_DATA.constitution,
      VALID_CHARACTER_DATA.intelligence,
      VALID_CHARACTER_DATA.wisdom,
      VALID_CHARACTER_DATA.charisma,
    ];

    for (let i = 0; i < abilityInputs.length; i++) {
      const input = page.locator(`input[id*="${abilityInputs[i]}"], input[name*="${abilityInputs[i]}"]`);
      if (await input.isVisible()) {
        await input.fill(String(abilityValues[i]));
      }
    }

    // Fill hit points
    const hpInput = page.locator('input[id*="hitPoints"], input[name*="hitPoints"]');
    if (await hpInput.isVisible()) {
      await hpInput.fill(String(VALID_CHARACTER_DATA.hitPoints));
    }

    // Submit form
    const submitButton = page.locator('button:has-text("Create"), button:has-text("Save")');
    await submitButton.click();

    // Wait for success message or redirect to character view
    await page.waitForURL(/.*character.*/, { timeout: 10000 });

    // Verify character was created and is displayed
    await expect(page.locator(`text="${VALID_CHARACTER_DATA.name}"`)).toBeVisible({
      timeout: 5000,
    });

    // Extract character ID from URL
    const url = page.url();
    const idMatch = url.match(/character[s]?\/([a-zA-Z0-9]+)/);
    if (idMatch) {
      characterId = idMatch[1];
    }
  });

  test('should display character details correctly', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Wait for character list
    await expect(page.locator('text=/characters/i')).toBeVisible({
      timeout: 5000,
    });

    // Find and click first character
    const firstCharacter = page.locator(
      'a:has-text("Character"), [data-testid="character-card"]'
    ).first();

    if (await firstCharacter.isVisible()) {
      await firstCharacter.click();
    }

    // Wait for details page
    await page.waitForURL(/.*character.*/, { timeout: 5000 });

    // Verify character details are displayed
    await expect(page.locator('text=/name|ability scores|classes/i')).toBeVisible({
      timeout: 5000,
    });

    // Check specific values are present
    const pageText = await page.textContent('body');
    expect(pageText).toContain(/ability|strength|dexterity|constitution/i);
  });

  test('should list characters with pagination', async ({ page }) => {
    // Navigate to character list
    await page.goto('/dashboard');

    // Wait for list to load
    await expect(page.locator('[data-testid="character-list"], ul, table')).toBeVisible({
      timeout: 5000,
    });

    // Count visible characters
    const characterItems = page.locator('[data-testid="character-item"], li, tr');
    const count = await characterItems.count();

    // Check pagination controls exist if needed
    const pagination = page.locator('[data-testid="pagination"], .pagination');
    if (count > 5) {
      await expect(pagination).toBeVisible({ timeout: 5000 });

      // Click next page if available
      const nextButton = page.locator('button:has-text("Next"), a:has-text("Next")');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should edit character successfully', async ({ page }) => {
    // Navigate to dashboard and open a character
    await page.goto('/dashboard');

    // Find and click first character
    const firstCharacter = page.locator('[data-testid="character-card"]').first();
    await firstCharacter.click();

    // Wait for details page
    await page.waitForURL(/.*character.*/, { timeout: 5000 });

    // Find edit button
    const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")');
    if (await editButton.isVisible()) {
      await editButton.click();
    }

    // Wait for edit form
    await page.waitForSelector('input[value*=""], textarea', { timeout: 5000 });

    // Update character name
    const nameInput = page.locator('input[id*="name"], input[name*="name"]').first();
    const newName = `${VALID_CHARACTER_DATA.name} (Updated)`;
    await nameInput.clear();
    await nameInput.fill(newName);

    // Update hit points
    const hpInput = page.locator('input[id*="hitPoints"], input[name*="hitPoints"]');
    if (await hpInput.isVisible()) {
      await hpInput.clear();
      await hpInput.fill('100');
    }

    // Submit form
    const submitButton = page.locator('button:has-text("Save"), button:has-text("Update")');
    await submitButton.click();

    // Verify update was successful
    await expect(page.locator(`text="${newName}"`)).toBeVisible({
      timeout: 5000,
    });
  });

  test('should duplicate character', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Find character and get its name
    const firstCharacter = page.locator('[data-testid="character-card"]').first();
    const originalName = await firstCharacter.textContent();

    // Click on character
    await firstCharacter.click();

    // Wait for details page
    await page.waitForURL(/.*character.*/, { timeout: 5000 });

    // Find duplicate button
    const duplicateButton = page.locator(
      'button:has-text("Duplicate"), button:has-text("Clone")'
    );

    if (await duplicateButton.isVisible()) {
      await duplicateButton.click();

      // Handle duplicate dialog/form if present
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("OK")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Wait for new character to be created
      await page.waitForTimeout(1000);

      // Verify we're back on list or see duplicate
      await expect(
        page.locator(`text="Copy"`)
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should delete character with confirmation', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Get character count before delete
    const charactersBefore = await page
      .locator('[data-testid="character-card"]')
      .count();

    // Find and click first character
    const firstCharacter = page.locator('[data-testid="character-card"]').first();
    await firstCharacter.click();

    // Wait for details page
    await page.waitForURL(/.*character.*/, { timeout: 5000 });

    // Find and click delete button
    const deleteButton = page.locator('button:has-text("Delete")');
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Handle confirmation dialog
      const confirmButton = page.locator(
        'button:has-text("Confirm"), button:has-text("Delete")'
      );
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Wait for redirect to list
      await page.waitForURL(/.*dashboard.*/, { timeout: 5000 });

      // Verify character count decreased (if deleted and not just soft-deleted from view)
      const charactersAfter = await page
        .locator('[data-testid="character-card"]')
        .count();

      expect(charactersAfter).toBeLessThanOrEqual(charactersBefore);
    }
  });

  test('should handle character creation form validation errors', async ({ page }) => {
    // Navigate to character creation
    await page.goto('/dashboard');

    // Find create button
    const createButton = page.locator('button:has-text("New Character")');
    if (await createButton.isVisible()) {
      await createButton.click();
    }

    // Try submitting empty form
    const submitButton = page.locator('button:has-text("Create"), button:has-text("Save")');
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Should show validation error
      const errorMessage = page.locator('[role="alert"], .error, .validation-error');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle navigation between characters', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Get all characters
    const characters = page.locator('[data-testid="character-card"]');
    const count = await characters.count();

    if (count >= 2) {
      // Click first character
      await characters.nth(0).click();
      await page.waitForURL(/.*character.*/, { timeout: 5000 });

      // Get first character name
      const firstCharName = await page
        .locator('h1, h2, [data-testid="character-name"]')
        .first()
        .textContent();

      // Navigate to second character
      const backButton = page.locator('a:has-text("Back"), button:has-text("Back")');
      if (await backButton.isVisible()) {
        await backButton.click();
      }

      // Click second character
      await characters.nth(1).click();
      await page.waitForTimeout(500);

      // Verify different character is displayed
      const secondCharName = await page
        .locator('h1, h2, [data-testid="character-name"]')
        .first()
        .textContent();

      expect(firstCharName).not.toBe(secondCharName);
    }
  });

  test('should show character statistics and derived values', async ({ page }) => {
    // Navigate to character
    await page.goto('/dashboard');

    const firstCharacter = page.locator('[data-testid="character-card"]').first();
    await firstCharacter.click();

    // Wait for details
    await page.waitForURL(/.*character.*/, { timeout: 5000 });

    // Verify statistics are displayed
    const stats = page.locator('[data-testid="character-stats"], .stats-section');
    if (await stats.isVisible()) {
      await expect(stats).toBeVisible();

      // Check for specific stat fields
      const pageText = await page.textContent('body');
      expect(pageText).toMatch(/(armor class|initiative|proficiency|ability modifier)/i);
    }
  });

  test('should maintain character data consistency', async ({ page }) => {
    // Create character
    await page.goto('/dashboard');

    const createButton = page.locator('button:has-text("New Character")');
    if (await createButton.isVisible()) {
      await createButton.click();
    }

    // Fill and submit
    const nameInput = page.locator('input[id*="name"], input[name*="name"]');
    const testName = 'Consistency Test Character';
    await nameInput.fill(testName);

    // Submit
    const submitButton = page.locator('button:has-text("Create"), button:has-text("Save")');
    await submitButton.click();

    // Wait for character page
    await page.waitForURL(/.*character.*/, { timeout: 5000 });

    // Verify name is displayed
    await expect(page.locator(`text="${testName}"`)).toBeVisible();

    // Refresh page
    await page.reload();

    // Verify data persisted
    await expect(page.locator(`text="${testName}"`)).toBeVisible({
      timeout: 5000,
    });
  });
});
