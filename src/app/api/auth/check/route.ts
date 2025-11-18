import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/subscription', '/profile']

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const pathname = searchParams.get('path') || '/'

  try {
    // Dynamically import auth to avoid circular dependencies in tests
    const { auth } = await import('@clerk/nextjs/server')
    const { userId } = await auth()
    const requiresAuth = isProtectedRoute(pathname)
    const isAuthenticated = !!userId

    if (requiresAuth && !isAuthenticated) {
      return NextResponse.json({
        isAuthenticated: false,
        userId: null,
        requiresAuth: true,
        redirectUrl: `/sign-in?redirect_url=${encodeURIComponent(pathname)}`,
      })
    }

    return NextResponse.json({
      isAuthenticated,
      userId,
      requiresAuth,
      redirectUrl: null,
    })
  } catch (error) {
    console.error('Auth check error:', error)
    const requiresAuth = isProtectedRoute(pathname)

    return NextResponse.json(
      {
        isAuthenticated: false,
        userId: null,
        requiresAuth,
        redirectUrl: requiresAuth
          ? `/sign-in?redirect_url=${encodeURIComponent(pathname)}`
          : null,
      },
      { status: 401 }
    )
  }
}
