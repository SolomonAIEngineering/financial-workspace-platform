import { isAdmin, isSuperAdmin } from '@solomonai/lib/utils/isAdmin'

import type { LuciaUser } from './lucia'
import { getDevUser } from './getDevUser'

export type AuthUser = {
  id: string
  email: string | null
  isAdmin: boolean
  isSuperAdmin: boolean
  // isMonthlyPlan: boolean;
  // isSubscribed: boolean;
  username: string
}

export const getAuthUser = (
  user: LuciaUser | null,
  devUser?: string,
): AuthUser | null => {
  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    isAdmin: isAdmin(user.role),
    isSuperAdmin: isSuperAdmin(user.role),
    // isMonthlyPlan: user.stripePriceId
    //   ? priceIdToInterval[user.stripePriceId] === 'month'
    //   : false,
    // isSubscribed: isUserSubscribed(user),
    username: user.username,
    ...getDevUser(devUser),
  }
}
