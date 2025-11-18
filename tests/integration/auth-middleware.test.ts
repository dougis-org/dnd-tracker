/**
 * Integration tests for authentication protection
 * Tests auth check API route and protected route behavior
 */

import { GET } from '@/app/api/auth/check/route'
import { NextRequest } from 'next/server'

const { auth } = require('@clerk/nextjs/server')

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

describe('Auth Protection', () => {
  const testBaseUrl = 'http://localhost:3000'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  function createAuthCheckRequest(path: string): NextRequest {
    // eslint-disable-next-line no-undef
    const url = new URL(`/api/auth/check?path=${path}`, testBaseUrl)
    return new NextRequest(url)
  }

  describe('Protected Routes Identification', () => {
    const protectedRoutes = ['/dashboard', '/subscription', '/profile']
    const publicRoutes = ['/', '/sign-in', '/sign-up', '/about']

    it('should identify protected routes', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auth.mockResolvedValue({ userId: 'test_user' } as any)

      for (const route of protectedRoutes) {
        const request = createAuthCheckRequest(route)
        const response = await GET(request)
        const data = await response.json()

        expect(data.requiresAuth).toBe(true)
      }
    })

    it('should identify public routes', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auth.mockResolvedValue({ userId: null } as any)

      for (const route of publicRoutes) {
        const request = createAuthCheckRequest(route)
        const response = await GET(request)
        const data = await response.json()

        expect(data.requiresAuth).toBe(false)
      }
    })
  })

  describe('Authentication Status', () => {
    it('should return authenticated status for logged-in users', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auth.mockResolvedValue({ userId: 'user_123' } as any)

      const request = createAuthCheckRequest('/dashboard')
      const response = await GET(request)
      const data = await response.json()

      expect(data.isAuthenticated).toBe(true)
      expect(data.userId).toBe('user_123')
      expect(data.requiresAuth).toBe(true)
      expect(data.redirectUrl).toBeNull()
    })

    it('should return unauthenticated status for logged-out users', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auth.mockResolvedValue({ userId: null } as any)

      const request = createAuthCheckRequest('/dashboard')
      const response = await GET(request)
      const data = await response.json()

      expect(data.isAuthenticated).toBe(false)
      expect(data.userId).toBeNull()
      expect(data.requiresAuth).toBe(true)
    })
  })

  describe('Redirect URL Generation', () => {
    it('should provide redirect URL for unauthenticated access to protected routes', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auth.mockResolvedValue({ userId: null } as any)

      const request = createAuthCheckRequest('/dashboard')
      const response = await GET(request)
      const data = await response.json()

      expect(data.redirectUrl).toContain('/sign-in')
      expect(data.redirectUrl).toContain('redirect_url=%2Fdashboard')
    })

    it('should not provide redirect URL for unauthenticated access to public routes', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auth.mockResolvedValue({ userId: null } as any)

      const request = createAuthCheckRequest('/')
      const response = await GET(request)
      const data = await response.json()

      expect(data.redirectUrl).toBeNull()
    })

    it('should not provide redirect URL for authenticated users', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auth.mockResolvedValue({ userId: 'user_123' } as any)

      const request = createAuthCheckRequest('/dashboard')
      const response = await GET(request)
      const data = await response.json()

      expect(data.redirectUrl).toBeNull()
    })
  })

  describe('Nested Protected Routes', () => {
    it('should protect nested routes under protected paths', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auth.mockResolvedValue({ userId: null } as any)

      const nestedRoutes = ['/dashboard/characters', '/subscription/billing', '/profile/settings']

      for (const route of nestedRoutes) {
        const request = createAuthCheckRequest(route)
        const response = await GET(request)
        const data = await response.json()

        expect(data.requiresAuth).toBe(true)
        expect(data.redirectUrl).toBeTruthy()
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle auth errors gracefully', async () => {
      auth.mockRejectedValue(new Error('Auth service unavailable'))

      const request = createAuthCheckRequest('/dashboard')
      const response = await GET(request)

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.isAuthenticated).toBe(false)
      expect(data.redirectUrl).toBeTruthy()
    })

    it('should default path to / if not provided', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auth.mockResolvedValue({ userId: null } as any)

      // eslint-disable-next-line no-undef
      const url = new URL('/api/auth/check', testBaseUrl)
      const request = new NextRequest(url)
      const response = await GET(request)
      const data = await response.json()

      expect(data.requiresAuth).toBe(false)
      expect(data.redirectUrl).toBeNull()
    })
  })
})
