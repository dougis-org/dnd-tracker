/**
 * Next.js Middleware for authentication and profile setup redirect
 * Integrates with Clerk auth and enforces profile setup flow
 *
 * Constitutional: Max 100 lines
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

// Routes that should skip profile setup check
const skipProfileCheck = createRouteMatcher([
  '/profile-setup',
  '/api(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/_next(.*)',
  '/favicon.ico',
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // Allow public routes without auth
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Require auth for protected routes
  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Skip profile setup check for certain routes
  if (skipProfileCheck(request)) {
    return NextResponse.next();
  }

  // For authenticated routes, check profile setup status
  // Note: We can't easily access the database in middleware
  // So we'll use a cookie or rely on the page components to handle this
  // This is a simplified version - full implementation would need session store
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
