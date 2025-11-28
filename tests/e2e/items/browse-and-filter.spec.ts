import { test, expect } from '@playwright/test';

test.describe('Item Catalog - Browse and Filter (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/items');
  });

  test('displays item catalog page with search and filters', async ({
    page,
  }) => {
    // Validate initial page state
    await expect(
      page.getByRole('heading', { level: 1, name: /item catalog/i })
    ).toBeVisible();
    await expect(page.getByPlaceholder('Search items...')).toBeVisible();
  });

  test('user can search for items by name', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search items...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('longsword');
    
    // Wait for search results to update
    const longswordHeading = page.getByRole('heading', { name: /longsword/i });
    await longswordHeading.waitFor({ state: 'visible', timeout: 5000 });

    // Verify search results
    await expect(longswordHeading).toBeVisible();
  });

  test('user can filter items by category', async ({ page }) => {
    // Wait for category select to be visible
    const categorySelect = page.locator('#category-select');
    await expect(categorySelect).toBeVisible();
    
    // Select a category
    await categorySelect.selectOption('Weapon');
    
    // Wait for filter to be applied
    const longswordHeading = page.getByRole('heading', { name: /longsword/i });
    await longswordHeading.waitFor({ state: 'visible', timeout: 5000 });

    // Verify filtered results - Longsword should be visible (it's a Weapon)
    await expect(longswordHeading).toBeVisible();
  });

  test('user can filter items by rarity', async ({ page }) => {
    // Wait for rarity select to be visible
    const raritySelect = page.locator('#rarity-select');
    await expect(raritySelect).toBeVisible();
    
    // Select a rarity filter
    await raritySelect.selectOption('Common');
    
    // Wait for filter to be applied
    const shortswordHeading = page.getByRole('heading', { name: /shortsword/i });
    await shortswordHeading.waitFor({ state: 'visible', timeout: 5000 });

    // Verify filtered results - Items with Common rarity should be visible
    await expect(shortswordHeading).toBeVisible();
  });

  test('user can combine category and rarity filters', async ({ page }) => {
    // Select category
    const categorySelect = page.locator('#category-select');
    await expect(categorySelect).toBeVisible();
    await categorySelect.selectOption('Weapon');
    
    // Wait for first filter to apply
    const categoryFilterApplied = page.getByRole('heading', { name: /longsword/i });
    await categoryFilterApplied.waitFor({ state: 'visible', timeout: 5000 });
    
    // Select rarity
    const raritySelect = page.locator('#rarity-select');
    await expect(raritySelect).toBeVisible();
    await raritySelect.selectOption('Common');
    
    // Wait for combined filters to apply
    const finalResults = page.getByRole('heading', { name: /longsword|shortsword/i });
    await finalResults.waitFor({ state: 'visible', timeout: 5000 });

    // Verify combined filter results - Both filters should reduce results to weapons of Common rarity
    const longswordHeading = page.getByRole('heading', { name: /longsword/i });
    await expect(longswordHeading).toBeVisible();
  });

  test('shows empty state message when no results match', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search items...');
    await searchInput.fill('nonexistent artifact xyz');
    
    // Wait for search results to update
    const emptyStateMsg = page.getByText(/no items match your criteria/i);
    await emptyStateMsg.waitFor({ state: 'visible', timeout: 5000 });

    // Verify empty state message
    await expect(emptyStateMsg).toBeVisible();
  });

  test('results count updates as filters change', async ({ page }) => {
    const statusRegion = page.getByRole('status');

    await expect(statusRegion).toContainText('3 of 3 items');

    // Apply filter
    await page.locator('#category-select').selectOption('Weapon');
    
    // Wait for filter to apply and results count to update
    await expect(statusRegion).toContainText('2 of 3 items', { timeout: 5000 });
  });

  test('page is keyboard navigable', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search items...');
    const categorySelect = page.locator('#category-select');

    await searchInput.focus();
    expect(
      await searchInput.evaluate((el) => el === document.activeElement)
    ).toBe(true);

    await page.keyboard.press('Tab');
    expect(
      await categorySelect.evaluate((el) => el === document.activeElement)
    ).toBe(true);
  });
});
