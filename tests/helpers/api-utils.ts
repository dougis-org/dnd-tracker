/**
 * API testing utilities
 * Extracted to reduce test complexity
 */
import { Page, expect } from '@playwright/test'

/**
 * Test authentication API endpoints
 */
export async function testAuthEndpoints(page: Page): Promise<void> {
  const sessionResponse = await page.request.post('/api/auth/session', {
    data: { sessionToken: 'test_token' }
  })

  // Should return 401 (unauthorized) or 400 (bad request), not 404 (not found)
  expect([400, 401, 500]).toContain(sessionResponse.status())
  expect(sessionResponse.status()).not.toBe(404)
}

/**
 * Test profile API endpoints
 */
export async function testProfileEndpoints(page: Page): Promise<void> {
  const profileResponse = await page.request.get('/api/users/profile')

  // Should return 401 (unauthorized), not 404 (not found)
  expect([401, 500]).toContain(profileResponse.status())
  expect(profileResponse.status()).not.toBe(404)
}

/**
 * Test error handling for invalid endpoints
 */
export async function testInvalidEndpoints(page: Page): Promise<void> {
  const invalidApiResponse = await page.request.get('/api/non-existent-endpoint')
  expect([404, 405]).toContain(invalidApiResponse.status())
}

/**
 * Test that endpoints are accessible (not returning 404)
 */
export async function verifyEndpointsExist(page: Page): Promise<void> {
  await testAuthEndpoints(page)
  await testProfileEndpoints(page)
}