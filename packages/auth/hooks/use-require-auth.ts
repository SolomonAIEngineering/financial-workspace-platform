/**
 * @fileoverview Hook for protecting routes and components that require authentication.
 */

import { useAuth, useUser } from '@clerk/nextjs'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Hook that protects routes and components by requiring authentication.
 * Automatically redirects to sign-in page if user is not authenticated.
 *
 * @param {Object} options - Configuration options for the hook
 * @param {string} [options.redirectTo='/sign-in'] - The path to redirect to when user is not authenticated
 * @param {boolean} [options.requireVerification=false] - Whether to require email verification
 * @returns {Object} Authentication state and user loading state
 *
 * @example
 * // Basic usage in a protected component
 * import { useRequireAuth } from '@your-org/auth/hooks/use-require-auth';
 *
 * function ProtectedComponent() {
 *   const { isLoaded, userId } = useRequireAuth();
 *
 *   if (!isLoaded) return 'Loading...';
 *
 *   return <div>Protected Content for user {userId}</div>;
 * }
 *
 * @example
 * // Usage with custom redirect and verification
 * function VerifiedOnlyComponent() {
 *   const { isLoaded } = useRequireAuth({
 *     redirectTo: '/verify-email',
 *     requireVerification: true
 *   });
 *
 *   if (!isLoaded) return 'Loading...';
 *
 *   return <div>Verified Users Only</div>;
 * }
 */
export function useRequireAuth({
  redirectTo = '/sign-in',
  requireVerification = false,
} = {}) {
  const { isLoaded, userId, isSignedIn } = useAuth()
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      router.push(redirectTo)
      return
    }

    if (
      requireVerification &&
      user?.primaryEmailAddress?.verification.status !== 'verified'
    ) {
      router.push('/verify-email')
    }
  }, [
    isLoaded,
    isSignedIn,
    redirectTo,
    requireVerification,
    router,
    user?.primaryEmailAddress?.verification.status,
  ])

  return { isLoaded, userId, isSignedIn, user }
}
