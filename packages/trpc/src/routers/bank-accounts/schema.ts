import { TransactionCategory } from '@solomonai/prisma/client'
import { z } from 'zod'

/**
 * Schema definitions for bank-accounts router inputs and outputs
 */

export const addTransactionAttachmentSchema = z.object({
  fileSize: z.number(),
  fileType: z.string(),
  fileUrl: z.string(),
  name: z.string(),
  transactionId: z.string(),
})

/**
 * Type for transaction attachment input
 */
export type AddTransactionAttachmentInput = z.infer<
  typeof addTransactionAttachmentSchema
>

/**
 * Schema defining the structure of an attachment response.
 * This schema is used to validate the response data when retrieving or creating attachments.
 *
 * @property {string} id - Unique identifier for the attachment
 * @property {number} fileSize - Size of the attachment file in bytes
 * @property {string} fileType - MIME type of the attachment (e.g., 'image/jpeg', 'application/pdf')
 * @property {string} fileUrl - URL where the attachment file can be accessed
 * @property {string} name - Display name of the attachment
 * @property {string} transactionId - ID of the transaction this attachment is associated with
 * @property {Date} createdAt - Timestamp when the attachment was created
 * @property {Date} updatedAt - Timestamp when the attachment was last updated
 */
export const attachmentResponseSchema = z.object({
  id: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  fileUrl: z.string(),
  name: z.string(),
  transactionId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

/**
 * Type for attachment response
 */
export type AttachmentResponse = z.infer<typeof attachmentResponseSchema>

export const disconnectSchema = z.object({
  accountId: z.string(),
})

/**
 * Type for disconnect account input
 */
export type DisconnectInput = z.infer<typeof disconnectSchema>

export const exchangePublicTokenSchema = z.object({
  metadata: z.object({
    accounts: z.array(
      z.object({
        id: z.string(),
        mask: z.string().optional(),
        name: z.string(),
        subtype: z.string().optional(),
        type: z.string(),
      }),
    ),
    institution: z.object({
      institution_id: z.string(),
      name: z.string(),
    }),
    provider: z.string(),
  }),
  publicToken: z.string(),
})

/**
 * Type for exchange public token input
 */
export type ExchangePublicTokenInput = z.infer<typeof exchangePublicTokenSchema>

export const getTransactionsSchema = z.object({
  accountId: z.string().optional(),
  categories: z.array(z.nativeEnum(TransactionCategory)).optional(),
  endDate: z.date().optional(),
  isRecurring: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(50),
  maxAmount: z.number().optional(),
  minAmount: z.number().optional(),
  offset: z.number().min(0).default(0),
  pending: z.boolean().optional(),
  search: z.string().optional(),
  startDate: z.date().optional(),
})

/**
 * Type for get transactions query parameters
 */
export type GetTransactionsInput = z.infer<typeof getTransactionsSchema>

export const getConnectionWithAccountsSchema = z.object({
  connectionId: z.string(),
})

/**
 * Type for get connection with accounts input
 */
export type GetConnectionWithAccountsInput = z.infer<
  typeof getConnectionWithAccountsSchema
>

export const getTransactionStatsSchema = z.object({
  accountId: z.string().optional(),
  endDate: z.date().optional(),
  startDate: z.date().optional(),
})

/**
 * Type for get transaction stats input
 */
export type GetTransactionStatsInput = z.infer<typeof getTransactionStatsSchema>

export const removeTransactionAttachmentSchema = z.object({
  attachmentId: z.string(),
})

/**
 * Type for remove transaction attachment input
 */
export type RemoveTransactionAttachmentInput = z.infer<
  typeof removeTransactionAttachmentSchema
>

export const updateTransactionSchema = z.object({
  category: z.nativeEnum(TransactionCategory).optional(),
  customCategory: z.string().optional(),
  excludeFromBudget: z.boolean().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  transactionId: z.string(),
})

/**
 * Type for update transaction input
 */
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>

export const getTeamBankAccountsSchema = z.object({
  teamId: z.string().optional(),
})

/**
 * Type for get team bank accounts input
 */
export type GetTeamBankAccountsInput = z.infer<typeof getTeamBankAccountsSchema>

export const getByIdSchema = z.object({
  id: z.string(),
})

/**
 * Type for get by id input
 */
export type GetByIdInput = z.infer<typeof getByIdSchema>

/**
 * Schema defining the structure of a bank account response.
 * This schema is used to validate the response data when retrieving bank accounts.
 *
 * @property {string} id - Unique identifier for the bank account
 * @property {number|null} availableBalance - Available balance in the account (may be null)
 * @property {object} bankConnection - Information about the bank institution
 * @property {string} bankConnection.institutionName - Name of the financial institution
 * @property {string|null} bankConnection.logo - URL to the institution's logo (may be null)
 * @property {string|null} bankConnection.primaryColor - Brand color of the institution (may be null)
 * @property {Date} createdAt - Timestamp when the account record was created
 * @property {number|null} currentBalance - Current balance in the account (may be null)
 * @property {string} displayName - User-friendly display name for the account
 * @property {string|null} isoCurrencyCode - ISO currency code (e.g., 'USD', 'EUR') (may be null)
 * @property {string|null} mask - Last 4 digits of the account number (may be null)
 * @property {string} name - Official name of the account from the institution
 * @property {string|null} subtype - Account subtype (e.g., 'checking', 'savings', 'credit card') (may be null)
 * @property {string} type - Account type (e.g., 'depository', 'credit')
 */
export const bankAccountResponseSchema = z.object({
  id: z.string(),
  availableBalance: z.number().nullable(),
  bankConnection: z.object({
    institutionName: z.string(),
    logo: z.string().nullable(),
    primaryColor: z.string().nullable(),
  }),
  createdAt: z.date(),
  currentBalance: z.number().nullable(),
  displayName: z.string(),
  isoCurrencyCode: z.string().nullable(),
  mask: z.string().nullable(),
  name: z.string(),
  subtype: z.string().nullable(),
  type: z.string(),
})

/**
 * Type for bank account response
 */
export type BankAccountResponse = z.infer<typeof bankAccountResponseSchema>

/**
 * Schema defining the structure of an account within a bank connection response.
 *
 * @property {string} id - Unique identifier for the bank account
 * @property {string} name - Display name of the account
 * @property {string} type - Type of account (e.g., 'checking', 'savings', 'credit card')
 * @property {number} balance - Current balance of the account
 * @property {string} currency - Currency code of the account (e.g., 'USD')
 * @property {boolean} enabled - Whether the account is enabled
 */
export const connectionAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  balance: z.number(),
  currency: z.string(),
  enabled: z.boolean(),
})

