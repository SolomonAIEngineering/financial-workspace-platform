import { TransactionCategory } from '@solomonai/prisma/client';
import { TransactionSchema as TxSchema } from '@solomonai/prisma/generated/zod';
import { z } from 'zod';

// Transaction filter schema
export const transactionFilterSchema = z.object({
  merchant: z.string().optional(),
  category: z.nativeEnum(TransactionCategory).optional(),
  tags: z.array(z.string()).optional(),
  method: z.string().optional(),
  assignedTo: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Transaction schema
export const transactionSchema = z.object({
  bankAccountId: z.string(),
  amount: z.number(),
  date: z.string().datetime(),
  name: z.string(),
  merchantName: z.string().optional(),
  description: z.string().optional(),
  pending: z.boolean().default(false),
  category: z.nativeEnum(TransactionCategory).optional(),
  paymentMethod: z.string().optional(),
  tags: z.array(z.string()).optional(),

  // Tax & Financial Information
  taxDeductible: z.boolean().optional(),
  taxExempt: z.boolean().optional(),
  taxAmount: z.number().optional(),
  taxRate: z.number().optional(),
  taxCategory: z.string().optional(),
  vatAmount: z.number().optional(),
  vatRate: z.number().optional(),

  // Additional financial flags
  excludeFromBudget: z.boolean().optional(),
  reimbursable: z.boolean().optional(),
  plannedExpense: z.boolean().optional(),
  discretionary: z.boolean().optional(),

  // Business information
  businessPurpose: z.string().optional(),
  costCenter: z.string().optional(),
  projectCode: z.string().optional(),
  cashFlowCategory: z.string().optional(),
  cashFlowType: z.string().optional(),
});


export const batchTransactionSchema = z.object({
  transactions: z.array(transactionSchema),
});

// Transaction with ID schema
export const transactionWithIdSchema = z.object({
  id: z.string(),
});

// Tag schema
export const tagSchema = z.object({
  tags: z.array(z.string()),
});

// Category schema
export const categorySchema = z.object({
  category: z.nativeEnum(TransactionCategory),
  subCategory: z.string().optional(),
  customCategory: z.string().optional(),
});

// Merchant schema
export const merchantSchema = z.object({
  merchantName: z.string(),
  merchantId: z.string().optional(),
  merchantLogoUrl: z.string().optional(),
  merchantCategory: z.string().optional(),
});

// Status schema
export const statusSchema = z.object({
  status: z.string(),
});

// Payment method schema
export const paymentMethodSchema = z.object({
  paymentMethod: z.string(),
  paymentProcessor: z.string().optional(),
  cardType: z.string().optional(),
  cardLastFour: z.string().optional(),
});

// Assign schema
export const assignSchema = z.object({
  assignedToUserId: z.string(),
  notifyUser: z.boolean().default(false),
});

// Notes schema
export const notesSchema = z.object({
  notes: z.string(),
});

// Categorize by merchant schema
export const categorizeByMerchantSchema = z.object({
  merchantName: z.string(),
  category: z.nativeEnum(TransactionCategory),
  subCategory: z.string().optional(),
  applyToFuture: z.boolean().default(false),
});

// Manual categorization schema
export const manualCategorizationSchema = z.object({
  transactionIds: z.array(z.string()),
  category: z.nativeEnum(TransactionCategory),
  subCategory: z.string().optional(),
  customCategory: z.string().optional(),
});

// Bulk update tags schema
export const bulkUpdateTagsSchema = z.object({
  transactionIds: z.array(z.string()).min(1).max(50),
  tags: z.array(z.string().min(1).max(10)),
  operation: z.enum(['add', 'remove', 'replace']).default('replace'),
});

// Bulk update assigned to schema
export const bulkUpdateAssignedToSchema = z.object({
  transactionIds: z.array(z.string()).min(1).max(500),
  assignedTo: z.string().nullable(),
  teamId: z.string().optional(),
  notifyAssignees: z.boolean().default(false),
});

// Update assigned to schema
export const updateAssignedToSchema = z.object({
  id: z.string(),
  assignedTo: z.string().nullable(),
  teamId: z.string().optional(),
  notifyAssignee: z.boolean().default(false),
});

// Update merchant schema
export const updateMerchantSchema = z.object({
  id: z.string(),
  merchantName: z.string(),
  merchantId: z.string().optional(),
  merchantLogoUrl: z.string().optional(),
  merchantCategory: z.string().optional(),
  merchantWebsite: z.string().optional(),
  merchantPhone: z.string().optional(),
  merchantAddress: z.string().optional(),
});

// Update payment method schema
export const updatePaymentMethodSchema = z.object({
  id: z.string(),
  paymentMethod: z.string(),
  paymentProcessor: z.string().optional(),
  paymentChannel: z.string().optional(),
  cardType: z.string().optional(),
  cardLastFour: z.string().optional(),
});

// Search transactions schema
export const searchTransactionsSchema = z.object({
  query: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  categories: z.array(z.nativeEnum(TransactionCategory)).optional(),
  bankAccountIds: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(20),
  page: z.number().min(1).default(1),
});

// Add/Remove tag schema
export const tagOperationSchema = z.object({
  id: z.string(),
  tag: z.string(),
});

// Add tags schema
export const addTagsSchema = z.object({
  id: z.string(),
  tags: z.array(z.string()),
});

// Update category schema
export const updateCategorySchema = z.object({
  id: z.string(),
  category: z.nativeEnum(TransactionCategory),
  subCategory: z.string().optional(),
  customCategory: z.string().optional(),
});

// Update status schema
export const updateStatusSchema = z.object({
  id: z.string(),
  status: z.string(),
});

// Update notes schema
export const updateNotesSchema = z.object({
  id: z.string(),
  notes: z.string(),
});

// Add attachment schema
export const addAttachmentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileUrl: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
});

