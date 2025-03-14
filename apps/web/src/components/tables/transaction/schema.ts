import {
  ARRAY_DELIMITER,
  RANGE_DELIMITER,
  SLIDER_DELIMITER,
} from '@/lib/delimiters';

import { REGIONS } from '@/constants/region';
import { TAGS } from '@/constants/tag';
import { z } from 'zod';

/**
 * Defines the data schema for financial transactions using Zod. This file
 * contains schema definitions, validation rules, enum values, and types used
 * throughout the transaction components.
 *
 * @file Schema.ts
 */

/**
 * Helper function to convert string values to booleans. Used for handling
 * boolean values from URL search parameters and form submissions.
 *
 * @example
 *   // Convert "true" to true
 *   stringToBoolean.parse('true'); // returns true
 *
 *   // Convert "false" to false
 *   stringToBoolean.parse('false'); // returns false
 */
const stringToBoolean = z
  .string()
  .toLowerCase()
  .transform((val) => {
    try {
      return JSON.parse(val);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  })
  .pipe(z.boolean().optional());

/**
 * Transaction categories based on the Prisma schema. These categories represent
 * high-level groupings of financial transactions.
 *
 * @property INCOME - Money received (salary, interest, etc.)
 * @property TRANSFER - Movement of money between accounts
 * @property LOAN_PAYMENTS - Payments toward loans
 * @property BANK_FEES - Bank service charges and fees
 * @property ENTERTAINMENT - Recreational spending
 * @property FOOD_AND_DRINK - Restaurants, groceries, etc.
 * @property GENERAL_MERCHANDISE - Retail purchases
 * @property HOME_IMPROVEMENT - House repairs, maintenance
 * @property MEDICAL - Healthcare expenses
 * @property PERSONAL_CARE - Self-care services
 * @property GENERAL_SERVICES - Service-based purchases
 * @property GOVERNMENT_AND_NON_PROFIT - Government and charity payments
 * @property TRANSPORTATION - Travel and commuting expenses
 * @property TRAVEL - Vacation and business trips
 * @property UTILITIES - Household utilities
 * @property OTHER - Miscellaneous expenses
 */
export const TRANSACTION_CATEGORIES = [
  'INCOME',
  'TRANSFER',
  'LOAN_PAYMENTS',
  'BANK_FEES',
  'ENTERTAINMENT',
  'FOOD_AND_DRINK',
  'GENERAL_MERCHANDISE',
  'HOME_IMPROVEMENT',
  'MEDICAL',
  'PERSONAL_CARE',
  'GENERAL_SERVICES',
  'GOVERNMENT_AND_NON_PROFIT',
  'TRANSPORTATION',
  'TRAVEL',
  'UTILITIES',
  'OTHER',
] as const;

/**
 * Transaction frequencies for recurring transactions. Defines how often a
 * transaction repeats.
 *
 * @property WEEKLY - Once every week
 * @property BIWEEKLY - Once every two weeks
 * @property MONTHLY - Once every month
 * @property SEMI_MONTHLY - Twice a month (typically on the 1st and 15th)
 * @property ANNUALLY - Once a year
 * @property IRREGULAR - No fixed schedule
 * @property UNKNOWN - Frequency hasn't been determined
 */
export const TRANSACTION_FREQUENCIES = [
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'SEMI_MONTHLY',
  'ANNUALLY',
  'IRREGULAR',
  'UNKNOWN',
] as const;

/**
 * Payment methods for transactions. Defines the mechanism used to make a
 * payment.
 *
 * @property CREDIT_CARD - Credit card payment
 * @property DEBIT_CARD - Debit card payment
 * @property ACH - Automated Clearing House electronic transfer
 * @property WIRE - Wire transfer
 * @property CHECK - Paper check
 * @property CASH - Physical cash
 * @property DIGITAL_WALLET - Digital payment services (PayPal, Venmo, etc.)
 * @property OTHER - Other payment methods
 */
export const PAYMENT_METHODS = [
  'CREDIT_CARD',
  'DEBIT_CARD',
  'ACH',
  'WIRE',
  'CHECK',
  'CASH',
  'DIGITAL_WALLET',
  'OTHER',
] as const;

/**
 * Transaction status options. Indicates the current state of a transaction.
 *
 * @property PENDING - Transaction is initiated but not settled
 * @property COMPLETED - Transaction is fully processed
 * @property CANCELLED - Transaction was cancelled
 * @property FAILED - Transaction attempt failed
 * @property REFUNDED - Transaction was refunded
 */
export const TRANSACTION_STATUSES = [
  'PENDING',
  'COMPLETED',
  'CANCELLED',
  'FAILED',
  'REFUNDED',
] as const;

/**
 * Transaction types. Describes the nature or purpose of the transaction.
 *
 * @property PURCHASE - Regular buying of goods or services
 * @property REFUND - Money returned from a previous purchase
 * @property PAYMENT - Regular bill payment
 * @property DEPOSIT - Money added to account
 * @property WITHDRAWAL - Money removed from account
 * @property TRANSFER - Movement of money between accounts
 * @property FEE - Service or penalty charges
 * @property INTEREST - Interest earned or paid
 * @property ADJUSTMENT - Account balance correction
 * @property OTHER - Transactions that don't fit other categories
 */
export const TRANSACTION_TYPES = [
  'PURCHASE',
  'REFUND',
  'PAYMENT',
  'DEPOSIT',
  'WITHDRAWAL',
  'TRANSFER',
  'FEE',
  'INTEREST',
  'ADJUSTMENT',
  'OTHER',
] as const;

/**
 * Payment channels. Describes the medium through which a transaction was
 * conducted.
 *
 * @property IN_PERSON - Physical point-of-sale transaction
 * @property ONLINE - Web-based transaction
 * @property MOBILE - Transaction via mobile device
 * @property ATM - Automated Teller Machine transaction
 * @property PHONE - Transaction by phone
 * @property MAIL - Transaction by postal mail
 */
export const PAYMENT_CHANNELS = [
  'IN_PERSON',
  'ONLINE',
  'MOBILE',
  'ATM',
  'PHONE',
  'MAIL',
] as const;

/**
 * Transaction channels. Describes the specific interface used for the
 * transaction.
 *
 * @property IN_STORE - Physical retail location
 * @property ONLINE - Website or web application
 * @property MOBILE_APP - Smartphone application
 * @property PHONE - Phone call or SMS
 * @property ATM - Automated Teller Machine
 * @property BANK_TELLER - In-person bank service
 * @property MAIL - Postal mail
 */
export const TRANSACTION_CHANNELS = [
  'IN_STORE',
  'ONLINE',
  'MOBILE_APP',
  'PHONE',
  'ATM',
  'BANK_TELLER',
  'MAIL',
] as const;

/**
 * Cash flow categories. High-level categorization for cash flow analysis.
 *
 * @property INCOME - Money coming in
 * @property EXPENSE - Money going out
 * @property TRANSFER - Money moving between accounts
 * @property EXCLUDED - Transactions excluded from cash flow analysis
 */
export const CASH_FLOW_CATEGORIES = [
  'INCOME',
  'EXPENSE',
  'TRANSFER',
  'EXCLUDED',
] as const;

/**
 * Cash flow types. Categorizes expenses by predictability.
 *
 * @property FIXED - Consistent amount on regular schedule
 * @property VARIABLE - Fluctuating amount or irregular schedule
 */
export const CASH_FLOW_TYPES = ['FIXED', 'VARIABLE'] as const;

/**
 * Review statuses. Indicates whether a transaction has been reviewed by the
 * user.
 *
 * @property NOT_REVIEWED - Transaction hasn't been reviewed
 * @property REVIEWED - Transaction has been reviewed
 * @property NEEDS_REVIEW - Transaction requires attention
 */
export const REVIEW_STATUSES = [
  'NOT_REVIEWED',
  'REVIEWED',
  'NEEDS_REVIEW',
] as const;

/**
 * Comprehensive transaction schema defining the structure and validation rules
 * for financial transaction data. This schema is organized into logical
 * sections:
 *
 * - Basic identifiers (id, userId)
 * - Account information (bankAccountId, bankAccountName)
 * - Transaction details (amount, name, description)
 * - Categorization (category, subCategory)
 * - Merchant information (merchantName, merchantId)
 * - Location data (latitude, longitude)
 * - Payment metadata (paymentMethod, transactionReference)
 * - Financial reporting (fiscalYear, vatAmount)
 * - Transaction attributes (status, transactionType)
 * - Budgeting information (budgetCategory, plannedExpense)
 * - Business categorization (costCenter, projectCode)
 * - Personal finance management (excludeFromBudget, isRecurring)
 * - Enrichment & insights (cashFlowCategory, anomalyScore)
 * - User interaction (isVerified, isFlagged)
 * - Organization (tags, notes)
 * - Split transaction support (isSplit, splitTotal)
 * - Search & filtering (searchableText, dateMonth)
 * - Audit trail (createdAt, importedAt)
 * - Notification state (internal, notified)
 */
export const columnSchema = z.object({
  // Basic transaction identifiers
  id: z.string(),
  userId: z.string().optional(),
  plaidTransactionId: z.string().nullable().optional(),

  // Account information
  bankAccountId: z.string(),
  bankAccountName: z.string().optional(),

  // Transaction details
  amount: z.number(),
  isoCurrencyCode: z.string().nullable().optional(),
  currency: z.string().optional().default('USD'),
  baseAmount: z.number().nullable().optional(),
  baseCurrency: z.string().nullable().optional(),
  name: z.string(),
  merchantName: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  date: z.date(),
  pending: z.boolean().default(false),

  // Categorization
  category: z.enum(TRANSACTION_CATEGORIES).nullable().optional(),
  subCategory: z.string().nullable().optional(),
  customCategory: z.string().nullable().optional(),
  categorySlug: z.string().nullable().optional(),
  categoryIconUrl: z.string().nullable().optional(),

  // Enhanced merchant data
  merchantId: z.string().nullable().optional(),
  merchantLogoUrl: z.string().nullable().optional(),
  merchantCategory: z.string().nullable().optional(),
  merchantWebsite: z.string().nullable().optional(),
  merchantPhone: z.string().nullable().optional(),
  merchantAddress: z.string().nullable().optional(),
  merchantCity: z.string().nullable().optional(),
  merchantState: z.string().nullable().optional(),
  merchantZip: z.string().nullable().optional(),
  merchantCountry: z.string().nullable().optional(),

  // Location data
  location: z.any().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),

  // Payment metadata
  paymentMethod: z.enum(PAYMENT_METHODS).nullable().optional(),
  paymentChannel: z.string().nullable().optional(),
  paymentProcessor: z.string().nullable().optional(),
  paymentGateway: z.string().nullable().optional(),
  transactionReference: z.string().nullable().optional(),
  authorizationCode: z.string().nullable().optional(),
  checkNumber: z.string().nullable().optional(),
  wireReference: z.string().nullable().optional(),
  accountNumber: z.string().nullable().optional(),
  cardType: z.string().nullable().optional(),
  cardNetwork: z.string().nullable().optional(),
  cardLastFour: z.string().nullable().optional(),

  // Enhanced metadata
  originalDescription: z.string().nullable().optional(),
  originalCategory: z.string().nullable().optional(),
  originalMerchantName: z.string().nullable().optional(),

  // Financial reporting & analysis
  fiscalYear: z.number().nullable().optional(),
  fiscalMonth: z.number().nullable().optional(),
  fiscalQuarter: z.number().nullable().optional(),
  vatAmount: z.number().nullable().optional(),
  vatRate: z.number().nullable().optional(),
  taxAmount: z.number().nullable().optional(),
  taxRate: z.number().nullable().optional(),
  taxDeductible: z.boolean().nullable().optional(),
  taxExempt: z.boolean().nullable().optional(),
  taxCategory: z.string().nullable().optional(),

  // Enhanced transaction attributes
  status: z.enum(TRANSACTION_STATUSES).optional(),
  transactionType: z.enum(TRANSACTION_TYPES).nullable().optional(),
  transactionMethod: z.string().nullable().optional(),
  transactionChannel: z.string().nullable().optional(),

  // Budgeting & financial planning
  budgetCategory: z.string().nullable().optional(),
  budgetSubcategory: z.string().nullable().optional(),
  budgetId: z.string().nullable().optional(),
  plannedExpense: z.boolean().nullable().optional(),
  discretionary: z.boolean().nullable().optional(),
  needsWantsCategory: z.string().nullable().optional(),
  spendingGoalId: z.string().nullable().optional(),

  // Investment & business categorization
  investmentCategory: z.string().nullable().optional(),
  businessPurpose: z.string().nullable().optional(),
  costCenter: z.string().nullable().optional(),
  projectCode: z.string().nullable().optional(),
  reimbursable: z.boolean().nullable().optional(),
  clientId: z.string().nullable().optional(),
  invoiceId: z.string().nullable().optional(),

  // Personal finance management
  excludeFromBudget: z.boolean().default(false),
  isRecurring: z.boolean().optional(),
  recurrenceId: z.string().nullable().optional(),
  recurringTransactionId: z.string().nullable().optional(),
  frequency: z.enum(TRANSACTION_FREQUENCIES).nullable().optional(),
  recurringDay: z.number().nullable().optional(),
  estimatedNextDate: z.date().nullable().optional(),
  similarTransactions: z.number().nullable().optional(),

  // Enrichment & insights
  cashFlowCategory: z.string().nullable().optional(),
  cashFlowType: z.string().nullable().optional(),
  inflationCategory: z.string().nullable().optional(),
  confidenceScore: z.number().nullable().optional(),
  anomalyScore: z.number().nullable().optional(),
  insightTags: z.array(z.string()).default([]),

  // User interaction & management
  isManual: z.boolean().default(false),
  isModified: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  isFlagged: z.boolean().default(false),
  isHidden: z.boolean().default(false),
  isLocked: z.boolean().default(false),
  isReconciled: z.boolean().default(false),
  needsAttention: z.boolean().default(false),
  reviewStatus: z.string().nullable().optional(),
  userNotes: z.string().nullable().optional(),

  // Tagging and organization
  tags: z.array(z.string()).default([]),
  notes: z.string().nullable().optional(),
  customFields: z.any().optional(),
  labels: z.array(z.string()).default([]),

  // Split transaction support
  parentTransactionId: z.string().nullable().optional(),
  isSplit: z.boolean().default(false),
  splitTotal: z.number().nullable().optional(),
  splitCount: z.number().nullable().optional(),

  // Enhanced search & filtering
  searchableText: z.string().nullable().optional(),
  dateYear: z.number().nullable().optional(),
  dateMonth: z.number().nullable().optional(),
  dateDay: z.number().nullable().optional(),
  dateDayOfWeek: z.number().nullable().optional(),
  dateWeekOfYear: z.number().nullable().optional(),

  // Audit trail and timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  importedAt: z.date().nullable().optional(),
  lastReviewedAt: z.date().nullable().optional(),
  lastModifiedAt: z.date().nullable().optional(),
  lastCategorizedAt: z.date().nullable().optional(),

  // Notification related
  internal: z.boolean().nullable().optional(),
  notified: z.boolean().nullable().optional(),
});

