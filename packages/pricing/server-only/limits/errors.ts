export type ERROR_CODES =
  | 'You must be logged in to access this resource'
  | 'An error occurred while fetching your user account'
  | 'An error occurred while fetching your subscription'
  | 'An unknown error occurred'
  | 'Invalid team ID'
  | 'Invalid user ID'

export const ERROR_CODES = {
  UNAUTHORIZED: 'You must be logged in to access this resource' as ERROR_CODES,
  USER_FETCH_FAILED:
    'An error occurred while fetching your user account' as ERROR_CODES,
  SUBSCRIPTION_FETCH_FAILED:
    'An error occurred while fetching your subscription' as ERROR_CODES,
  UNKNOWN: 'An unknown error occurred' as ERROR_CODES,
  INVALID_TEAM_ID: 'Invalid team ID' as ERROR_CODES,
  INVALID_USER_ID: 'Invalid user ID' as ERROR_CODES,
} as const