// Update tags schema
export const updateTagsSchema = z.object({
  id: z.string(),
  tags: z.array(z.string()),
});

// Delete batch transactions schema
export const deleteBatchTransactionsSchema = z.object({
  ids: z.array(z.string()),
});

export const deleteTransactionSchema = z.object({
  id: z.string(),
});

// Update batch transactions schema
export const updateBatchTransactionsSchema = z.object({
  transactions: z.array(
    z.object({
      id: z.string(),
      data: transactionSchema.partial(),
    })
  ).min(1).max(10),
});

// Get associated transactions schema
export const getAssociatedTransactionsSchema = z.object({
  id: z.string(),
});

export const createBatchTransactionsSchema = z.object({
  transactions: z.array(transactionSchema),
  batchSize: z.number().int().positive().default(50).optional(),
});

// Failed batch information schema
export const failedBatchSchema = z.object({
  batchIndex: z.number(),
  startIndex: z.number(),
  endIndex: z.number(),
  error: z.string()
});

// Result schema with detailed status information
export const batchResultSchema = z.object({
  transactions: z.array(z.any()),  // Using any since we don't know the exact Prisma return type
  status: z.enum(['SUCCESS', 'PARTIAL_SUCCESS']),
  totalProcessed: z.number(),
  totalRequested: z.number(),
  failedBatches: z.array(failedBatchSchema).optional()
});

export const getTransactionSchema = z.object({
  id: z.string(),
});

export const removeTagSchema = z.object({
  id: z.string(),
  tag: z.string(),
});

export const listTransactionAttachmentsSchema = z.object({
  transactionId: z.string(),
});

export const deleteTransactionAttachmentSchema = z.object({
  id: z.string(),
});

export const updateTransactionAttachmentSchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
  path: z.array(z.string()).optional(),
});

export const updateTransactionSchema = TxSchema.partial()

// Category update schema
export const categoryUpdateSchema = z.object({
  id: z.string(),
  category: z.nativeEnum(TransactionCategory),
  subCategory: z.string().optional(),
  customCategory: z.string().optional(),
});

// Bulk categorization schema
export const bulkCategorizationSchema = z.object({
  transactionIds: z.array(z.string()),
  category: z.nativeEnum(TransactionCategory),
  subCategory: z.string().optional(),
  customCategory: z.string().optional(),
});

export const getTransactionsByCategorySchema = z.object({
  category: z.nativeEnum(TransactionCategory),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(20),
});

// Assign transaction schema (deprecated)
export const assignTransactionSchema = z.object({
  id: z.string(),
  assignedToUserId: z.string(),
  notifyUser: z.boolean().default(false),
});

// Complete transaction schema
export const completeTransactionSchema = z.object({
  id: z.string(),
});