/**
 * Type for connection account
 */
export type ConnectionAccount = z.infer<typeof connectionAccountSchema>

/**
 * Schema defining the structure of a bank connection with accounts response.
 * This schema is used to validate the response data when retrieving a bank connection with its associated accounts.
 *
 * @property {string} id - Unique identifier for the bank connection
 * @property {string} name - Name of the financial institution
 * @property {string|null} logo - URL to the institution's logo
 * @property {string} provider - Provider or institution ID
 * @property {string} status - Current status of the connection
 * @property {string|null} expires_at - Timestamp when the connection expires (if applicable)
 * @property {Array<connectionAccountSchema>} accounts - Array of accounts associated with this connection
 */
export const connectionWithAccountsResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().nullable(),
  provider: z.string(),
  status: z.string(),
  expires_at: z.string().nullable(),
  accounts: z.array(connectionAccountSchema),
})

/**
 * Type for connection with accounts response
 */
export type ConnectionWithAccountsResponse = z.infer<
  typeof connectionWithAccountsResponseSchema
>

/**
 * Schema defining the structure of a bank connection in the team bank account response.
 *
 * @property {string} id - Unique identifier for the bank connection
 * @property {string} name - Name of the financial institution
 * @property {string|null} logo - URL to the institution's logo (may be null)
 * @property {string} provider - Provider or institution ID
 * @property {string} status - Current status of the connection
 * @property {string|null} expires_at - Timestamp when the connection expires (if applicable)
 */
export const teamBankConnectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().nullable(),
  provider: z.string(),
  status: z.string(),
  expires_at: z.string().nullable(),
})

/**
 * Type for team bank connection
 */
export type TeamBankConnection = z.infer<typeof teamBankConnectionSchema>

