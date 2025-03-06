/**
 * @fileoverview Client-side authentication utilities and hooks from Clerk.
 *
 * This module re-exports all client-side authentication utilities from Clerk, including:
 * - Authentication hooks (useAuth, useUser, useClerk, etc.)
 * - UI Components (SignIn, SignUp, UserButton, etc.)
 * - Helper functions and types
 *
 * @example
 * // Using authentication hooks
 * import { useAuth, useUser } from '@your-org/auth';
 *
 * function ProtectedComponent() {
 *   const { isLoaded, userId } = useAuth();
 *   const { user } = useUser();
 *
 *   if (!isLoaded) return 'Loading...';
 *   if (!userId) return 'Not authenticated';
 *
 *   return `Hello ${user.firstName}`;
 * }
 *
 * @example
 * // Using UI components
 * import { UserButton } from '@your-org/auth';
 *
 * function Header() {
 *   return (
 *     <header>
 *       <UserButton afterSignOutUrl="/" />
 *     </header>
 *   );
 * }
 */

export * from '@clerk/nextjs'
