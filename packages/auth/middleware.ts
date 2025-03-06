/**
 * @fileoverview Authentication middleware that provides route protection and session handling using Clerk.
 *
 * This middleware is responsible for:
 * - Protecting routes from unauthorized access
 * - Managing authentication sessions
 * - Handling authentication redirects
 * - Processing authentication tokens
 *
 * @example
 * // Usage in middleware.ts at the root of your Next.js project
 * import { authMiddleware } from '@your-org/auth';
 *
 * export default authMiddleware({
 *   publicRoutes: ['/'], // Routes accessible without authentication
 *   ignoredRoutes: ['/api/public'] // Routes to bypass authentication checks
 * });
 *
 * // Configure middleware matcher
 * export const config = {
 *   matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
 * };
 */

export { clerkMiddleware as authMiddleware } from '@clerk/nextjs/server'
