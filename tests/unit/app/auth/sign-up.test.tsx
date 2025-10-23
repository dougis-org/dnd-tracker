/**
 * Unit tests for SignUp page
 */

import { describe, test, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'

// Mock Clerk's SignUp component
jest.mock('@clerk/nextjs', () => ({
  SignUp: jest.fn(() => <div data-testid="clerk-sign-up">Clerk SignUp Component</div>),
}))

// Dynamically import page after mocks are set up
const getSignUpPage = async () => {
  const module = await import('@/app/(auth)/sign-up/page')
  return module.default
}

describe('SignUpPage', () => {
  test('renders the Clerk SignUp component', async () => {
    const SignUpPage = await getSignUpPage()
    render(<SignUpPage />)

    expect(screen.getByTestId('clerk-sign-up')).toBeInTheDocument()
    expect(screen.getByText('Clerk SignUp Component')).toBeInTheDocument()
  })

  test('wraps SignUp in centered container', async () => {
    const SignUpPage = await getSignUpPage()
    const { container } = render(<SignUpPage />)

    const wrapper = container.querySelector('.flex.items-center.justify-center')
    expect(wrapper).toBeInTheDocument()
  })
})
