/**
 * Unit tests for SignIn page
 */

import { describe, test, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'

// Mock Clerk's SignIn component
jest.mock('@clerk/nextjs', () => ({
  SignIn: jest.fn(() => <div data-testid="clerk-sign-in">Clerk SignIn Component</div>),
}))

// Dynamically import page after mocks are set up
const getSignInPage = async () => {
  const module = await import('@/app/(auth)/sign-in/page')
  return module.default
}

describe('SignInPage', () => {
  test('renders the Clerk SignIn component', async () => {
    const SignInPage = await getSignInPage()
    render(<SignInPage />)

    expect(screen.getByTestId('clerk-sign-in')).toBeInTheDocument()
    expect(screen.getByText('Clerk SignIn Component')).toBeInTheDocument()
  })

  test('wraps SignIn in centered container', async () => {
    const SignInPage = await getSignInPage()
    const { container } = render(<SignInPage />)

    const wrapper = container.querySelector('.flex.items-center.justify-center')
    expect(wrapper).toBeInTheDocument()
  })
})
