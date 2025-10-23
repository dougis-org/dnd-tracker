/**
 * Unit tests for SignIn page
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'

// Mock Next.js navigation - redirect throws an error internally
const mockRedirect = jest.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT: ${url}`)
})

jest.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

// Mock Clerk's SignIn component
const mockSignIn = jest.fn((props) => (
  <div data-testid="clerk-sign-in" data-routing={props.routing}>
    Clerk SignIn Component
  </div>
))

// Mock Clerk auth
const mockAuth = jest.fn()

jest.mock('@clerk/nextjs', () => ({
  SignIn: mockSignIn,
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
}))

// Dynamically import page after mocks are set up
const getSignInPage = async () => {
  const module = await import('@/app/(auth)/sign-in/page')
  return module.default
}

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('redirects to dashboard when user is signed in with complete profile', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user_123',
      sessionClaims: {
        publicMetadata: {
          profileSetupCompleted: true,
        },
      },
    })

    const SignInPage = await getSignInPage()

    await expect(SignInPage()).rejects.toThrow('NEXT_REDIRECT: /dashboard')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  test('redirects to profile-setup when user is signed in without complete profile', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user_123',
      sessionClaims: {
        publicMetadata: {
          profileSetupCompleted: false,
        },
      },
    })

    const SignInPage = await getSignInPage()

    await expect(SignInPage()).rejects.toThrow('NEXT_REDIRECT: /profile-setup')
    expect(mockRedirect).toHaveBeenCalledWith('/profile-setup')
  })

  test('renders the Clerk SignIn component for unauthenticated users', async () => {
    mockAuth.mockResolvedValue({
      userId: null,
      sessionClaims: null,
    })

    const SignInPage = await getSignInPage()
    const result = await SignInPage()
    render(result as React.ReactElement)

    expect(screen.getByTestId('clerk-sign-in')).toBeInTheDocument()
    expect(mockSignIn).toHaveBeenCalled()

    const callArgs = mockSignIn.mock.calls[0][0]
    expect(callArgs).toMatchObject({
      routing: 'path',
      path: '/sign-in',
      signUpUrl: '/sign-up',
      fallbackRedirectUrl: '/dashboard',
    })
  })

  test('wraps SignIn in centered container for unauthenticated users', async () => {
    mockAuth.mockResolvedValue({
      userId: null,
      sessionClaims: null,
    })

    const SignInPage = await getSignInPage()
    const result = await SignInPage()
    const { container } = render(result as React.ReactElement)

    const wrapper = container.querySelector('.flex.items-center.justify-center')
    expect(wrapper).toBeInTheDocument()
  })
})
