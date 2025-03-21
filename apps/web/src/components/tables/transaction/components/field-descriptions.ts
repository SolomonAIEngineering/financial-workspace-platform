/**
 * Field descriptions for transaction details used in tooltips.
 *
 * This module exports a comprehensive record mapping transaction field names to
 * human-readable descriptions that explain the purpose and meaning of each
 * field. These descriptions are used in tooltips throughout the transaction
 * details interface to provide context and help users understand the
 * significance of each data point.
 *
 * The descriptions are organized by logical groupings to cover all aspects of a
 * transaction:
 *
 * - Basic transaction information (id, amount, date, etc.)
 * - Merchant details (name, contact information, location)
 * - Categorization information (categories, tags, classifications)
 * - Payment details (method, card information, references)
 * - Financial metadata (tax information, fiscal details)
 * - Location data (coordinates, address information)
 * - Recurring transaction information (frequency, patterns)
 * - System-related information (flags, timestamps, status indicators)
 *
 * @example
 *   ```tsx
 *   import { fieldDescriptions } from './field-descriptions';
 *
 *   <DetailRow
 *     label="Transaction ID"
 *     value={transaction.id}
 *     tooltip={fieldDescriptions.id}
 *   />
 *   ```;
 */
export const fieldDescriptions: Record<string, string> = {
  // Basic Transaction Information
  id: 'Unique identifier for this transaction',
  name: 'Display name for the transaction',
  amount: 'Transaction amount - positive for income, negative for expenses',
  date: 'The date when the transaction occurred',
  status: 'Current status of the transaction (pending or completed)',
  description: 'Detailed description of the transaction',
  notes: 'Additional notes or comments added to this transaction',

  // Merchant Information
  merchantName:
    'Name of the merchant or counter-party involved in the transaction',
  merchantId: 'Unique identifier for the merchant',
  merchantCategory: 'Business category of the merchant',
  merchantWebsite: 'Website URL of the merchant',
  merchantPhone: 'Contact phone number for the merchant',
  merchantAddress: 'Street address of the merchant location',
  merchantCity: 'City where the merchant is located',
  merchantState: 'State/province where the merchant is located',
  merchantZip: "Postal or ZIP code of the merchant's location",
  merchantCountry: 'Country where the merchant is located',

  // Categorization
  category: 'Primary category assigned to this transaction',
  subCategory: 'Sub-category for more detailed classification',
  customCategory: 'User-defined custom category for this transaction',
  budgetCategory: 'Budget category this transaction is associated with',
  budgetSubcategory: 'Budget sub-category this transaction is associated with',
  needsWantsCategory:
    "Classification as 'need' or 'want' for budgeting purposes",
  fiscalYear: 'Fiscal year this transaction belongs to',
  fiscalMonth: 'Fiscal month number (1-12) this transaction belongs to',
  fiscalQuarter: 'Fiscal quarter (1-4) this transaction belongs to',
  tags: 'User-defined tags associated with this transaction',
  insightTags: 'System-generated tags based on transaction analysis',
  labels: 'Organizational labels applied to this transaction',

  // Payment Details
  paymentMethod:
    'Method used to make the payment (credit card, bank transfer, etc.)',
  paymentChannel: 'Channel through which the payment was processed',
  paymentProcessor: 'Payment processor that handled the transaction',
  paymentGateway: 'Gateway used for processing the payment',
  cardType: 'Type of card used (credit, debit, etc.)',
  cardNetwork: 'Card network (Visa, Mastercard, etc.)',
  cardLastFour: 'Last four digits of the card used',
  transactionReference: 'Reference number assigned by the payment system',
  authorizationCode: 'Authorization code for the transaction',
  checkNumber: 'Check number for check payments',
  wireReference: 'Reference number for wire transfers',
  accountNumber: 'Account number associated with the transaction',

  // Tax & Financial Information
  taxDeductible: 'Indicates if this transaction is tax deductible',
  taxExempt: 'Indicates if this transaction is exempt from taxes',
  excludeFromBudget:
    'Indicates if this transaction should be excluded from budget calculations',
  reimbursable: 'Indicates if this transaction is eligible for reimbursement',
  vatAmount: 'Value-added tax amount included in the transaction',
  vatRate: 'VAT rate applied to this transaction',
  taxAmount: 'Tax amount included in the transaction',
  taxRate: 'Tax rate applied to this transaction',
  taxCategory: 'Tax category this transaction falls under',
  businessPurpose: 'Business purpose of this transaction',
  costCenter: 'Cost center this transaction is associated with',
  projectCode: 'Project code this transaction is associated with',
  cashFlowCategory: 'Cash flow category (operating, investing, financing)',
  cashFlowType: 'Type of cash flow this transaction represents',
  baseAmount: 'Original amount in base currency before conversion',
  baseCurrency: 'Original currency code before conversion',

  // Location Information
  latitude: 'Geographic latitude where the transaction occurred',
  longitude: 'Geographic longitude where the transaction occurred',

  // Recurring Information
  isRecurring: 'Indicates if this is a recurring transaction',
  recurringFrequency: 'Frequency of recurrence (daily, weekly, monthly, etc.)',
  recurringDay: 'Day of recurrence within the period',
  estimatedNextDate: 'Estimated date of the next occurrence',
  recurringTransactionId: 'ID of the recurring transaction template',
  similarTransactions: 'Number of similar transactions found in the account',

  // Split Transaction
  isSplit: 'Indicates if this transaction is split into multiple parts',
  splitTotal: 'Total amount of the original transaction before splitting',
  splitCount: 'Number of split parts this transaction is divided into',
  parentTransactionId: 'ID of the parent transaction if this is a split',

  // Analytics and Insights
  confidenceScore: 'Confidence level in the categorization accuracy',
  anomalyScore: 'Anomaly detection score (higher = more unusual)',
  inflationCategory: 'Inflation sensitivity category for this transaction',

  // Status Flags
  isManual: 'Indicates if this transaction was manually entered',
  isModified: 'Indicates if this transaction has been modified after import',
  isVerified: 'Indicates if this transaction has been verified by the user',
  isFlagged: 'Indicates if this transaction has been flagged for attention',
  isHidden: 'Indicates if this transaction is hidden from regular views',
  isLocked: 'Indicates if this transaction is locked against changes',
  isReconciled: 'Indicates if this transaction has been reconciled',
  needsAttention: 'Indicates if this transaction needs user attention',
  reviewStatus: 'Current review status of this transaction',
  plannedExpense: 'Indicates if this was a planned expense',
  discretionary: 'Indicates if this is a discretionary spending transaction',
  internal: 'Indicates if this is an internal transfer transaction',
  notified: 'Indicates if a notification was sent for this transaction',

  // System Information
  bankAccountId: 'ID of the bank account this transaction belongs to',
  plaidTransactionId:
    'ID assigned by the Plaid service if imported through Plaid',
  createdAt: 'Date and time when this transaction record was created',
  updatedAt: 'Date and time when this transaction record was last updated',
  importedAt: 'Date and time when this transaction was imported',
  lastModifiedAt: 'Date and time when this transaction was last modified',
  lastReviewedAt: 'Date and time when this transaction was last reviewed',
  lastCategorizedAt: 'Date and time when this transaction was last categorized',

  // Other fields
  customFields: 'Custom fields added to this transaction',
  searchableText: 'Text fields compiled for transaction search functionality',
  original: 'Original data before any modifications',
  originalDescription:
    'Original transaction description before any modifications',
  originalCategory: 'Original transaction category before any modifications',
  originalMerchantName: 'Original merchant name before any modifications',
};
