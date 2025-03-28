import { isTeamMember, isTeamOwner, isTeamUser } from './teamAuthorizationMiddleware';

import { CookieNames } from '@solomonai/lib/storage/cookies';
import { UserRole } from '@solomonai/prisma';
import { authorizationMiddleware } from './authorizationMiddleware';
import { devMiddleware } from './devMiddleware';
import { loggedInMiddleware } from './loggedInMiddleware';
import { ratelimitMiddleware } from './ratelimitMiddleware';
import { t } from '../trpc';

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees `ctx.session.user` is
 * not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(async (opts) => {
    const result = await opts.next();

    if (!result.ok) {
      console.error(`Non-OK ${opts.type}:`, opts.path);
    }

    return result;
  })
  .use(loggedInMiddleware)
  .use(ratelimitMiddleware())
  .use(devMiddleware(CookieNames.devWait));

export const adminProcedure = t.procedure
  .use(loggedInMiddleware)
  .use(authorizationMiddleware({ role: UserRole.ADMIN }))
  .use(ratelimitMiddleware());

export const superAdminProcedure = t.procedure
  .use(loggedInMiddleware)
  .use(authorizationMiddleware({ role: UserRole.SUPERADMIN }))
  .use(ratelimitMiddleware());

/**
 * Team owner procedure
 * 
 * Use this when an operation should ONLY be performed by team owners.
 * The teamId must be provided in the input as 'teamId'.
 * 
 * @see teamAuthorizationMiddleware for configuration options
 */
export const teamOwnerProcedure = t.procedure
  .use(loggedInMiddleware)
  .use(isTeamOwner)
  .use(ratelimitMiddleware());

/**
 * Team member procedure
 * 
 * Use this when an operation should ONLY be performed by team members.
 * The teamId must be provided in the input as 'teamId'.
 * 
 * @see teamAuthorizationMiddleware for configuration options
 */
export const teamMemberProcedure = t.procedure
  .use(loggedInMiddleware)
  .use(isTeamMember)
  .use(ratelimitMiddleware());

/**
 * Team access procedure
 * 
 * Use this when an operation can be performed by any team member or owner.
 * The teamId must be provided in the input as 'teamId'.
 * 
 * @see teamAuthorizationMiddleware for configuration options
 */
export const teamAccessProcedure = t.procedure
  .use(loggedInMiddleware)
  .use(isTeamUser)
  .use(ratelimitMiddleware());
