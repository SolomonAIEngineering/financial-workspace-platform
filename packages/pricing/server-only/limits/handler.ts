import type { NextApiRequest, NextApiResponse } from 'next'
import type {
  TLimitsErrorResponseSchema,
  TLimitsResponseSchema,
} from './schema'

import { match } from 'ts-pattern'
import { ERROR_CODES } from './errors'
import { getServerLimits } from './server'

export const limitsHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<TLimitsResponseSchema | TLimitsErrorResponseSchema>,
) => {
  try {
    const teamId = req.headers['team-id']
    const userId = req.headers['user-id']
    const email = req.headers['email']
    if (!teamId) {
      throw new Error(ERROR_CODES.INVALID_TEAM_ID)
    }

    if (!userId) {
      throw new Error(ERROR_CODES.INVALID_USER_ID)
    }

    const limits = await getServerLimits({
      email: email as string,
      teamId: teamId as string,
      userId: userId as string,
    })

    return res.status(200).json(limits)
  } catch (err) {
    console.error('error', err)

    if (err instanceof Error) {
      const status = match(err.message)
        .with(ERROR_CODES.UNAUTHORIZED, () => 401)
        .otherwise(() => 500)

      return res.status(status).json({
        error:
          ERROR_CODES[err.message as keyof typeof ERROR_CODES] ??
          ERROR_CODES.UNKNOWN,
      })
    }

    return res.status(500).json({
      error: ERROR_CODES.UNKNOWN,
    })
  }
}