/**
 * TypeScript type for transactions, derived from the Zod schema. Use this type
 * when working with transaction objects throughout the application.
 *
 * @example
 *   ```tsx
 *   function TransactionCard({ transaction }: { transaction: ColumnSchema }) {
 *     return (
 *       <Card>
 *         <CardHeader>{transaction.name}</CardHeader>
 *         <CardContent>{formatCurrency(transaction.amount)}</CardContent>
 *       </Card>
 *     );
 *   }
 *   ```;
 */
export type ColumnSchema = z.infer<typeof columnSchema>;

/**
 * Zod schema for filtering transactions. Defines the structure of filter
 * parameters used in the data table and API requests. This schema allows for
 * filtering by multiple criteria simultaneously.
 *
 * Each field uses appropriate parsing logic for its data type:
 *
 * - Range values (like amount) use SLIDER_DELIMITER to separate min/max values
 * - Date ranges use RANGE_DELIMITER to separate start/end timestamps
 * - Multi-select fields use ARRAY_DELIMITER to separate selected values
 * - Boolean filters convert string representations to true/false values
 */
export const columnFilterSchema = z.object({
  amount: z
    .string()
    .transform((val) => val.split(SLIDER_DELIMITER))
    .pipe(z.coerce.number().array().max(2))
    .optional(),
  name: z.string().optional(),
  merchantName: z.string().optional(),
  date: z
    .string()
    .transform((val) => val.split(RANGE_DELIMITER).map(Number))
    .pipe(z.coerce.date().array())
    .optional(),
  pending: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(stringToBoolean.array())
    .optional(),
  category: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(z.enum(TRANSACTION_CATEGORIES).array())
    .optional(),
  paymentMethod: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(z.enum(PAYMENT_METHODS).array())
    .optional(),
  transactionType: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(z.enum(TRANSACTION_TYPES).array())
    .optional(),
  isRecurring: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(stringToBoolean.array())
    .optional(),
  frequency: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(z.enum(TRANSACTION_FREQUENCIES).array())
    .optional(),
  tags: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(z.string().array())
    .optional(),
  excludeFromBudget: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(stringToBoolean.array())
    .optional(),
  isManual: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(stringToBoolean.array())
    .optional(),
  bankAccountId: z.string().optional(),
  isVerified: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(stringToBoolean.array())
    .optional(),
  isFlagged: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(stringToBoolean.array())
    .optional(),
  cashFlowCategory: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(z.string().array())
    .optional(),
  merchantId: z.string().optional(),
  taxDeductible: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(stringToBoolean.array())
    .optional(),
  isHidden: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(stringToBoolean.array())
    .optional(),
  budgetCategory: z.string().optional(),
  reviewStatus: z
    .string()
    .transform((val) => val.split(ARRAY_DELIMITER))
    .pipe(z.string().array())
    .optional(),
});

