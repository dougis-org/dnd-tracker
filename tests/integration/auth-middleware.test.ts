/**
 * Integration tests for auth middleware protection logic
 * Tests the isProtectedRoute function independently of the actual middleware
 */

const PROTECTED_ROUTES = ['/dashboard', '/subscription', '/profile', '/settings']
const PUBLIC_ROUTES = ['/', '/sign-in', '/sign-up', '/landing']

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => {
    if (pathname === route) return true
    const nestedPath = `${route}/`
    return pathname.startsWith(nestedPath)
  })
}

describe('Auth Middleware Route Protection Logic', () => {
  describe.each(PROTECTED_ROUTES)(
    'Protected route: %s',
    (route) => {
      it('should be identified as protected', () => {
        expect(isProtectedRoute(route)).toBe(true)
      })

      it('should protect nested paths', () => {
        expect(isProtectedRoute(`${route}/sub`)).toBe(true)
        expect(isProtectedRoute(`${route}/sub/deep`)).toBe(true)
      })
    }
  )

  describe.each(PUBLIC_ROUTES)(
    'Public route: %s',
    (route) => {
      it('should not be protected', () => {
        expect(isProtectedRoute(route)).toBe(false)
      })
    }
  )

  describe.each([
    { pathname: '/dashboard-info', shouldProtect: false },
    { pathname: '/dashboards', shouldProtect: false },
    { pathname: '/dashboard_settings', shouldProtect: false },
    { pathname: '/other', shouldProtect: false },
  ])(
    'Similar-named route: $pathname',
    ({ pathname, shouldProtect }) => {
      it(`should ${shouldProtect ? '' : 'not '}protect`, () => {
        expect(isProtectedRoute(pathname)).toBe(shouldProtect)
      })
    }
  )

  describe('Route identification edge cases', () => {
    it.each([
      ['', false],
      ['/', false],
      ['/d', false],
      ['/dashboard', true],
      ['/dashboard/', true],
      ['/dashboard/x', true],
    ])('pathname "%s" should be %s protected', (pathname, expected) => {
      expect(isProtectedRoute(pathname)).toBe(expected)
    })
  })

  describe('Multiple route matching', () => {
    it('should match only the relevant protected route', () => {
      const pathname = '/subscription/plans'
      expect(isProtectedRoute(pathname)).toBe(true)
      expect(PROTECTED_ROUTES.some((r) => pathname.startsWith(r))).toBe(true)
    })

    it('should not cross-match between routes', () => {
      expect(isProtectedRoute('/dashboard')).toBe(true)
      expect(isProtectedRoute('/profile')).toBe(true)
      expect(isProtectedRoute('/dashboard-profile')).toBe(false)
    })
  })
})
