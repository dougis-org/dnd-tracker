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

  test('should render Collections submenu with higher opacity background', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')

    await page.getByRole('button', { name: /^Collections/ }).click()

    const submenu = page.getByRole('menu', { name: 'Collections submenu' })
    await expect(submenu).toBeVisible()

    // Check computed background color is visible/opaque
    const bgColor = await submenu.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(bgColor).toBeTruthy()
    expect(bgColor).not.toContain('rgba(')  // Should not be transparent
  })

  test('should render the desktop navigation consistently', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')

    const nav = page.getByRole('navigation', { name: /primary/i })
    await expect(nav).toBeVisible()

    await expect(nav).toHaveScreenshot('desktop-navigation.png', {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    })
  })
})
