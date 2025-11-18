/**
 * Integration tests for authentication middleware
 * Tests middleware redirect behavior for protected routes
 */

import { validateReturnUrl, buildSignInRedirect, isProtectedRoute } from '@/lib/auth/middleware'

describe('Auth Middleware', () => {
  describe('isProtectedRoute', () => {
    it('should identify protected routes', () => {
      expect(isProtectedRoute('/dashboard')).toBe(true)
      expect(isProtectedRoute('/subscription')).toBe(true)
      expect(isProtectedRoute('/profile')).toBe(true)
    })

    it('should identify protected routes with nested paths', () => {
      expect(isProtectedRoute('/dashboard/characters')).toBe(true)
      expect(isProtectedRoute('/subscription/billing')).toBe(true)
    })

    it('should not identify public routes as protected', () => {
      expect(isProtectedRoute('/')).toBe(false)
      expect(isProtectedRoute('/sign-in')).toBe(false)
      expect(isProtectedRoute('/sign-up')).toBe(false)
      expect(isProtectedRoute('/about')).toBe(false)
    })
  })

  describe('validateReturnUrl', () => {
    it('should return null for empty/undefined return URLs', () => {
      expect(validateReturnUrl(undefined)).toBeNull()
      expect(validateReturnUrl(null)).toBeNull()
      expect(validateReturnUrl('')).toBeNull()
    })

    it('should reject absolute URLs to other domains', () => {
      expect(validateReturnUrl('http://example.com/page')).toBeNull()
      expect(validateReturnUrl('https://evil.com/')).toBeNull()
    })

    it('should reject sign-in/sign-up URLs (prevent redirect loops)', () => {
      expect(validateReturnUrl('/sign-in')).toBeNull()
      expect(validateReturnUrl('/sign-in?foo=bar')).toBeNull()
      expect(validateReturnUrl('/sign-up')).toBeNull()
      expect(validateReturnUrl('/sign-up?foo=bar')).toBeNull()
    })

    it('should reject root path (prevent redirect loops)', () => {
      expect(validateReturnUrl('/')).toBeNull()
    })

    it('should accept valid relative paths', () => {
      expect(validateReturnUrl('/dashboard')).toBe('/dashboard')
      expect(validateReturnUrl('/profile')).toBe('/profile')
      expect(validateReturnUrl('/dashboard/characters/123')).toBe(
        '/dashboard/characters/123',
      )
    })

    it('should reject paths not starting with /', () => {
      expect(validateReturnUrl('dashboard')).toBeNull()
      expect(validateReturnUrl('profile')).toBeNull()
      expect(validateReturnUrl('//example.com')).toBeNull()
    })
  })

  describe('buildSignInRedirect', () => {
    it('should return sign-in URL without return_to for missing return URL', () => {
      expect(buildSignInRedirect()).toBe('/sign-in')
      expect(buildSignInRedirect(null)).toBe('/sign-in')
    })

    it('should build sign-in URL with return_to query parameter for valid return URL', () => {
      const result = buildSignInRedirect('/dashboard')
      expect(result).toBe('/sign-in?return_to=%2Fdashboard')
    })

    it('should encode special characters in return URL', () => {
      const result = buildSignInRedirect('/dashboard/test')
      expect(result).toContain('return_to=')
      expect(result).toContain('dashboard%2Ftest')
    })

    it('should not include return_to for invalid return URLs', () => {
      expect(buildSignInRedirect('/sign-in')).toBe('/sign-in')
      expect(buildSignInRedirect('http://example.com')).toBe('/sign-in')
      expect(buildSignInRedirect('/')).toBe('/sign-in')
    })
  })

  describe('middleware redirect behavior', () => {
    it('should preserve return path after sign-in', () => {
      const returnPath = '/dashboard/characters'
      const signInUrl = buildSignInRedirect(returnPath)

      expect(signInUrl).toContain(encodeURIComponent(returnPath))
    })

    it('should prevent redirect loops with recursive checks', () => {
      // Test that sign-in URLs always redirect to sign-in without loops
      const maliciousReturnPath = '/sign-in?return_to=/sign-in'
      expect(validateReturnUrl(maliciousReturnPath)).toBeNull()
    })
  })
})
