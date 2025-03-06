/**
 * @fileoverview Hook for managing user sessions and authentication state.
 */

import { useAuth, useSession } from '@clerk/nextjs'

import { useCallback } from 'react'

export interface UseSessionManagerReturn {
  session: ReturnType<typeof useSession>['session']
  isLoaded: boolean
  signOut: () => Promise<void>
  revokeAllSessions: () => Promise<void>
  lastActiveSessionId: string | null
  isCurrentSession: boolean
}

/**
 * Hook for managing user sessions including sign out and session revocation.
 *
 * @returns {UseSessionManagerReturn} Session management functions and state
 *
 * @example
 * // Basic usage
 * function LogoutButton() {
 *   const { signOut, isLoaded } = useSessionManager();
 *
 *   return (
 *     <button
 *       disabled={!isLoaded}
 *       onClick={() => signOut()}
 *     >
 *       Sign Out
 *     </button>
 *   );
 * }
 *
 * @example
 * // Managing multiple sessions
 * function SessionManager() {
 *   const { revokeAllSessions, isCurrentSession } = useSessionManager();
 *
 *   return (
 *     <div>
 *       {isCurrentSession && (
 *         <button onClick={() => revokeAllSessions()}>
 *           Sign Out All Devices
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 */
export function useSessionManager(): UseSessionManagerReturn {
  const { signOut: clerkSignOut } = useAuth()
  const { session, isLoaded } = useSession()

  const signOut = useCallback(async () => {
    await clerkSignOut()
  }, [clerkSignOut])
  const revokeAllSessions = useCallback(async () => {
    await session?.clearCache()
  }, [session])

  return {
    session,
    isLoaded,
    signOut,
    revokeAllSessions,
    lastActiveSessionId: session?.lastActiveOrganizationId ?? null,
    isCurrentSession: session?.lastActiveOrganizationId === session?.id,
  }
}
