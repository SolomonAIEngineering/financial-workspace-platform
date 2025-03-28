/**
 * TRPC Router for bank connections
 *
 * This router provides endpoints for managing bank connections.
 */

import { createBankConnection } from './handlers/create-bank-connection'
// Import all handlers
import { createRouter } from '../../trpc'

export const bankConnectionRouter = createRouter({
  createBankConnection,
})
