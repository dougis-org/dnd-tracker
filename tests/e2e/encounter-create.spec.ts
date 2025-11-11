import { test, expect } from '@playwright/test'

/**
 * T017: E2E test for User Story 1 - Create and save an encounter
 *
 * Scenario:
 * 1. Navigate to /encounters/new
 * 2. Fill in encounter name
 * 3. Add a participant (monster with quantity and HP)
 * 4. Click Save
 * 5. Verify redirected to /encounters
 * 6. Verify newly created encounter appears in the list
 */

test.describe('Encounter Creation (User Story 1)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to encounters page
    await page.goto('/encounters/new')
  })

  test('should create a new encounter with one participant and save it', async ({ page }) => {
    // Fill encounter name
    await page.fill('input[name="name"]', 'Goblin Ambush')

    // Add a participant
    // Assuming the UI has an "Add Participant" button
    await page.click('button:has-text("Add Participant")')

    // Fill participant details
    // Type dropdown
    await page.selectOption('select[name="participants.0.type"]', 'monster')

    // Display name
    await page.fill('input[name="participants.0.displayName"]', 'Goblin')

    // Quantity
    await page.fill('input[name="participants.0.quantity"]', '3')

    // HP
    await page.fill('input[name="participants.0.hp"]', '7')

    // Click Save button
    await page.click('button:has-text("Save")')

    // Expect to be redirected to /encounters
    await expect(page).toHaveURL('/encounters')

    // Verify the encounter appears in the list
    await expect(page.locator('text=Goblin Ambush')).toBeVisible()

    // Verify participant count is shown
    await expect(page.locator('text=3 Goblins')).toBeVisible()
  })

  test('should prevent saving an encounter without a name', async ({ page }) => {
    // Try to add a participant without name
    await page.click('button:has-text("Add Participant")')
    await page.selectOption('select[name="participants.0.type"]', 'monster')
    await page.fill('input[name="participants.0.displayName"]', 'Goblin')

    // Try to save
    await page.click('button:has-text("Save")')

    // Should show validation error or remain on same page
    await expect(page).toHaveURL('/encounters/new')
    await expect(page.locator('text=Name is required')).toBeVisible()
  })

  test('should prevent saving an encounter without participants', async ({ page }) => {
    // Fill only name
    await page.fill('input[name="name"]', 'Empty Encounter')

    // Try to save
    await page.click('button:has-text("Save")')

    // Should show validation error
    await expect(page).toHaveURL('/encounters/new')
    await expect(page.locator('text=At least one participant is required')).toBeVisible()
  })

  test('should allow multiple participants in one encounter', async ({ page }) => {
    // Fill encounter name
    await page.fill('input[name="name"]', 'Mixed Party Encounter')

    // Add first participant
    await page.click('button:has-text("Add Participant")')
    await page.selectOption('select[name="participants.0.type"]', 'monster')
    await page.fill('input[name="participants.0.displayName"]', 'Goblin')
    await page.fill('input[name="participants.0.quantity"]', '2')

    // Add second participant
    await page.click('button:has-text("Add Participant")')
    await page.selectOption('select[name="participants.1.type"]', 'monster')
    await page.fill('input[name="participants.1.displayName"]', 'Orc')
    await page.fill('input[name="participants.1.quantity"]', '1')
    await page.fill('input[name="participants.1.hp"]', '15')

    // Save
    await page.click('button:has-text("Save")')

    // Verify redirect and encounter appears
    await expect(page).toHaveURL('/encounters')
    await expect(page.locator('text=Mixed Party Encounter')).toBeVisible()
    await expect(page.locator('text=3 participants')).toBeVisible()
  })
})
