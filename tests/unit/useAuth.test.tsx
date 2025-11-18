/**
 * Unit tests for useAuth hook
 * Tests that the hook correctly exposes authentication state and user profile
 */

import { renderHook } from '@testing-library/react'
import { useAuth } from '@/components/auth/useAuth'
import * as ClerkReact from '@clerk/nextjs'

// Mock Clerk's useAuth and useUser hooks
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
  useUser: jest.fn(),
}))

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      ;(ClerkReact.useAuth as jest.Mock).mockReturnValue({
        userId: null,
        isLoaded: true,
      })
      ;(ClerkReact.useUser as jest.Mock).mockReturnValue({
        user: null,
        isLoaded: true,
      })
    })

    it('should return isAuthenticated as false', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should return user as null', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.user).toBeNull()
    })

    it('should return isLoading as false when loaded', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('when user is authenticated', () => {
    beforeEach(() => {
      const mockUser = {
        id: 'user_test_123',
        fullName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        imageUrl: 'https://example.com/avatar.jpg',
        primaryEmailAddress: {
          emailAddress: 'john@example.com',
        },
      }

      ;(ClerkReact.useAuth as jest.Mock).mockReturnValue({
        userId: 'user_test_123',
        isLoaded: true,
      })
      ;(ClerkReact.useUser as jest.Mock).mockReturnValue({
        user: mockUser,
        isLoaded: true,
      })
    })

    it('should return isAuthenticated as true', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should return user profile with correct data', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.user).toEqual({
        clerkId: 'user_test_123',
        email: 'john@example.com',
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
      })
    })

    it('should return isLoading as false when loaded', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('during loading', () => {
    beforeEach(() => {
      ;(ClerkReact.useAuth as jest.Mock).mockReturnValue({
        userId: undefined,
        isLoaded: false,
      })
      ;(ClerkReact.useUser as jest.Mock).mockReturnValue({
        user: undefined,
        isLoaded: false,
      })
    })

    it('should return isLoading as true', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.isLoading).toBe(true)
    })

    it('should return isAuthenticated as false while loading', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should return user as null while loading', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.user).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle missing email gracefully', () => {
      const mockUser = {
        id: 'user_test_456',
        fullName: 'Jane Doe',
        firstName: 'Jane',
        lastName: 'Doe',
        imageUrl: 'https://example.com/avatar2.jpg',
        primaryEmailAddress: null,
      }

      ;(ClerkReact.useAuth as jest.Mock).mockReturnValue({
        userId: 'user_test_456',
        isLoaded: true,
      })
      ;(ClerkReact.useUser as jest.Mock).mockReturnValue({
        user: mockUser,
        isLoaded: true,
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.user?.email).toBe('')
      expect(result.current.user?.name).toBe('Jane Doe')
    })

    it('should handle missing avatar URL gracefully', () => {
      const mockUser = {
        id: 'user_test_789',
        fullName: 'Bob Smith',
        firstName: 'Bob',
        lastName: 'Smith',
        imageUrl: null,
        primaryEmailAddress: {
          emailAddress: 'bob@example.com',
        },
      }

      ;(ClerkReact.useAuth as jest.Mock).mockReturnValue({
        userId: 'user_test_789',
        isLoaded: true,
      })
      ;(ClerkReact.useUser as jest.Mock).mockReturnValue({
        user: mockUser,
        isLoaded: true,
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.user?.avatarUrl).toBeNull()
      expect(result.current.user?.email).toBe('bob@example.com')
    })
  })
})
