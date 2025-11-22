import { clerkMiddleware } from '@clerk/nextjs/server';
import { getAuthSession } from '@/lib/auth/middleware';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware that supports E2E test-mode bypass and uses Clerk middleware
 * during normal runtime. The handler is intentionally idempotent and
 * will never redirect or block requests when in E2E/test mode.
 */
async function handler(authOrRequest: any, maybeRequest?: any) {
  // Normalize the NextRequest argument whether Clerk passes (auth, request)
  const request: NextRequest = (maybeRequest as NextRequest) ?? (authOrRequest as NextRequest);

  try {
    const isTest = process.env.E2E_TEST === '1' || process.env.NODE_ENV === 'test';
    if (isTest) {
      // Best-effort: attempt to populate a synthetic session for server-side code
      try {
        await getAuthSession(request as any);
      } catch (err) {
        // Non-fatal; in test mode we must not block the request
        // eslint-disable-next-line no-console
        console.warn('middleware(getAuthSession): test fallback failed', err);
      }
      return NextResponse.next();
    }

    // In production behavior, Clerk's middleware will handle redirect logic.
    return NextResponse.next();
  } catch (err) {
    // Fail-safe: do not block requests if middleware fails
    // eslint-disable-next-line no-console
    console.error('middleware: unexpected error', err);
    return NextResponse.next();
  }
}

// If E2E/test mode is active, export the raw handler (no Clerk redirects)
// otherwise wrap the handler with Clerk middleware for auth-protected routes
export default (process.env.E2E_TEST === '1' || process.env.NODE_ENV === 'test')
  ? handler
  : clerkMiddleware(handler);

export const config = {
  matcher: [
    // Skip Next internals and static assets
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
