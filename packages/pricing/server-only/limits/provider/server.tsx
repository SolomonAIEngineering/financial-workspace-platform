'use server'

import { headers } from 'next/headers'
import { getLimits } from '../client'
import { LimitsProvider as ClientLimitsProvider } from './client'

export type LimitsProviderProps = {
  children?: React.ReactNode
  teamId?: string
  userId?: string
  email?: string
}

/**
 * Server-side Limits Provider component that fetches and provides usage limits data
 *
 * @component
 * @description
 * This component serves as a server-side wrapper around the client LimitsProvider.
 * It fetches the current usage limits using server-side headers and passes them down
 * to the client component. This ensures that the initial limits data is server-side
 * rendered and immediately available to the client.
 *
 * @example
 * ```tsx
 * <LimitsProvider teamId={123}>
 *   <YourComponent />
 * </LimitsProvider>
 * ```
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Child components that will have access to the limits context
 * @param {number} [props.teamId] - Optional team ID to fetch team-specific limits
 * @returns {Promise<JSX.Element>} A Promise that resolves to the rendered provider component
 */
export const LimitsProvider = async ({
  children,
  teamId,
  userId,
  email,
}: LimitsProviderProps) => {
  const headersList = headers()
  const requestHeaders = {} as Record<string, string>
  headersList.forEach((value, key) => {
    requestHeaders[key] = value
  })

  const limits = await getLimits({
    headers: requestHeaders,
    teamId,
    userId,
    email,
  })

  return (
    <ClientLimitsProvider
      initialValue={limits}
      teamId={teamId}
      userId={userId}
      email={email}
    >
      {children}
    </ClientLimitsProvider>
  )
}
