/**
 * Unit tests for Profile redirect page
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals'

// Mock next/navigation redirect
const mockRedirect = jest.fn()
jest.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('redirects to settings profile page', async () => {
    const ProfilePage = (await import('@/app/profile/page')).default
    ProfilePage()

    expect(mockRedirect).toHaveBeenCalledWith('/settings/profile')
  })
})
