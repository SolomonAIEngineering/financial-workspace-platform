import { createCallerFactory, createRouter } from './trpc'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

import { bankAccountsRouter } from './routers/bank-accounts/index'
import { bankConnectionRouter } from './routers/bank-connection'
import { commentRouter } from './routers/comment/index'
import { documentRouter } from './routers/document/index'
import { fileRouter } from './routers/file'
import { layoutRouter } from './routers/layout'
import { recurringTransactionsRouter } from './routers/recurring-transactions'
import { teamRouter } from './routers/team/index'
import { transactionsRouter } from './routers/transactions'
import { userRouter } from './routers/user'
import { versionRouter } from './routers/version/index'

export const appRouter = createRouter({
  bankAccounts: bankAccountsRouter,
  comment: commentRouter,
  document: documentRouter,
  file: fileRouter,
  layout: layoutRouter,
  team: teamRouter,
  user: userRouter,
  version: versionRouter,
  transactions: transactionsRouter,
  recurringTransactions: recurringTransactionsRouter,
  bankConnection: bankConnectionRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Inference helpers for input types
 *
 * @example
 *   type PostByIdInput = RouterInputs['post']['byId']
 *   ^? { id: number }
 */
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helpers for output types
 *
 * @example
 *   type AllPostsOutput = RouterOutputs['post']['all']
 *   ^? Post[]
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>

/**
 * Create a server-side caller for the tRPC API
 *
 * @example
 *   const trpc = createCaller(createContext);
 *   const res = await trpc.post.all();
 *   ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
