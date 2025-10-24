/**
 * Unit tests for SignUp page
 * Note: Authenticated user redirects are now handled in middleware
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'

// Mock Clerk's SignUp component
const mockSignUp = jest.fn((props) => (
  <div data-testid="clerk-sign-up" data-routing={props.routing}>
    Clerk SignUp Component
  </div>
))

jest.mock('@clerk/nextjs', () => ({
  SignUp: mockSignUp,
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

  test('renders the Clerk SignUp component', async () => {
    const SignUpPage = await getSignUpPage()
    const result = SignUpPage()
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

  test('wraps SignUp in centered container', async () => {
    const SignUpPage = await getSignUpPage()
    const result = SignUpPage()
    const { container } = render(result as React.ReactElement)

    const wrapper = container.querySelector('.flex.items-center.justify-center')
    expect(wrapper).toBeInTheDocument()
  })
})
