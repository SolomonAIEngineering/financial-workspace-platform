/**
 * TRPC Router for user management
 *
 * This router provides endpoints for managing user profiles, subscriptions,
 * business information, and account settings.
 */

// Import all handlers
import { createCheckoutSession } from './handlers/create-checkout-session'
import { createPortalSession } from './handlers/create-portal-session'
import { createRouter } from '../../trpc'
import { deleteAccount } from './handlers/delete-account'
import { getBusinessProfileCompleteness } from './handlers/get-business-profile-completeness'
import { getFullProfile } from './handlers/get-full-profile'
import { getProfileCompleteness } from './handlers/get-profile-completeness'
import { getSettings } from './handlers/get-settings'
import { getTeamMembers } from './handlers/get-team-members'
import { getUser } from './handlers/get-user'
import { getUserSubscription } from './handlers/get-user-subscription'
import { hasTeam } from './handlers/has-team'
import { searchUsers } from './handlers/search-users'
import { setLanguage } from './handlers/set-language'
import { setTimezone } from './handlers/set-timezone'
import { updateContactInfo } from './handlers/update-contact-info'
import { updateOrganizationInfo } from './handlers/update-organization-info'
import { updatePreferences } from './handlers/update-preferences'
import { updateProfessionalProfile } from './handlers/update-professional-profile'
import { updateSettings } from './handlers/update-settings'
import { updateSocialProfiles } from './handlers/update-social-profiles'

export const userRouter = createRouter({
  createCheckoutSession,
  createPortalSession,
  deleteAccount,
  getBusinessProfileCompleteness,
  getFullProfile,
  getProfileCompleteness,
  getSettings,
  getTeamMembers,
  getUser,
  getUserSubscription,
  hasTeam,
  searchUsers,
  setLanguage,
  setTimezone,
  updateContactInfo,
  updateOrganizationInfo,
  updatePreferences,
  updateProfessionalProfile,
  updateSettings,
  updateSocialProfiles,
})
