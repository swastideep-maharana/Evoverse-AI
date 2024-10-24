import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define the public routes (sign-in, sign-up)
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

// Clerk middleware to protect routes
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

// Next.js middleware config to match routes (API routes and pages)
export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Match API routes
    '/(api|trpc)(.*)',
  ],
};
