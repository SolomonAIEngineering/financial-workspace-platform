/**
 * @fileoverview Authentication hooks for managing user authentication, authorization, and redirects.
 *
 * This module provides a collection of React hooks for handling common authentication scenarios:
 * - Route protection and authentication requirements
 * - Role-based access control (RBAC)
 * - Authentication redirects
 * - Organization management
 * - Session management
 * - Profile management
 *
 * @example
 * // Import all hooks
 * import {
 *   useRequireAuth,
 *   useRedirectToSignIn,
 *   useAuthGuard,
 *   useOrganizationManager,
 *   useSessionManager,
 *   useProfileManager
 * } from '@your-org/auth/hooks';
 */

export { useAuthGuard } from './use-auth-guard'
export { useOrganizationManager } from './use-organization'
export { useProfileManager } from './use-profile-manager'
export { useRedirectToSignIn } from './use-redirect-to-sign-in'
export { useRequireAuth } from './use-require-auth'
export { useSessionManager } from './use-session-manager'

// Re-export types
export type { AuthGuardOptions } from './use-auth-guard'
export type { UseOrganizationManagerReturn } from './use-organization'
export type {
  ProfileUpdateData,
  UseProfileManagerReturn,
} from './use-profile-manager'
export type { UseSessionManagerReturn } from './use-session-manager'
