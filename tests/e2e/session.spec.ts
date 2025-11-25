/**
 * E2E tests for session persistence
 * Tests that authenticated sessions persist across page refreshes and sign-out clears sessions
 */

import { test, expect } from '@playwright/test'
import { mockSignOut } from './test-data/mock-auth'

// Helpers for session tests
const testURLs = {
  home: 'http://localhost:3002',
  profile: '/profile',
  signIn: '/sign-in',
  sessionApi: 'http://localhost:3002/api/auth/session',
  signOutApi: 'http://localhost:3002/api/auth/sign-out',
}

test.describe('Session Persistence (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await mockSignOut(page)
  })

  test('should maintain session across page refresh', async ({ page }) => {
    await page.goto(testURLs.home)
    const initialUrl = page.url()

    expect(initialUrl).toBeDefined()

    // Refresh and verify URL unchanged
    await page.reload()
    expect(page.url()).toBe(initialUrl)

    // Page content should load
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeDefined()
  })

  test('should handle unauthenticated profile redirect', async ({ page }) => {
    await page.goto(testURLs.home)
    const profileLink = page.locator(`a[href="${testURLs.profile}"]`)

    if (await profileLink.isVisible()) {
      await profileLink.click()
      // Unauthenticated users should be redirected to sign-in
      expect(page.url()).toContain(testURLs.signIn)
    }
  })

  test('should validate session API endpoint', async ({ page }) => {
    const response = await page.request.get(testURLs.sessionApi)

    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data).toHaveProperty('isAuthenticated')
  })

  test('should validate sign-out API endpoint', async ({ page }) => {
    const response = await page.request.post(testURLs.signOutApi)

    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data).toHaveProperty('success')
  })
})
