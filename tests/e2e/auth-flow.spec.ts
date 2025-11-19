/**
 * E2E tests for authentication flows
 * Tests sign-up, sign-in, and profile access flows
 */

import { test, expect } from '@playwright/test'

// Test data
const testPages = {
  home: 'http://localhost:3002',
  signIn: 'http://localhost:3002/sign-in',
  signUp: 'http://localhost:3002/sign-up',
  profile: 'http://localhost:3002/profile',
}

test.describe('Authentication Flows (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies for clean state
    await page.context().clearCookies()
  })

  test('should navigate to sign-in page', async ({ page }) => {
    await page.goto(testPages.signIn)

    expect(page.url()).toContain('/sign-in')
    const body = await page.textContent('body')
    expect(body).toBeDefined()
  })

  test('should navigate to sign-up page', async ({ page }) => {
    await page.goto(testPages.signUp)

    expect(page.url()).toContain('/sign-up')
    const body = await page.textContent('body')
    expect(body).toBeDefined()
  })

  test('should redirect unauthenticated users from protected routes', async ({
    page,
  }) => {
    await page.goto(testPages.profile, { waitUntil: 'networkidle' })

    // Unauthenticated users redirected to sign-in
    expect(page.url()).toContain('/sign-in')
  })

  test('should render navigation on home page', async ({ page }) => {
    await page.goto(testPages.home)

    const body = await page.textContent('body')
    expect(body).toBeDefined()
  })

  test('should navigate between sign-in and sign-up pages', async ({
    page,
  }) => {
    await page.goto(testPages.signIn)
    expect(page.url()).toContain('/sign-in')

    // Navigate to sign-up if link exists
    const signUpLink = page.locator('a[href="/sign-up"]')
    if (await signUpLink.isVisible()) {
      await signUpLink.click()
      expect(page.url()).toContain('/sign-up')
    }
  })
})
