import {
  ARRAY_DELIMITER,
  RANGE_DELIMITER,
  SLIDER_DELIMITER,
} from "@/lib/delimiters";

import { REGIONS } from "@/constants/region";
import { TAGS } from "@/constants/tag";
import { z } from "zod";

// https://github.com/colinhacks/zod/issues/2985#issue-2008642190
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

// Transaction categories based on the Prisma schema
export const TRANSACTION_CATEGORIES = [
  "INCOME",
  "TRANSFER",
  "LOAN_PAYMENTS",
  "BANK_FEES",
  "ENTERTAINMENT",
  "FOOD_AND_DRINK",
  "GENERAL_MERCHANDISE",
  "HOME_IMPROVEMENT",
  "MEDICAL",
  "PERSONAL_CARE",
  "GENERAL_SERVICES",
  "GOVERNMENT_AND_NON_PROFIT",
  "TRANSPORTATION",
  "TRAVEL",
  "UTILITIES",
  "OTHER",
] as const;

// Transaction frequencies based on the Prisma schema
export const TRANSACTION_FREQUENCIES = [
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "SEMI_MONTHLY",
  "ANNUALLY",
  "IRREGULAR",
  "UNKNOWN",
] as const;

// Payment methods
export const PAYMENT_METHODS = [
  "CREDIT_CARD",
  "DEBIT_CARD",
  "ACH",
  "WIRE",
  "CHECK",
  "CASH",
  "DIGITAL_WALLET",
  "OTHER",
] as const;

// Transaction status options
export const TRANSACTION_STATUSES = [
  "PENDING",
  "COMPLETED",
  "CANCELLED",
  "FAILED",
  "REFUNDED",
] as const;

// Transaction types
export const TRANSACTION_TYPES = [
  "PURCHASE",
  "REFUND",
  "PAYMENT",
  "DEPOSIT",
  "WITHDRAWAL",
  "TRANSFER",
  "FEE",
  "INTEREST",
  "ADJUSTMENT",
  "OTHER",
] as const;

// Payment channels
export const PAYMENT_CHANNELS = [
  "IN_PERSON",
  "ONLINE",
  "MOBILE",
  "ATM",
  "PHONE",
  "MAIL",
] as const;

// Transaction channels
export const TRANSACTION_CHANNELS = [
  "IN_STORE",
  "ONLINE",
  "MOBILE_APP",
  "PHONE",
  "ATM",
  "BANK_TELLER",
  "MAIL",
] as const;

// Cash flow categories
export const CASH_FLOW_CATEGORIES = [
  "INCOME",
  "EXPENSE",
  "TRANSFER",
  "EXCLUDED",
] as const;

// Cash flow types
export const CASH_FLOW_TYPES = [
  "FIXED",
  "VARIABLE",
] as const;

// Review statuses
export const REVIEW_STATUSES = [
  "NOT_REVIEWED",
  "REVIEWED",
  "NEEDS_REVIEW",
] as const;

// Define the column schema for transactions
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
  currency: z.string().optional().default("USD"),
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

export type ColumnSchema = z.infer<typeof columnSchema>;

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

export type ColumnFilterSchema = z.infer<typeof columnFilterSchema>;

// Define BaseChartSchema type similar to what's in the infinite schema
export type BaseChartSchema = { timestamp: number;[key: string]: number };
