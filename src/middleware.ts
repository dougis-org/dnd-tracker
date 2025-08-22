import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    // This regex matches all routes except:
    // - Next.js internals (e.g., paths starting with "_next")
    // - Static files with the following extensions: html, htm, css, js (but not json), jpg, jpeg, webp, png, gif, svg, ttf, woff, woff2, ico, csv, doc, docx, xls, xlsx, zip, webmanifest
    // The negative lookahead ensures these files are excluded from middleware processing, unless found in search params.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

