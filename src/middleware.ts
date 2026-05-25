// Security headers configured in vercel.json for edge-level protection:
// - X-Frame-Options: DENY
// - X-Content-Type-Options: nosniff
// - X-XSS-Protection: 1; mode=block
// - Strict-Transport-Security (HSTS)
// - Referrer-Policy: strict-origin-when-cross-origin

import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/(.*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
