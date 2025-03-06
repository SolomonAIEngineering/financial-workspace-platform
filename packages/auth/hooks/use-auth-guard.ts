/**
 * @fileoverview Hook for implementing role-based access control (RBAC) in components.
 */

import { useAuth, useUser } from '@clerk/nextjs'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export type Role = 'admin' | 'user' | 'manager' | string

export interface AuthGuardOptions {
  requiredRoles?: Role[]
  redirectTo?: string
  fallback?: React.ReactNode
}

/**
 * Hook that implements role-based access control for components.
 * Supports multiple roles, custom redirects, and fallback content.
 *
 * @param {AuthGuardOptions} options - Configuration options for the auth guard
 * @param {Role[]} [options.requiredRoles] - Array of roles required to access the component
 * @param {string} [options.redirectTo='/unauthorized'] - Path to redirect to if access is denied
 * @param {React.ReactNode} [options.fallback] - Content to show while checking authorization
 * @returns {Object} Auth guard state and helper functions
 *
 * @example
 * // Basic usage with single role
 * import { useAuthGuard } from '@your-org/auth/hooks/use-auth-guard';
 *
 * function AdminPanel() {
 *   const { isAuthorized, isLoading } = useAuthGuard({
 *     requiredRoles: ['admin']
 *   });
 *
 *   if (isLoading) return 'Loading...';
 *   if (!isAuthorized) return 'Access Denied';
 *
 *   return <div>Admin Panel Content</div>;
 * }
 *
 * @example
 * // Usage with multiple roles and custom redirect
 * function ManagerContent() {
 *   const { isAuthorized, isLoading } = useAuthGuard({
 *     requiredRoles: ['admin', 'manager'],
 *     redirectTo: '/dashboard',
 *     fallback: <LoadingSpinner />
 *   });
 *
 *   if (isLoading) return 'Loading...';
 *
 *   return <div>Manager Content</div>;
 * }
 */
export function useAuthGuard({
  requiredRoles = [],
  redirectTo = '/unauthorized',
  fallback = null,
}: AuthGuardOptions = {}) {
  const router = useRouter()
  const { isLoaded: authLoaded, userId } = useAuth()
  const { isLoaded: userLoaded, user } = useUser()
  const isLoading = !authLoaded || !userLoaded

  // Get user roles from public metadata
  const userRoles = (user?.publicMetadata?.roles as Role[]) || []

  const hasRequiredRole =
    requiredRoles.length === 0 ||
    requiredRoles.some((role) => userRoles.includes(role))

  const isAuthorized = Boolean(userId && hasRequiredRole)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthorized && redirectTo) {
      router.push(redirectTo)
    }
  }, [isAuthorized, isLoading, redirectTo, router])

  return {
    isAuthorized,
    isLoading,
    userRoles,
    fallback: isLoading ? fallback : null,
  }
}
