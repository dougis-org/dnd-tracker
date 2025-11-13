import { test, expect } from '@playwright/test'

test.describe('Item Catalog - Browse and Filter (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/items')
  })

  test('displays item catalog page with search and filters', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: /item catalog/i })).toBeVisible()
    await expect(page.getByPlaceholder('Search items...')).toBeVisible()
    await expect(page.getByLabel('Category')).toBeVisible()
    await expect(page.getByLabel('Rarity')).toBeVisible()
  })

  test('user can search for items by name', async ({ page }) => {
    await page.getByPlaceholder('Search items...').fill('longsword')
    await page.waitForTimeout(400)

    await expect(page.getByRole('heading', { name: /longsword/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /healing potion/i })).not.toBeVisible()
  })

  test('user can filter items by category', async ({ page }) => {
    const categorySelect = page.getByLabel('Category')
    await categorySelect.selectOption('Weapon')

    await expect(page.getByRole('heading', { name: /longsword/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /healing potion/i })).not.toBeVisible()
  })

  test('user can filter items by rarity', async ({ page }) => {
    const raritySelect = page.getByLabel('Rarity')
    await raritySelect.selectOption('Rare')

    const headings = page.getByRole('heading', { level: 3 })
    await expect(headings.filter({ hasText: /longsword of dawn/i }).first()).toBeVisible()
  })

  test('user can combine category and rarity filters', async ({ page }) => {
    const categorySelect = page.getByLabel('Category')
    const raritySelect = page.getByLabel('Rarity')

    await categorySelect.selectOption('Weapon')
    await raritySelect.selectOption('Uncommon')

    await expect(page.getByRole('heading', { name: /warhammer of the mountain/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /longsword of dawn/i })).not.toBeVisible()
  })

  test('shows empty state message when no results match', async ({ page }) => {
    await page.getByPlaceholder('Search items...').fill('nonexistent artifact xyz')
    await page.waitForTimeout(400)

    await expect(page.getByText(/no items match your criteria/i)).toBeVisible()
  })

  test('results count updates as filters change', async ({ page }) => {
    const statusRegion = page.getByRole('status')

    await expect(statusRegion).toContainText('3 of 3 items')

    const categorySelect = page.getByLabel('Category')
    await categorySelect.selectOption('Weapon')

    await expect(statusRegion).toContainText('2 of 3 items')
  })

  test('page is keyboard navigable', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search items...')
    const categorySelect = page.getByLabel('Category')

    await searchInput.focus()
    expect(await searchInput.evaluate((el) => el === document.activeElement)).toBe(true)

    await page.keyboard.press('Tab')
    expect(await categorySelect.evaluate((el) => el === document.activeElement)).toBe(true)
  })
})
