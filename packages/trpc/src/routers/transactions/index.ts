/**
 * TRPC Router for transaction management
 *
 * This router provides endpoints for creating, managing, and searching transactions,
 * handling attachments, categories, assignments, splits, and other transaction-related operations.
 */

import {
    addAttachmentHandler,
    bulkUpdateAssignedToHandler,
    bulkUpdateTagsHandler,
    bulkUpdateTransactionCategoriesHandler,
    categorizeByMerchantHandler,
    createBatchTransactionsHandler,
    createTransactionHandler,
    deleteTransactionAttachmentHandler,
    deleteTransactionHandler,
    getSplitTransactionsHandler,
    getTransactionHandler,
    getTransactionsByCategoryHandler,
    getTransactionsHandler,
    listTransactionAttachmentsHandler,
    recombineSplitTransactionHandler,
    removeTagHandler,
    searchTransactionsHandler,
    splitTransactionHandler,
    updateAssignedToHandler,
    updateBatchTransactionsHandler,
    updatePaymentMethodHandler,
    updateTagsHandler,
    updateTransactionAttachmentHandler,
    updateTransactionCategoryHandler,
    updateTransactionHandler,
} from './handlers'

import { createRouter } from '../../trpc'

export const transactionsRouter = createRouter({
    addAttachment: addAttachmentHandler,
    bulkUpdateAssignedTo: bulkUpdateAssignedToHandler,
    bulkUpdateCategories: bulkUpdateTransactionCategoriesHandler,
    bulkUpdateTags: bulkUpdateTagsHandler,
    categorizeByMerchant: categorizeByMerchantHandler,
    create: createTransactionHandler,
    createBatch: createBatchTransactionsHandler,
    delete: deleteTransactionHandler,
    deleteAttachment: deleteTransactionAttachmentHandler,
    get: getTransactionHandler,
    getAll: getTransactionsHandler,
    getByCategory: getTransactionsByCategoryHandler,
    getSplits: getSplitTransactionsHandler,
    listAttachments: listTransactionAttachmentsHandler,
    recombineSplit: recombineSplitTransactionHandler,
    removeTag: removeTagHandler,
    search: searchTransactionsHandler,
    split: splitTransactionHandler,
    update: updateTransactionHandler,
    updateAssignedTo: updateAssignedToHandler,
    updateAttachment: updateTransactionAttachmentHandler,
    updateBatch: updateBatchTransactionsHandler,
    updateCategory: updateTransactionCategoryHandler,
    updatePaymentMethod: updatePaymentMethodHandler,
    updateTags: updateTagsHandler,
})
