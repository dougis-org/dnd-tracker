/**
 * Unit tests for SignIn page
 * Note: Authenticated user redirects are now handled in middleware
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'

// Mock Clerk's SignIn component
const mockSignIn = jest.fn((props) => (
  <div data-testid="clerk-sign-in" data-routing={props.routing}>
    Clerk SignIn Component
  </div>
))

jest.mock('@clerk/nextjs', () => ({
  SignIn: mockSignIn,
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

  test('renders the Clerk SignIn component', async () => {
    const SignInPage = await getSignInPage()
    const result = SignInPage()
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

  test('wraps SignIn in centered container', async () => {
    const SignInPage = await getSignInPage()
    const result = SignInPage()
    const { container } = render(result as React.ReactElement)

    const wrapper = container.querySelector('.flex.items-center.justify-center')
    expect(wrapper).toBeInTheDocument()
  })
})
