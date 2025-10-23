/**
 * Unit tests for SignIn page
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals'

// Mock next/navigation redirect
const mockRedirect = jest.fn()
jest.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

// Mock Clerk auth
const mockAuth = jest.fn()
jest.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
}))

// Mock Clerk's SignIn component
jest.mock('@clerk/nextjs', () => ({
  SignIn: jest.fn(() => <div data-testid="clerk-sign-in">Clerk SignIn Component</div>),
}))

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('redirects signed-in users to dashboard', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const SignInPage = (await import('@/app/(auth)/sign-in/page')).default
    await SignInPage()

    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  test('allows unauthenticated users to see sign-in page', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const SignInPage = (await import('@/app/(auth)/sign-in/page')).default
    const result = await SignInPage()

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(result).toBeDefined()
  })
})
