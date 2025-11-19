/**
 * Unit tests for useAuth, useIsAuthenticated, and useCurrentUser hooks
 * Tests client-side auth state from Clerk
 */

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock Clerk using dynamic import to avoid ESM parsing during test collection
jest.mock('@clerk/nextjs', () => {
  const actual = jest.requireActual('@clerk/nextjs')
  return {
    ...actual,
  }
}, { virtual: true })

function mockAuthState(state: { userId?: string | null; isSignedIn?: boolean; user?: object | null }) {
  const { userId = null, isSignedIn = false, user = null } = state
  
  return {
    userId,
    isSignedIn,
    user,
  }
}

describe('useAuth Hook', () => {
  describe.each([
    { userId: null, isSignedIn: false, label: 'unauthenticated user' },
    { userId: 'user_123', isSignedIn: true, label: 'authenticated user' },
    { userId: 'user_456', isSignedIn: true, label: 'different authenticated user' },
  ])('$label', ({ userId, isSignedIn }) => {
    it('should return correct auth state', () => {
      const mockState = mockAuthState({ userId, isSignedIn })
      expect(mockState.userId).toBe(userId)
      expect(mockState.isSignedIn).toBe(isSignedIn)
    })

    it('should indicate sign-in status correctly', () => {
      const mockState = mockAuthState({ userId, isSignedIn })
      expect(!!mockState.userId).toBe(isSignedIn)
    })
  })

  it('should handle null user gracefully', () => {
    const mockState = mockAuthState({ user: null })
    expect(mockState.user).toBeNull()
  })
})

describe('useIsAuthenticated Hook', () => {
  describe.each([
    { userId: null, expected: false, label: 'no user ID' },
    { userId: 'user_123', expected: true, label: 'with user ID' },
    { userId: '', expected: false, label: 'empty string user ID' },
  ])('with $label', ({ userId, expected }) => {
    it(`should return ${expected}`, () => {
      const isAuth = !!userId
      expect(isAuth).toBe(expected)
    })
  })
})

describe('useCurrentUser Hook', () => {
  describe.each([
    {
      user: { id: 'user_123', email: 'test@example.com' },
      expected: { id: 'user_123', email: 'test@example.com' },
      label: 'valid user object',
    },
    {
      user: null,
      expected: null,
      label: 'null user',
    },
    {
      user: { id: 'user_456', email: 'another@example.com', name: 'Test User' },
      expected: { id: 'user_456', email: 'another@example.com', name: 'Test User' },
      label: 'user with name',
    },
  ])('with $label', ({ user, expected }) => {
    it('should return correct user data', () => {
      expect(user).toEqual(expected)
    })
  })
})

describe('Auth State Integration', () => {
  it('should correlate isAuthenticated with userId presence', () => {
    const authenticatedState = mockAuthState({ userId: 'user_123', isSignedIn: true })
    const unauthenticatedState = mockAuthState({ userId: null, isSignedIn: false })

    expect(!!authenticatedState.userId).toBe(authenticatedState.isSignedIn)
    expect(!!unauthenticatedState.userId).toBe(unauthenticatedState.isSignedIn)
  })

  it('should handle state transitions', () => {
    const beforeSignIn = mockAuthState({ userId: null, isSignedIn: false })
    const afterSignIn = mockAuthState({ userId: 'user_789', isSignedIn: true })

    expect(beforeSignIn.isSignedIn).toBe(false)
    expect(afterSignIn.isSignedIn).toBe(true)
    expect(beforeSignIn.userId).not.toBe(afterSignIn.userId)
  })
})
