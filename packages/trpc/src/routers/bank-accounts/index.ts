/**
 * TRPC Router for bank account connections
 *
 * This router provides endpoints for creating Plaid link tokens, fetching
 * connected bank accounts, disconnecting accounts, and managing transactions.
 */

import { addTransactionAttachment } from './handlers/add-transaction-attachment'
// Import all handlers
import { createRouter } from '../../trpc'
import { getAll } from './handlers/get-all'
import { getById } from './handlers/get-by-id'
import { getConnectionWithAccounts } from './handlers/get-connection-with-accounts'
import { getTeamBankAccounts } from './handlers/get-team-bank-accounts'
import { getTransactions } from './handlers/get-transactions'
import { removeTransactionAttachment } from './handlers/remove-transaction-attachment'
import { updateTransaction } from './handlers/update-transaction'

export const bankAccountsRouter = createRouter({
  addTransactionAttachment,
  getAll,
  getById,
  getConnectionWithAccounts,
  getTeamBankAccounts,
  getTransactions,
  removeTransactionAttachment,
  updateTransaction,
})
