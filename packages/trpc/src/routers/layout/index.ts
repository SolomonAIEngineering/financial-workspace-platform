import { createRouter } from '../../trpc'
import { app } from './handlers/app'

/**
 * Router for layout-related procedures.
 * Handles fetching layout information including user and team data.
 */
export const layoutRouter = createRouter({
  app,
})