/**
 * TypeScript type for filter parameters, derived from the filter schema. Use
 * this type when implementing filter functionality for transactions.
 *
 * @example
 *   ```tsx
 *   function applyFilters(
 *     transactions: ColumnSchema[],
 *     filters: Partial<ColumnFilterSchema>
 *   ) {
 *     return transactions.filter(tx => {
 *       if (filters.category && !filters.category.includes(tx.category)) return false;
 *       if (filters.isRecurring && !filters.isRecurring.includes(tx.isRecurring)) return false;
 *       // Additional filter logic...
 *       return true;
 *     });
 *   }
 *   ```;
 */
export type ColumnFilterSchema = z.infer<typeof columnFilterSchema>;

/**
 * Base schema for chart data related to transactions. Used for visualizing
 * transaction data in time-series charts.
 *
 * @example
 *   ```tsx
 *   const chartData: BaseChartSchema[] = [
 *     { timestamp: 1625097600000, income: 2500, expenses: 1800 },
 *     { timestamp: 1627776000000, income: 2500, expenses: 2100 },
 *     { timestamp: 1630454400000, income: 3000, expenses: 1950 }
 *   ];
 *   ```;
 *
 * @property timestamp - Unix timestamp for the data point
 * @property [key: string] - Dynamic properties storing numeric values for the
 *   chart
 */
export type BaseChartSchema = { timestamp: number; [key: string]: number };
