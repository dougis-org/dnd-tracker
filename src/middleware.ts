/**
 * Next.js Middleware for authentication and route protection
 * Enforces protected routes and redirects unauthenticated users to sign-in
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';
import { buildSignInRedirect } from '@/lib/auth/middleware';

/**
 * Protected routes that require authentication
 * This middleware will redirect unauthenticated users to /sign-in
 */
const PROTECTED_ROUTES = ['/dashboard', '/subscription', '/profile'];

/**
 * Middleware function - runs on every request
 * Checks authentication for protected routes and handles redirects
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current route is protected
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    // Route is not protected, allow the request
    return NextResponse.next();
  }

  try {
    // Get the authenticated session
    const { userId } = await auth();

    if (!userId) {
      // User is not authenticated, redirect to sign-in
      const signInUrl = buildSignInRedirect(pathname);
      return NextResponse.redirect(`${request.nextUrl.origin}${signInUrl}`);
    }

    // User is authenticated, allow the request
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware auth check error:', error);

    // On error, redirect to sign-in for safety
    const signInUrl = buildSignInRedirect(pathname);
    return NextResponse.redirect(`${request.nextUrl.origin}${signInUrl}`);
  }
}

/**
 * Configure which routes this middleware should run on
 * We protect specific routes while allowing public routes to bypass
 */
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
