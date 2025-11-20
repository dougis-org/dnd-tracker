import { clerkMiddleware } from '@clerk/nextjs/server';

// Clerk middleware ensures `auth()` works in server components and API routes.
// Match all routes except static assets and the Next.js internal routes.
export default clerkMiddleware();

export const config = {
  // Avoid matching static files and API routes that don't need auth
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
