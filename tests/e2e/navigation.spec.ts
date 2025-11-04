import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate to Help placeholder from desktop nav', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: 'Help' }).click()

    await expect(page).toHaveURL('/help')
    await expect(page.getByRole('status')).toContainText('Help page is on the roadmap')
    await expect(page.getByRole('link', { name: 'Return to home' })).toHaveAttribute('href', '/')
  })

  test('should expose Help link in mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')

    const toggle = page.getByRole('button', { name: /toggle navigation menu/i })
    await toggle.click()

    await expect(page.getByRole('list', { name: /primary mobile navigation/i })).toBeVisible()

    await page.getByRole('link', { name: 'Help' }).click()

    await expect(page).toHaveURL('/help')
    await expect(page.getByRole('status')).toContainText('Help page is on the roadmap')
  })
})
