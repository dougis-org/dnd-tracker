/**
 * Unit tests for SignUp page
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

// Mock Clerk's SignUp component
const mockSignUp = jest.fn((props) => (
  <div data-testid="clerk-sign-up" data-routing={props.routing}>
    Clerk SignUp Component
  </div>
))

// Mock Clerk auth
const mockAuth = jest.fn()

jest.mock('@clerk/nextjs', () => ({
  SignUp: mockSignUp,
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
}))

// Dynamically import page after mocks are set up
const getSignUpPage = async () => {
  const module = await import('@/app/(auth)/sign-up/page')
  return module.default
}

describe('SignUpPage', () => {
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

    const SignUpPage = await getSignUpPage()

    await expect(SignUpPage()).rejects.toThrow('NEXT_REDIRECT: /dashboard')
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

    const SignUpPage = await getSignUpPage()

    await expect(SignUpPage()).rejects.toThrow('NEXT_REDIRECT: /profile-setup')
    expect(mockRedirect).toHaveBeenCalledWith('/profile-setup')
  })

  test('renders the Clerk SignUp component for unauthenticated users', async () => {
    mockAuth.mockResolvedValue({
      userId: null,
      sessionClaims: null,
    })

    const SignUpPage = await getSignUpPage()
    const result = await SignUpPage()
    render(result as React.ReactElement)

    expect(screen.getByTestId('clerk-sign-up')).toBeInTheDocument()
    expect(mockSignUp).toHaveBeenCalled()

    const callArgs = mockSignUp.mock.calls[0][0]
    expect(callArgs).toMatchObject({
      routing: 'path',
      path: '/sign-up',
      signInUrl: '/sign-in',
      fallbackRedirectUrl: '/profile-setup',
    })
  })

  test('wraps SignUp in centered container for unauthenticated users', async () => {
    mockAuth.mockResolvedValue({
      userId: null,
      sessionClaims: null,
    })

    const SignUpPage = await getSignUpPage()
    const result = await SignUpPage()
    const { container } = render(result as React.ReactElement)

    const wrapper = container.querySelector('.flex.items-center.justify-center')
    expect(wrapper).toBeInTheDocument()
  })
})
