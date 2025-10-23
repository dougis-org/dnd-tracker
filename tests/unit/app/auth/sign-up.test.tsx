/**
 * Unit tests for SignUp page
 */

import { describe, test, expect, jest } from '@jest/globals'
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
  test('renders the Clerk SignUp component with correct props', async () => {
    const SignUpPage = await getSignUpPage()
    render(<SignUpPage />)

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
    const { container } = render(<SignUpPage />)

    const wrapper = container.querySelector('.flex.items-center.justify-center')
    expect(wrapper).toBeInTheDocument()
  })
})