/**
 * Schema defining the structure of a bank account in the team bank accounts response.
 * This schema is used to validate the response data when retrieving bank accounts for a team.
 *
 * @property {string} id - Unique identifier for the bank account
 * @property {string} name - Display name of the account
 * @property {string} type - Type of account (e.g., 'checking', 'savings', 'credit')
 * @property {number} balance - Current balance of the account
 * @property {string} currency - Currency code of the account (e.g., 'USD')
 * @property {boolean} enabled - Whether the account is enabled
 * @property {boolean} manual - Whether this is a manually created account (not linked to a bank connection)
 * @property {object|null} bank - Information about the associated bank connection (null for manual accounts)
 */
export const teamBankAccountResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  balance: z.number(),
  currency: z.string(),
  enabled: z.boolean(),
  manual: z.boolean(),
  bank: teamBankConnectionSchema.nullable(),
})

/**
 * Type for team bank account response
 */
export type TeamBankAccountResponse = z.infer<
  typeof teamBankAccountResponseSchema
>

/**
 * Schema defining the structure of a minimal bank account info in transaction responses.
 *
 * @property {string} displayName - User-friendly display name for the account
 * @property {string|null} mask - Last 4 digits of the account number (may be null)
 * @property {string} name - Official name of the account from the institution
 */
export const transactionBankAccountSchema = z.object({
  displayName: z.string(),
  mask: z.string().nullable(),
  name: z.string(),
})

/**
 * Type for transaction bank account
 */
export type TransactionBankAccount = z.infer<
  typeof transactionBankAccountSchema
>

/**
 * Schema defining the structure of a transaction in transaction responses.
 *
 * @property {string} id - Unique identifier for the transaction
 * @property {number} amount - Transaction amount (positive for credits, negative for debits)
 * @property {object|null} bankAccount - Associated bank account information
 * @property {string|null} category - Transaction category from a predefined set of categories
 * @property {string|null} customCategory - User-defined custom category
 * @property {Date} date - Date when the transaction occurred
 * @property {string|null} description - Description of the transaction
 * @property {boolean|null} excludeFromBudget - Whether to exclude this transaction from budget calculations
 * @property {boolean|null} isRecurring - Whether this is a recurring transaction
 * @property {string|null} merchantName - Name of the merchant
 * @property {string} name - Display name of the transaction
 * @property {string|null} notes - User-added notes about the transaction
 * @property {boolean} pending - Whether the transaction is pending or settled
 * @property {string[]|null} tags - Array of user-defined tags
 */
export const transactionResponseSchema = z.object({
  id: z.string(),
  amount: z.number(),
  bankAccount: transactionBankAccountSchema.nullable(),
  category: z.nativeEnum(TransactionCategory).nullable(),
  customCategory: z.string().nullable(),
  date: z.date(),
  description: z.string().nullable(),
  excludeFromBudget: z.boolean().nullable(),
  isRecurring: z.boolean().nullable(),
  merchantName: z.string().nullable(),
  name: z.string(),
  notes: z.string().nullable(),
  pending: z.boolean(),
  tags: z.array(z.string()).nullable(),
})

/**
 * Type for transaction response
 */
export type TransactionResponse = z.infer<typeof transactionResponseSchema>

/**
 * Schema defining the structure of the transactions list response.
 *
 * @property {boolean} hasMore - Whether there are more transactions available beyond the current page
 * @property {number} totalCount - Total number of transactions matching the query filters
 * @property {Array<transactionResponseSchema>} transactions - Array of transaction objects on the current page
 */
export const transactionsResponseSchema = z.object({
  hasMore: z.boolean(),
  totalCount: z.number(),
  transactions: z.array(transactionResponseSchema),
})

/**
 * Type for transactions list response
 */
export type TransactionsResponse = z.infer<typeof transactionsResponseSchema>

/**
 * Schema defining the structure of the remove transaction attachment response.
 *
 * @property {boolean} success - Whether the attachment was successfully removed
 */
export const removeTransactionAttachmentResponseSchema = z.object({
  success: z.boolean(),
})

/**
 * Type for remove transaction attachment response
 */
export type RemoveTransactionAttachmentResponse = z.infer<
  typeof removeTransactionAttachmentResponseSchema
>
