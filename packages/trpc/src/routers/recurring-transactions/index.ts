import * as handlers from './handlers'

import { createRouter } from '../../trpc'
import { z } from 'zod'

/**
 * Router for recurring transactions
 * Provides endpoints for managing recurring transactions
 */
export const recurringTransactionsRouter = createRouter({
  // Core Recurring Transaction Endpoints
  getRecurringTransactions: handlers.getRecurringTransactions,
  createRecurringTransaction: handlers.createRecurringTransaction,
  updateRecurringTransaction: handlers.updateRecurringTransaction,
  deleteRecurringTransaction: handlers.deleteRecurringTransaction,

  // Tag Management
  addTags: handlers.addTags,
  removeTags: handlers.removeTags,
  updateTags: handlers.updateTags,

  // Metadata Updates
  updateMerchant: handlers.updateMerchant,
  updateNotes: handlers.updateNotes,
  updateCategory: handlers.updateCategory,
  updateStatus: handlers.updateStatus,
  assignRecurringTransaction: handlers.assignRecurringTransaction,

  // Analysis and Detection
  searchRecurringTransactions: handlers.searchRecurringTransactions,
  getAssociatedTransactions: handlers.getAssociatedTransactions,
})
