import { test, expect } from '@playwright/test'

// Ensure API adapter returns mocked/default data but don't rely on stable user data

test.describe('Subscription E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('can navigate directly to /subscription and view header', async ({ page }) => {
    await page.goto('/subscription')

    await expect(page.locator('h1')).toContainText(/Subscription & Billing/i)
    await expect(page).toHaveURL('/subscription')
  })

  test('can open User menu and navigate to Subscription', async ({ page }) => {
    await page.goto('/')

    // Open the 'User' drop-down on desktop nav
    await page.click('button:has-text("User")')
    await page.click('a:has-text("Subscription")')

    await expect(page).toHaveURL('/subscription')
    await expect(page.locator('h1')).toContainText(/Subscription & Billing/i)
  })
})
