/**
 * @fileoverview Hook for handling redirects to the sign-in page for unauthenticated users.
 */

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

/**
 * Hook that handles redirecting unauthenticated users to the sign-in page.
 * Provides more granular control over the redirect behavior compared to useRequireAuth.
 *
 * @param {Object} options - Configuration options for the hook
 * @param {string} [options.redirectUrl='/sign-in'] - The URL to redirect to
 * @param {boolean} [options.preserveQuery=true] - Whether to preserve query parameters in the redirect
 * @param {string} [options.returnBackUrl='/'] - The URL to return to after sign-in
 * @returns {Function} Redirect function that can be called to trigger the redirect
 *
 * @example
 * // Basic usage in a component
 * import { useRedirectToSignIn } from '@your-org/auth/hooks/use-redirect-to-sign-in';
 *
 * function GatedContent() {
 *   const redirectToSignIn = useRedirectToSignIn();
 *   const { isSignedIn } = useAuth();
 *
 *   if (!isSignedIn) {
 *     return (
 *       <button onClick={() => redirectToSignIn()}>
 *         Sign in to view content
 *       </button>
 *     );
 *   }
 *
 *   return <div>Protected Content</div>;
 * }
 *
 * @example
 * // Usage with custom configuration
 * function CustomRedirect() {
 *   const redirectToSignIn = useRedirectToSignIn({
 *     redirectUrl: '/auth/login',
 *     preserveQuery: false,
 *     returnBackUrl: '/dashboard'
 *   });
 *
 *   return (
 *     <button onClick={() => redirectToSignIn()}>
 *       Custom Sign In
 *     </button>
 *   );
 * }
 */
export function useRedirectToSignIn({
  redirectUrl = '/sign-in',
  preserveQuery = true,
  returnBackUrl = '/',
} = {}) {
  const router = useRouter()
  const { isSignedIn } = useAuth()

  return () => {
    if (isSignedIn) return

    const currentPath = window.location.pathname
    const searchParams = new URLSearchParams()

    if (preserveQuery) {
      const currentQuery = window.location.search
      const params = new URLSearchParams(currentQuery)
      params.forEach((value, key) => searchParams.append(key, value))
    }

    searchParams.set('redirect_url', returnBackUrl || currentPath)
    const queryString = searchParams.toString()
    const redirectPath = queryString
      ? `${redirectUrl}?${queryString}`
      : redirectUrl

    router.push(redirectPath)
  }
}
