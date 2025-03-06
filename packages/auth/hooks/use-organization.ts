/**
 * @fileoverview Hook for managing organization-related functionality.
 */

import { useOrganization, useOrganizationList } from '@clerk/nextjs'

import { useCallback } from 'react'

export interface UseOrganizationManagerReturn {
  organization: ReturnType<typeof useOrganization>['organization']
  isLoaded: boolean
  isAdmin: boolean
  isMember: boolean
  switchOrganization: (orgId: string) => Promise<void>
  organizations: ReturnType<typeof useOrganizationList>['userMemberships']
  createOrganization: ReturnType<
    typeof useOrganizationList
  >['createOrganization']
}

/**
 * Hook for managing organization-related functionality including switching,
 * role checking, and organization creation.
 *
 * @returns {UseOrganizationManagerReturn} Organization management functions and state
 *
 * @example
 * // Basic usage
 * function OrgSwitcher() {
 *   const { organization, organizations, switchOrganization } = useOrganizationManager();
 *
 *   return (
 *     <select
 *       value={organization?.id}
 *       onChange={(e) => switchOrganization(e.target.value)}
 *     >
 *       {organizations?.map(org => (
 *         <option key={org.id} value={org.id}>{org.name}</option>
 *       ))}
 *     </select>
 *   );
 * }
 *
 * @example
 * // Role-based rendering
 * function AdminPanel() {
 *   const { isAdmin, isLoaded } = useOrganizationManager();
 *
 *   if (!isLoaded) return 'Loading...';
 *   if (!isAdmin) return 'Access denied';
 *
 *   return <div>Admin Controls</div>;
 * }
 */
export async function useOrganizationManager(): Promise<UseOrganizationManagerReturn> {
  const { organization, isLoaded } = useOrganization()
  const { userMemberships, createOrganization, setActive } =
    useOrganizationList()

  const isAdmin = await organization
    ?.getRoles()
    .then((roles) => roles.data.some((role) => role.name === 'org:admin'))
  const isMember = await organization
    ?.getRoles()
    .then((roles) => roles.data.some((role) => role.name === 'org:member'))

  const switchOrganization = useCallback(
    async (orgId: string) => {
      if (setActive) {
        await setActive({ organization: orgId })
      }
    },
    [setActive],
  )

  return {
    organization,
    isLoaded,
    isAdmin: isAdmin ?? false,
    isMember: isMember ?? false,
    switchOrganization,
    organizations: userMemberships,
    createOrganization,
  }
}
