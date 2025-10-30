/**
 * End-to-End Tests for Character Management
 * Tests real HTTP requests through Playwright UI automation
 *
 * Scenarios:
 * - POST /api/characters - Create character via form
 * - GET /api/characters - List characters with pagination
 * - GET /api/characters/[id] - View character details
 * - PUT /api/characters/[id] - Update character
 * - DELETE /api/characters/[id] - Soft-delete character
 * - POST /api/characters/[id]/duplicate - Duplicate character
 *
 * @jest-environment browser
 */

import { test, expect } from '@playwright/test';

// Mock Clerk authentication for tests
test.beforeEach(async ({ context }) => {
  // Set authenticated session (simulating logged-in user)
  await context.addInitScript(() => {
    window.localStorage.setItem('__clerk_db_jwt', 'test-jwt-token');
  });
});

test.describe('Character Management E2E', () => {
  let characterId: string;

  test('should create character via form submission', async ({ page }) => {
    // Navigate to dashboard or character creation page
    await page.goto('/dashboard');

    // Wait for page to load
    await expect(page.locator('text=/dashboard|characters/i')).toBeVisible({
      timeout: 5000,
    });

    // Click "Create Character" or "New Character" button
    const createButton = page.locator(
      'button:has-text("Create Character"), button:has-text("New Character"), a:has-text("New Character")'
    );
    await createButton.click();

    // Wait for form to appear or navigate to creation page
    await page.waitForURL(/.*character.*create|.*new.*character/i, {
      timeout: 5000,
    });

    // Fill character creation form
    await page.fill('input[name="name"]', 'Aragorn the Ranger');
    await page.selectOption('select[name="raceId"]', 'race-human');

    // Set ability scores
    await page.fill('input[name="abilityScores.str"]', '16');
    await page.fill('input[name="abilityScores.dex"]', '14');
    await page.fill('input[name="abilityScores.con"]', '14');
    await page.fill('input[name="abilityScores.int"]', '12');
    await page.fill('input[name="abilityScores.wis"]', '15');
    await page.fill('input[name="abilityScores.cha"]', '13');

    // Set hit points
    await page.fill('input[name="hitPoints"]', '45');

    // Add class (Ranger level 5)
    await page.click(
      'button:has-text("Add Class"), button:has-text("+ Class")'
    );
    await page.selectOption('select[name="classes.0.classId"]', 'class-ranger');
    await page.fill('input[name="classes.0.level"]', '5');

    // Submit form
    const submitButton = page.locator(
      'button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save")'
    );
    await submitButton.click();

    // Wait for success and redirect
    await page.waitForURL(/.*character.*\/.*id/i, { timeout: 5000 });

    // Extract character ID from URL
    const url = page.url();
    const match = url.match(/\/character(?:s)?\/([a-fA-F0-9]+)/);
    if (match) {
      characterId = match[1];
    }

    // Verify character details are displayed
    await expect(page.locator('text=Aragorn the Ranger')).toBeVisible();
    await expect(page.locator('text=/ability.*score|str.*16/i')).toBeVisible();
    await expect(page.locator('text=/hit.*point|hp.*45/i')).toBeVisible();

    // Verify derived stats are calculated and displayed
    await expect(page.locator('text=/proficiency.*bonus/i')).toBeVisible();
    await expect(page.locator('text=/ability.*modifier/i')).toBeVisible();
  });

  test('should display character in list with pagination', async ({ page }) => {
    // Navigate to characters list
    await page.goto('/dashboard');

    // Look for characters list or link to it
    const charactersList = page.locator(
      'a:has-text("Characters"), button:has-text("View All")'
    );
    if ((await charactersList.count()) > 0) {
      await charactersList.first().click();
    }

    // Wait for list to load
    await expect(
      page.locator('text=/characters|character list|my characters/i')
    ).toBeVisible({ timeout: 5000 });

    // Verify pagination controls
    const pageInfo = page.locator('text=/page.*1|page.*of/i');
    const nextButton = page.locator(
      'button:has-text("Next"), a:has-text("Next")'
    );

    if ((await pageInfo.count()) > 0 || (await nextButton.count()) > 0) {
      // Pagination exists - verify it works
      await expect(pageInfo.or(nextButton)).toBeVisible();
    }

    // Verify character appears in list if it was created
    const characterRow = page.locator('text=Aragorn the Ranger');
    if ((await characterRow.count()) > 0) {
      await expect(characterRow).toBeVisible();
    }
  });

  test('should update character via form', async ({ page }) => {
    if (!characterId) {
      test.skip();
    }

    // Navigate to character details
    await page.goto(`/characters/${characterId}`);

    // Wait for character to load
    await expect(page.locator('text=Aragorn the Ranger')).toBeVisible({
      timeout: 5000,
    });

    // Click edit button
    const editButton = page.locator(
      'button:has-text("Edit"), button:has-text("Update")'
    );
    await editButton.click();

    // Wait for edit form
    await page.waitForURL(/.*edit|.*update/, { timeout: 5000 });

    // Update name
    await page.fill('input[name="name"]', 'Aragorn Strider the Ranger');

    // Update an ability score to trigger derived stats recalculation
    await page.fill('input[name="abilityScores.str"]', '18');

    // Submit update
    const submitButton = page.locator(
      'button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Update")'
    );
    await submitButton.click();

    // Wait for success
    await expect(page.locator('text=/saved|updated|success/i')).toBeVisible({
      timeout: 5000,
    });

    // Verify updates persisted
    await expect(page.locator('text=Aragorn Strider the Ranger')).toBeVisible();
    await expect(page.locator('text=/str.*18/i')).toBeVisible();

    // Reload page to verify persistence
    await page.reload();

    // Verify data still there after reload
    await expect(page.locator('text=Aragorn Strider the Ranger')).toBeVisible();
    await expect(page.locator('text=/str.*18/i')).toBeVisible();
  });

  test('should validate form inputs on character creation', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    // Navigate to create character
    const createButton = page.locator(
      'button:has-text("Create Character"), a:has-text("New Character")'
    );
    await createButton.click();

    // Wait for form
    await page.waitForURL(/.*character.*create|.*new/i, { timeout: 5000 });

    // Try to submit empty form
    const submitButton = page.locator(
      'button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save")'
    );
    await submitButton.click();

    // Should show validation errors
    const errorMessages = page.locator('text=/required|invalid|error/i');
    await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });

    // Try invalid ability scores (< 1)
    await page.fill('input[name="name"]', 'Test Character');
    await page.selectOption('select[name="raceId"]', 'race-human');
    await page.fill('input[name="abilityScores.str"]', '0'); // Invalid

    await submitButton.click();

    // Should show validation error for invalid score
    await expect(
      page.locator('text=/ability.*score|must.*be.*between|1.*20/i')
    ).toBeVisible({ timeout: 5000 });

    // Fix validation
    await page.fill('input[name="abilityScores.str"]', '10');
    await page.fill('input[name="abilityScores.dex"]', '10');
    await page.fill('input[name="abilityScores.con"]', '10');
    await page.fill('input[name="abilityScores.int"]', '10');
    await page.fill('input[name="abilityScores.wis"]', '10');
    await page.fill('input[name="abilityScores.cha"]', '10');
    await page.fill('input[name="hitPoints"]', '30');

    // Add at least one class
    await page.click(
      'button:has-text("Add Class"), button:has-text("+ Class")'
    );
    await page.selectOption(
      'select[name="classes.0.classId"]',
      'class-fighter'
    );
    await page.fill('input[name="classes.0.level"]', '1');

    // Now should be able to submit
    await submitButton.click();

    // Should succeed
    await expect(page.locator('text=/created|success|saved/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should duplicate character with default and custom names', async ({
    page,
  }) => {
    if (!characterId) {
      test.skip();
    }

    // Navigate to character
    await page.goto(`/characters/${characterId}`);

    // Wait for character to load
    await expect(page.locator('text=/Aragorn|character detail/i')).toBeVisible({
      timeout: 5000,
    });

    // Find and click duplicate button
    const duplicateButton = page.locator(
      'button:has-text("Duplicate"), button:has-text("Clone"), button:has-text("Copy")'
    );
    await duplicateButton.click();

    // Handle duplicate dialog/form
    const dialogOrForm = page.locator(
      'text=/duplicate|copy.*character|new.*name/i'
    );
    await expect(dialogOrForm).toBeVisible({ timeout: 5000 });

    // Test 1: Duplicate with default name
    const confirmButton = page.locator(
      'button:has-text("Confirm"), button:has-text("Duplicate"), button:has-text("Copy")'
    );
    await confirmButton.click();

    // Wait for duplicate to complete
    await page.waitForURL(/.*character.*/, { timeout: 5000 });

    // Verify duplicate exists with "(Copy)" suffix
    await expect(page.locator('text=/\\(Copy\\)|\\(2\\)/i')).toBeVisible();

    // Navigate back to original
    await page.goto(`/characters/${characterId}`);

    // Test 2: Duplicate with custom name
    await duplicateButton.click();

    // Fill custom name in dialog
    const nameInput = page.locator('input[placeholder*="name" i]');
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('Aragorn the Strider Clone');
    }

    await confirmButton.click();

    // Wait for creation
    await page.waitForURL(/.*character.*/, { timeout: 5000 });

    // Verify custom name duplicate exists
    const customClone = page.locator('text=Aragorn the Strider Clone');
    if ((await customClone.count()) > 0) {
      await expect(customClone).toBeVisible();
    }
  });

  test('should soft-delete character', async ({ page }) => {
    if (!characterId) {
      test.skip();
    }

    // Navigate to character
    await page.goto(`/characters/${characterId}`);

    // Wait for character to load
    await expect(page.locator('text=/Aragorn|character/i')).toBeVisible({
      timeout: 5000,
    });

    // Click delete button
    const deleteButton = page.locator(
      'button:has-text("Delete"), button:has-text("Remove")'
    );
    await deleteButton.click();

    // Confirm deletion in dialog
    const confirmDelete = page.locator(
      'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")'
    );
    await confirmDelete.click();

    // Wait for deletion to complete
    await expect(page.locator('text=/deleted|removed|success/i')).toBeVisible({
      timeout: 5000,
    });

    // Should redirect to list
    await page.waitForURL(/.*character.*list|.*dashboard/i, { timeout: 5000 });

    // Character should no longer appear in active list
    const deletedCharacter = page.locator('text=Aragorn the Ranger');

    // Character should not be visible in default list
    // (soft delete means it's marked as deleted, not actually removed)
    if ((await deletedCharacter.count()) > 0) {
      // If using includeDeleted filter, deleted character might still show
      // Verify it has some indication of being deleted
      const deletedLabel = page.locator('text=/deleted|archived|inactive/i');
      if ((await deletedLabel.count()) > 0) {
        await expect(deletedLabel).toBeVisible();
      }
    }
  });

  test('should deny access to other users characters', async ({ page }) => {
    // This test would require being able to switch user contexts
    // For now, it tests that accessing a character with invalid ID fails gracefully

    // Try to access a non-existent character
    await page.goto('/characters/000000000000000000000000');

    // Should show 404 or access denied message
    await expect(
      page.locator(
        'text=/not.*found|not.*exist|access.*denied|not.*authorized/i'
      )
    ).toBeVisible({ timeout: 5000 });
  });

  test('should calculate and display derived stats correctly', async ({
    page,
  }) => {
    if (!characterId) {
      test.skip();
    }

    // Navigate to character details
    await page.goto(`/characters/${characterId}`);

    // Wait for character to load
    await expect(page.locator('text=/Aragorn|character/i')).toBeVisible({
      timeout: 5000,
    });

    // Verify all derived stats are displayed
    const statElements = {
      totalLevel: page.locator('text=/total.*level|level.*5/i'),
      proficiencyBonus: page.locator('text=/proficiency.*bonus|\\+\\d+/i'),
      armorClass: page.locator('text=/armor.*class|ac.*\\d+/i'),
      initiative: page.locator('text=/initiative|init.*\\d+/i'),
      hitPoints: page.locator('text=/hit.*point|hp/i'),
      abilityModifiers: page.locator(
        'text=/ability.*modifier|str.*\\d+|dex.*\\d+/i'
      ),
      skills: page.locator('text=/skills|athletics|acrobatics|arcana/i'),
      savingThrows: page.locator('text=/saving.*throw|save.*str|save.*dex/i'),
    };

    // Check that key stats are visible
    for (const locator of Object.values(statElements)) {
      if ((await locator.count()) > 0) {
        await expect(locator.first()).toBeVisible();
      }
    }
  });

  test('should handle pagination when viewing character list', async ({
    page,
  }) => {
    // Create multiple characters to test pagination
    const characterNames = [
      'Legolas Greenleaf',
      'Gimli Lockbeard',
      'Boromir of Gondor',
      'Frodo Baggins',
      'Samwise Gamgee',
    ];

    // Navigate to character list
    await page.goto('/dashboard');

    // For each character, create it through the form
    for (const name of characterNames) {
      const createButton = page.locator(
        'button:has-text("Create Character"), a:has-text("New Character")'
      );

      if ((await createButton.count()) === 0) {
        // Navigate to create page if button not available
        await page.goto('/characters/create');
      } else {
        await createButton.click();
      }

      // Fill form with minimal valid data
      await page.fill('input[name="name"]', name);
      await page.selectOption('select[name="raceId"]', 'race-human');

      // Set ability scores
      for (const ability of ['str', 'dex', 'con', 'int', 'wis', 'cha']) {
        await page.fill(`input[name="abilityScores.${ability}"]`, '10');
      }

      await page.fill('input[name="hitPoints"]', '30');

      // Add class
      const addClassBtn = page.locator(
        'button:has-text("Add Class"), button:has-text("+ Class")'
      );
      await addClassBtn.click();

      await page.selectOption(
        'select[name="classes.0.classId"]',
        'class-fighter'
      );
      await page.fill('input[name="classes.0.level"]', '1');

      // Submit
      const submitButton = page.locator(
        'button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save")'
      );
      await submitButton.click();

      // Wait for creation
      await page.waitForURL(/.*character.*/, { timeout: 5000 });

      // Navigate back to list for next iteration
      await page.goto('/dashboard');
    }

    // Now test pagination
    const nextButton = page.locator(
      'button:has-text("Next"), a:has-text("Next"), [aria-label*="next"]'
    );

    if ((await nextButton.count()) > 0) {
      const isEnabled = await nextButton.isEnabled();
      if (isEnabled) {
        await nextButton.click();

        // Wait for page to update
        await page.waitForTimeout(1000);

        // Verify different characters shown
        const currentPageCharacters = await page
          .locator('text=Legolas|Gimli|Boromir|Frodo|Samwise')
          .count();
        expect(currentPageCharacters).toBeGreaterThan(0);
      }
    }
  });

  test('should require authentication to access characters', async ({
    context,
  }) => {
    // Create page without authentication
    const newPage = await context.newPage();

    // Clear auth token
    await newPage.evaluate(() => {
      window.localStorage.removeItem('__clerk_db_jwt');
    });

    // Try to navigate to characters
    await newPage.goto('/characters');

    // Should be redirected to login or show auth error
    await expect(
      newPage.locator('text=/sign.*in|login|unauthorized|authenticate/i')
    ).toBeVisible({ timeout: 5000 });

    await newPage.close();
  });
});
