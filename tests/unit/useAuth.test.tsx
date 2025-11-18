/**
 * Unit tests for useAuth hook
 * Tests that the hook correctly exposes authentication state and user profile
 */

import { renderHook } from '@testing-library/react'
import { useAuth, useIsAuthenticated, useCurrentUser } from '@/components/auth/useAuth'
import * as ClerkReact from '@clerk/nextjs'

// Mock Clerk's useAuth and useUser hooks
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
  useUser: jest.fn(),
}))

// Test fixtures
const createMockUser = (overrides = {}) => ({
  id: 'user_test_123',
  fullName: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  imageUrl: 'https://example.com/avatar.jpg',
  primaryEmailAddress: {
    emailAddress: 'john@example.com',
  },
  ...overrides,
})

// Test helpers
const mockAuthState = (authenticated = false, loading = false, user = null) => {
  ;(ClerkReact.useAuth as jest.Mock).mockReturnValue({
    userId: authenticated ? 'user_test_123' : null,
    isLoaded: !loading,
  })
  ;(ClerkReact.useUser as jest.Mock).mockReturnValue({
    user,
    isLoaded: !loading,
  })
}

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('unauthenticated state', () => {
    beforeEach(() => {
      mockAuthState()
    })

    it('should return isAuthenticated false, user null, isLoading false', () => {
      const { result } = renderHook(() => useAuth())
      expect(result.current).toEqual({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      })
    })
  })

  describe('authenticated state', () => {
    beforeEach(() => {
      mockAuthState(true, false, createMockUser())
    })

    it('should return user profile with transformed data', () => {
      const { result } = renderHook(() => useAuth())
      expect(result.current.user).toEqual({
        clerkId: 'user_test_123',
        email: 'john@example.com',
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
      })
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('loading state', () => {
    beforeEach(() => {
      mockAuthState(false, true)
    })

    it('should return isLoading true, user null, isAuthenticated false', () => {
      const { result } = renderHook(() => useAuth())
      expect(result.current).toEqual({
        isAuthenticated: false,
        user: null,
        isLoading: true,
      })
    })
  })

  describe('edge cases', () => {
    it('should handle missing email', () => {
      const mockUser = createMockUser({ primaryEmailAddress: null })
      mockAuthState(true, false, mockUser)

      const { result } = renderHook(() => useAuth())
      expect(result.current.user?.email).toBe('')
    })

    it('should handle missing avatar', () => {
      const mockUser = createMockUser({ imageUrl: null })
      mockAuthState(true, false, mockUser)

      const { result } = renderHook(() => useAuth())
      expect(result.current.user?.avatarUrl).toBeNull()
    })
  })
})

describe('useIsAuthenticated hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return false when user is not authenticated', () => {
    mockAuthState(false)
    const { result } = renderHook(() => useIsAuthenticated())
    expect(result.current).toBe(false)
  })

  it('should return true when user is authenticated', () => {
    mockAuthState(true, false, createMockUser())
    const { result } = renderHook(() => useIsAuthenticated())
    expect(result.current).toBe(true)
  })
})

describe('useCurrentUser hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return null when user is not authenticated', () => {
    mockAuthState(false)
    const { result } = renderHook(() => useCurrentUser())
    expect(result.current).toBeNull()
  })

  it('should return user profile when authenticated', () => {
    mockAuthState(true, false, createMockUser())
    const { result } = renderHook(() => useCurrentUser())
    expect(result.current).toEqual({
      clerkId: 'user_test_123',
      email: 'john@example.com',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
    })
  })
})
