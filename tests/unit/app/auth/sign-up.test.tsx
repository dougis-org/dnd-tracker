/**
 * Unit tests for SignUp page
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

// Mock Clerk's SignUp component
jest.mock('@clerk/nextjs', () => ({
  SignUp: jest.fn(() => <div data-testid="clerk-sign-up">Clerk SignUp Component</div>),
}))

describe('SignUpPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('redirects signed-in users to dashboard', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const SignUpPage = (await import('@/app/(auth)/sign-up/page')).default
    await SignUpPage()

    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  test('allows unauthenticated users to see sign-up page', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const SignUpPage = (await import('@/app/(auth)/sign-up/page')).default
    const result = await SignUpPage()

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(result).toBeDefined()
  })
})
