import { z } from 'zod'

/**
 * Schema for a bank account
 * @description This schema defines the structure of a bank account connected through a financial provider
 */
const AccountSchema = z.object({
  /**
   * Unique identifier for the account from the provider
   */
  account_id: z
    .string()
    .describe('Unique identifier for the account from the provider'),

  /**
   * Name of the bank or financial institution
   */
  bank_name: z.string().describe('Name of the bank or financial institution'),

  /**
   * Current balance of the account, if available
   */
  balance: z
    .number()
    .optional()
    .describe('Current balance of the account, if available'),

  /**
   * Currency code for the account (e.g., 'USD', 'EUR')
   */
  currency: z
    .string()
    .describe('Currency code for the account (e.g., "USD", "EUR")'),

  /**
   * Display name of the account
   */
  name: z.string().describe('Display name of the account'),

  /**
   * Institution identifier from the provider
   */
  institution_id: z
    .string()
    .describe('Institution identifier from the provider'),

  /**
   * Whether the account is enabled for transactions
   */
  enabled: z
    .boolean()
    .describe('Whether the account is enabled for transactions'),

  /**
   * URL to the institution's logo, if available
   */
  logo_url: z
    .string()
    .nullable()
    .optional()
    .describe("URL to the institution's logo, if available"),

  /**
   * Expiration date for access token (used by some providers like EnableBanking & GoCardLess)
   */
  expires_at: z
    .string()
    .nullable()
    .optional()
    .describe('Expiration date for access token (used by some providers)'),

  /**
   * Type of account
   */
  type: z
    .enum(['credit', 'depository', 'other_asset', 'loan', 'other_liability'])
    .describe('Type of account (credit, depository, loan, etc.)'),
})

/**
 * Schema for creating a bank connection
 * @description This schema defines the input parameters required to create a new bank connection
 */
export const CreateBankConnectionSchema = z.object({
  /**
   * Identifier for the financial institution
   */
  institutionId: z
    .string()
    .describe('Identifier for the financial institution'),

  /**
   * Access token provided by the financial data provider
   */
  accessToken: z
    .string()
    .describe('Access token provided by the financial data provider'),

  /**
   * Item identifier from the provider (e.g., Plaid item_id)
   */
  itemId: z
    .string()
    .describe('Item identifier from the provider (e.g., Plaid item_id)'),

  /**
   * User ID who owns this connection
   */
  userId: z.string().describe('User ID who owns this connection'),

  /**
   * Team ID associated with this connection
   */
  teamId: z.string().describe('Team ID associated with this connection'),

  /**
   * Financial data provider name
   */
  provider: z
    .enum(['plaid', 'teller', 'stripe', 'gocardless'])
    .describe('Financial data provider name'),

  /**
   * Array of accounts associated with this connection
   */
  accounts: z
    .array(AccountSchema)
    .describe('Array of accounts associated with this connection'),
})

/**
 * Schema for the response returned when creating a bank connection
 * @description This schema defines the structure of the response returned by the createBankConnection mutation
 * @property connectionId - The unique identifier for the newly created or updated bank connection
 * @property success - A boolean indicating whether the operation was successful
 */
export const CreateBankConnectionResponseSchema = z.object({
  connectionId: z
    .string()
    .describe(
      'The unique identifier for the newly created or updated bank connection',
    ),
  success: z
    .boolean()
    .describe('Indicates whether the operation was successful'),
})

/**
 * Type definition for the response returned when creating a bank connection
 */
export type CreateBankConnectionResponse = z.infer<
  typeof CreateBankConnectionResponseSchema
>
