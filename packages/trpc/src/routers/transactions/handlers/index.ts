import { addAttachmentHandler } from './add-attachment'
import { bulkUpdateAssignedToHandler } from './bulk-update-assigned-to'
import { bulkUpdateTagsHandler } from './bulk-update-tags'
import { createTransactionHandler } from './create-transaction'
import { deleteTransactionHandler } from './delete-transaction'
import { getTransactionHandler } from './get-transaction'
import { getTransactionsHandler } from './get-transactions'
import { removeTagHandler } from './remove-tag'
import { searchTransactionsHandler } from './search-transactions'
import { updateAssignedToHandler } from './update-assigned-to'
import { updateBatchTransactionsHandler } from './update-batch-transactions'
import { updatePaymentMethodHandler } from './update-payment-method'
import { updateTagsHandler } from './update-tags'
import { updateTransactionHandler } from './update-transaction'

// New handlers
import { createBatchTransactionsHandler } from './create-batch-transactions'
import {
  deleteTransactionAttachmentHandler,
  listTransactionAttachmentsHandler,
  updateTransactionAttachmentHandler,
} from './transaction-attachments'
import {
  bulkUpdateTransactionCategoriesHandler,
  categorizeByMerchantHandler,
  getTransactionsByCategoryHandler,
  updateTransactionCategoryHandler,
} from './transaction-categories'
import {
  getSplitTransactionsHandler,
  recombineSplitTransactionHandler,
  splitTransactionHandler,
} from './transaction-splits'

export {
  addAttachmentHandler,
  bulkUpdateAssignedToHandler,
  bulkUpdateTagsHandler,
  bulkUpdateTransactionCategoriesHandler,
  categorizeByMerchantHandler,
  // New handlers
  createBatchTransactionsHandler,
  createTransactionHandler,
  deleteTransactionAttachmentHandler,
  deleteTransactionHandler,
  getSplitTransactionsHandler,
  getTransactionHandler,
  getTransactionsByCategoryHandler,
  getTransactionsHandler,
  // Transaction attachments
  listTransactionAttachmentsHandler,
  recombineSplitTransactionHandler,
  removeTagHandler,
  searchTransactionsHandler,
  // Transaction splits
  splitTransactionHandler,
  updateAssignedToHandler,
  updateBatchTransactionsHandler,
  updatePaymentMethodHandler,
  updateTagsHandler,
  updateTransactionAttachmentHandler,
  // Transaction categories
  updateTransactionCategoryHandler,
  updateTransactionHandler,
}
