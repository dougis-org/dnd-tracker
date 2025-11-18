/**
 * Integration tests for authentication middleware
 * Tests middleware redirect behavior for protected routes
 */

import {
  validateReturnUrl,
  buildSignInRedirect,
  isProtectedRoute,
} from '@/lib/auth/middleware'

// Test data
const PROTECTED_ROUTES = ['/dashboard', '/subscription', '/profile']
const PUBLIC_ROUTES = ['/', '/sign-in', '/sign-up', '/about']
const NESTED_PROTECTED_ROUTES = ['/dashboard/characters', '/subscription/billing']

describe('Auth Middleware', () => {
  describe('isProtectedRoute', () => {
    it('should identify protected routes', () => {
      PROTECTED_ROUTES.forEach((route) => {
        expect(isProtectedRoute(route)).toBe(true)
      })
    })

    it('should identify nested protected routes', () => {
      NESTED_PROTECTED_ROUTES.forEach((route) => {
        expect(isProtectedRoute(route)).toBe(true)
      })
    })

    it('should not identify public routes as protected', () => {
      PUBLIC_ROUTES.forEach((route) => {
        expect(isProtectedRoute(route)).toBe(false)
      })
    })
  })

  describe('validateReturnUrl', () => {
    describe('invalid URLs', () => {
      it('should reject empty/undefined', () => {
        expect(validateReturnUrl(undefined)).toBeNull()
        expect(validateReturnUrl(null)).toBeNull()
        expect(validateReturnUrl('')).toBeNull()
      })

      it('should reject absolute URLs', () => {
        expect(validateReturnUrl('http://example.com/page')).toBeNull()
        expect(validateReturnUrl('https://evil.com/')).toBeNull()
      })

      it('should reject sign-in/sign-up URLs', () => {
        expect(validateReturnUrl('/sign-in')).toBeNull()
        expect(validateReturnUrl('/sign-up')).toBeNull()
      })

      it('should reject root path', () => {
        expect(validateReturnUrl('/')).toBeNull()
      })

      it('should reject non-absolute paths', () => {
        expect(validateReturnUrl('dashboard')).toBeNull()
        expect(validateReturnUrl('//example.com')).toBeNull()
      })
    })

    describe('valid URLs', () => {
      it('should accept valid relative paths', () => {
        const validPaths = ['/dashboard', '/profile', '/dashboard/characters/123']
        validPaths.forEach((path) => {
          expect(validateReturnUrl(path)).toBe(path)
        })
      })
    })
  })

  describe('buildSignInRedirect', () => {
    it('should return sign-in URL for missing return URL', () => {
      expect(buildSignInRedirect()).toBe('/sign-in')
      expect(buildSignInRedirect(null)).toBe('/sign-in')
    })

    it('should build URL with return_to for valid paths', () => {
      const result = buildSignInRedirect('/dashboard')
      expect(result).toBe('/sign-in?return_to=%2Fdashboard')
    })

    it('should encode special characters', () => {
      const result = buildSignInRedirect('/dashboard/test')
      expect(result).toContain('return_to=')
      expect(result).toContain('dashboard%2Ftest')
    })

    it('should not include return_to for invalid URLs', () => {
      const invalidUrls = ['/sign-in', 'http://example.com', '/']
      invalidUrls.forEach((url) => {
        expect(buildSignInRedirect(url)).toBe('/sign-in')
      })
    })
  })

  describe('redirect loop prevention', () => {
    it('should prevent sign-in redirect loops', () => {
      const maliciousUrl = '/sign-in?return_to=/sign-in'
      expect(validateReturnUrl(maliciousUrl)).toBeNull()
    })

    it('should preserve valid return paths', () => {
      const returnPath = '/dashboard/characters'
      const signInUrl = buildSignInRedirect(returnPath)
      expect(signInUrl).toContain(encodeURIComponent(returnPath))
    })
  })
})
