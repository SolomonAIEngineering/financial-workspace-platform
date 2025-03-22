import type { ColumnType } from 'kysely'
export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>
export type Timestamp = ColumnType<Date, Date | string, Date | string>

export const BankConnectionStatus = {
  ACTIVE: 'ACTIVE',
  ERROR: 'ERROR',
  DISCONNECTED: 'DISCONNECTED',
  PENDING: 'PENDING',
  REQUIRES_ATTENTION: 'REQUIRES_ATTENTION',
  LOGIN_REQUIRED: 'LOGIN_REQUIRED',
  REQUIRES_REAUTH: 'REQUIRES_REAUTH',
} as const
export type BankConnectionStatus =
  (typeof BankConnectionStatus)[keyof typeof BankConnectionStatus]
export const SyncStatus = {
  IDLE: 'IDLE',
  SYNCING: 'SYNCING',
  FAILED: 'FAILED',
  SCHEDULED: 'SCHEDULED',
} as const
export type SyncStatus = (typeof SyncStatus)[keyof typeof SyncStatus]
export const AccountType = {
  DEPOSITORY: 'DEPOSITORY',
  CREDIT: 'CREDIT',
  LOAN: 'LOAN',
  INVESTMENT: 'INVESTMENT',
  MORTGAGE: 'MORTGAGE',
  BROKERAGE: 'BROKERAGE',
  OTHER: 'OTHER',
} as const
export type AccountType = (typeof AccountType)[keyof typeof AccountType]
export const AccountSubtype = {
  CHECKING: 'CHECKING',
  SAVINGS: 'SAVINGS',
  CD: 'CD',
  MONEY_MARKET: 'MONEY_MARKET',
  CREDIT_CARD: 'CREDIT_CARD',
  PAYPAL: 'PAYPAL',
  AUTO_LOAN: 'AUTO_LOAN',
  STUDENT_LOAN: 'STUDENT_LOAN',
  MORTGAGE: 'MORTGAGE',
  RETIREMENT: 'RETIREMENT',
  MUTUAL_FUND: 'MUTUAL_FUND',
  ETF: 'ETF',
  STOCK: 'STOCK',
  CASH_MANAGEMENT: 'CASH_MANAGEMENT',
  PREPAID: 'PREPAID',
  HEALTH_SAVINGS: 'HEALTH_SAVINGS',
  OTHER: 'OTHER',
} as const
export type AccountSubtype =
  (typeof AccountSubtype)[keyof typeof AccountSubtype]
export const AccountStatus = {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  FROZEN: 'FROZEN',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  DISCONNECTED: 'DISCONNECTED',
  SUSPENDED: 'SUSPENDED',
  ARCHIVED: 'ARCHIVED',
} as const
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus]
export const VerificationStatus = {
  NONE: 'NONE',
  PENDING_AUTOMATIC_VERIFICATION: 'PENDING_AUTOMATIC_VERIFICATION',
  PENDING_MANUAL_VERIFICATION: 'PENDING_MANUAL_VERIFICATION',
  MANUALLY_VERIFIED: 'MANUALLY_VERIFIED',
  AUTOMATICALLY_VERIFIED: 'AUTOMATICALLY_VERIFIED',
  VERIFICATION_FAILED: 'VERIFICATION_FAILED',
} as const
export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus]
export const AccountCapabilities = {
  BALANCE: 'BALANCE',
  OWNERSHIP: 'OWNERSHIP',
  PAYMENT: 'PAYMENT',
  TRANSACTIONS: 'TRANSACTIONS',
  STATEMENTS: 'STATEMENTS',
  IDENTITY: 'IDENTITY',
  AUTH: 'AUTH',
} as const
export type AccountCapabilities =
  (typeof AccountCapabilities)[keyof typeof AccountCapabilities]
export const TransactionCategory = {
  INCOME: 'INCOME',
  TRANSFER: 'TRANSFER',
  LOAN_PAYMENTS: 'LOAN_PAYMENTS',
  BANK_FEES: 'BANK_FEES',
  ENTERTAINMENT: 'ENTERTAINMENT',
  FOOD_AND_DRINK: 'FOOD_AND_DRINK',
  GENERAL_MERCHANDISE: 'GENERAL_MERCHANDISE',
  HOME_IMPROVEMENT: 'HOME_IMPROVEMENT',
  MEDICAL: 'MEDICAL',
  PERSONAL_CARE: 'PERSONAL_CARE',
  GENERAL_SERVICES: 'GENERAL_SERVICES',
  GOVERNMENT_AND_NON_PROFIT: 'GOVERNMENT_AND_NON_PROFIT',
  TRANSPORTATION: 'TRANSPORTATION',
  TRAVEL: 'TRAVEL',
  UTILITIES: 'UTILITIES',
  OTHER: 'OTHER',
} as const
export type TransactionCategory =
  (typeof TransactionCategory)[keyof typeof TransactionCategory]
export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPERADMIN: 'SUPERADMIN',
  MANAGER: 'MANAGER',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
  GUEST: 'GUEST',
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]
export const TextStyle = {
  DEFAULT: 'DEFAULT',
  SERIF: 'SERIF',
  MONO: 'MONO',
} as const
export type TextStyle = (typeof TextStyle)[keyof typeof TextStyle]
export const SpendingTimeframe = {
  DAY: 'DAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  QUARTER: 'QUARTER',
  YEAR: 'YEAR',
  CUSTOM: 'CUSTOM',
} as const
export type SpendingTimeframe =
  (typeof SpendingTimeframe)[keyof typeof SpendingTimeframe]
export const TeamRole = {
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
} as const
export type TeamRole = (typeof TeamRole)[keyof typeof TeamRole]
export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELED: 'CANCELED',
} as const
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus]
export const InvoiceDeliveryType = {
  CREATE: 'CREATE',
  CREATE_AND_SEND: 'CREATE_AND_SEND',
} as const
export type InvoiceDeliveryType =
  (typeof InvoiceDeliveryType)[keyof typeof InvoiceDeliveryType]
export const InvoiceSize = {
  A4: 'A4',
  LETTER: 'LETTER',
} as const
export type InvoiceSize = (typeof InvoiceSize)[keyof typeof InvoiceSize]
export const TrackerStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const
export type TrackerStatus = (typeof TrackerStatus)[keyof typeof TrackerStatus]
export const InboxType = {
  INVOICE: 'INVOICE',
  EXPENSE: 'EXPENSE',
} as const
export type InboxType = (typeof InboxType)[keyof typeof InboxType]
export const InboxStatus = {
  NEW: 'NEW',
  PROCESSING: 'PROCESSING',
  PENDING: 'PENDING',
  ARCHIVED: 'ARCHIVED',
  DELETED: 'DELETED',
} as const
export type InboxStatus = (typeof InboxStatus)[keyof typeof InboxStatus]
export const ReportType = {
  PROFIT: 'PROFIT',
  REVENUE: 'REVENUE',
  BURN_RATE: 'BURN_RATE',
  EXPENSE: 'EXPENSE',
} as const
export type ReportType = (typeof ReportType)[keyof typeof ReportType]
export const TransactionFrequency = {
  WEEKLY: 'WEEKLY',
  BIWEEKLY: 'BIWEEKLY',
  MONTHLY: 'MONTHLY',
  SEMI_MONTHLY: 'SEMI_MONTHLY',
  ANNUALLY: 'ANNUALLY',
  IRREGULAR: 'IRREGULAR',
  UNKNOWN: 'UNKNOWN',
} as const
export type TransactionFrequency =
  (typeof TransactionFrequency)[keyof typeof TransactionFrequency]
export type App = {
  id: string
  app_id: string
  config: unknown | null
  settings: unknown | null
  team_id: string | null
  created_by: string | null
  created_at: Generated<Timestamp | null>
}
export type Attachment = {
  id: string
  transactionId: string
  name: string
  fileUrl: string
  fileType: string
  fileSize: number
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
}
export type BankAccount = {
  id: string
  userId: string
  bankConnectionId: string
  plaidAccountId: string
  name: string
  officialName: string | null
  type: AccountType
  subtype: AccountSubtype | null
  verificationStatus: Generated<VerificationStatus>
  mask: string | null
  displayName: string | null
  accountNumber: string | null
  routingNumber: string | null
  iban: string | null
  swift: string | null
  availableBalance: number | null
  currentBalance: number | null
  limit: number | null
  isoCurrencyCode: string | null
  balanceLastUpdated: Timestamp | null
  capabilities: AccountCapabilities[]
  permissionsGranted: Generated<string[]>
  status: Generated<AccountStatus>
  isHidden: Generated<boolean>
  isPrimary: Generated<boolean>
  isFavorite: Generated<boolean>
  enabled: Generated<boolean>
  monthlySpending: number | null
  monthlyIncome: number | null
  averageBalance: number | null
  tags: Generated<string[]>
  budgetCategory: string | null
  lastSyncedAt: Timestamp | null
  errorCount: Generated<number>
  errorMessage: string | null
  lastUpdated: Generated<Timestamp>
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  deletedAt: Timestamp | null
  balanceProjections: unknown | null
  scheduledInflows: Generated<number | null>
  scheduledOutflows: Generated<number | null>
  recurringMonthlyInflow: Generated<number | null>
  recurringMonthlyOutflow: Generated<number | null>
  nextScheduledTransaction: Timestamp | null
  errorDetails: string | null
  errorRetries: number | null
  balance: number | null
}
export type BankAccountToTeam = {
  A: string
  B: string
}
export type BankConnection = {
  id: string
  userId: string
  institutionId: string
  institutionName: string
  accessToken: string
  itemId: string
  status: Generated<BankConnectionStatus>
  errorCode: string | null
  errorMessage: string | null
  lastStatusChangedAt: Timestamp | null
  logo: string | null
  primaryColor: string | null
  oauthSupported: Generated<boolean>
  mfaSupported: Generated<boolean>
  lastSyncedAt: Timestamp | null
  nextSyncScheduledAt: Timestamp | null
  syncStatus: Generated<SyncStatus>
  balanceLastUpdated: Timestamp | null
  lastNotifiedAt: Timestamp | null
  notificationCount: Generated<number>
  webhookUrl: string | null
  consentExpiresAt: Timestamp | null
  disabled: Generated<boolean>
  lastUpdated: Generated<Timestamp>
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  deletedAt: Timestamp | null
  lastAlertedAt: Timestamp | null
  alertCount: Generated<number>
  lastCheckedAt: Timestamp | null
  lastAccessedAt: Timestamp | null
  lastExpiryNotifiedAt: Timestamp | null
  expiryNotificationCount: Generated<number>
  expiresAt: Timestamp | null
  provider: string
}
export type BankConnectionToTeam = {
  A: string
  B: string
}
export type Comment = {
  id: string
  userId: string
  discussionId: string
  content: string
  contentRich: unknown | null
  isEdited: Generated<boolean>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}
export type Customer = {
  id: string
  name: string
  email: string
  token: string
  phone: string | null
  contact: string | null
  website: string | null
  note: string | null
  vat_number: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  country_code: string | null
  team_id: string
  created_at: Generated<Timestamp>
}
export type CustomerTag = {
  id: string
  customer_id: string
  tag_id: string
  team_id: string
  created_at: Generated<Timestamp>
}
export type CustomTransactionCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  vat: number | null
  system: boolean | null
  embedding: string | null
  team_id: string
  created_at: Generated<Timestamp | null>
}
export type Discussion = {
  id: string
  documentId: string
  userId: string
  documentContent: string
  documentContentRich: unknown | null
  isResolved: Generated<boolean>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}
export type Document = {
  id: string
  templateId: string | null
  userId: string
  parentDocumentId: string | null
  title: string | null
  content: string | null
  contentRich: unknown | null
  coverImage: string | null
  icon: string | null
  isPublished: Generated<boolean>
  isArchived: Generated<boolean>
  pinned: Generated<boolean>
  tags: Generated<string[]>
  isTemplate: Generated<boolean>
  status: Generated<string>
  textStyle: Generated<TextStyle>
  smallText: Generated<boolean>
  fullWidth: Generated<boolean>
  lockPage: Generated<boolean>
  toc: Generated<boolean>
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
}
export type DocumentVersion = {
  id: string
  documentId: string
  userId: string
  title: string | null
  contentRich: unknown | null
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
}
export type ExchangeRate = {
  id: string
  base: string | null
  target: string | null
  rate: number | null
  updated_at: Timestamp | null
}
export type File = {
  id: string
  userId: string
  documentId: string | null
  size: number
  url: string
  appUrl: string
  type: string
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}
export type Inbox = {
  id: string
  type: InboxType | null
  status: Generated<InboxStatus | null>
  display_name: string | null
  description: string | null
  date: Timestamp | null
  amount: number | null
  currency: string | null
  base_amount: number | null
  base_currency: string | null
  website: string | null
  file_name: string | null
  content_type: string | null
  size: number | null
  file_path: Generated<string[]>
  attachment_id: string | null
  transaction_id: string | null
  reference_id: string | null
  forwarded_to: string | null
  meta: unknown | null
  team_id: string | null
  created_at: Generated<Timestamp>
}
export type Invoice = {
  id: string
  team_id: string
  title: string | null
  status: Generated<InvoiceStatus>
  customer_id: string | null
  customer_name: string | null
  invoice_number: string | null
  amount: number | null
  subtotal: number | null
  tax: number | null
  vat: number | null
  discount: number | null
  currency: string | null
  issue_date: Timestamp | null
  due_date: Timestamp | null
  paid_at: Timestamp | null
  viewed_at: Timestamp | null
  reminder_sent_at: Timestamp | null
  from_details: unknown | null
  customer_details: unknown | null
  payment_details: unknown | null
  note: string | null
  internal_note: string | null
  note_details: unknown | null
  top_block: unknown | null
  bottom_block: unknown | null
  template: unknown | null
  url: string | null
  token: string
  file_size: number | null
  file_path: Generated<string[]>
  sent_to: string | null
  user_id: string | null
  created_at: Generated<Timestamp>
  updated_at: Timestamp | null
}
export type InvoiceLineItem = {
  id: string
  invoice_id: string
  name: string
  quantity: number
  price: number
  unit: string | null
}
export type InvoiceTemplate = {
  id: string
  team_id: string
  title: string | null
  delivery_type: Generated<InvoiceDeliveryType>
  size: InvoiceSize | null
  logo_url: string | null
  currency: string | null
  from_label: string | null
  from_details: unknown | null
  customer_label: string | null
  invoice_no_label: string | null
  issue_date_label: string | null
  due_date_label: string | null
  description_label: string | null
  quantity_label: string | null
  price_label: string | null
  tax_label: string | null
  discount_label: string | null
  vat_label: string | null
  total_label: string | null
  total_summary_label: string | null
  note_label: string | null
  payment_label: string | null
  payment_details: unknown | null
  tax_rate: number | null
  vat_rate: number | null
  date_format: string | null
  include_decimals: boolean | null
  include_discount: boolean | null
  include_tax: boolean | null
  include_vat: boolean | null
  include_units: boolean | null
  include_qr: boolean | null
  created_at: Generated<Timestamp>
}
export type InvoiceToInvoiceLineItem = {
  A: string
  B: string
}
export type Notification = {
  id: string
  userId: string
  type: string
  title: string
  body: string
  read: Generated<boolean>
  metadata: unknown | null
  createdAt: Generated<Timestamp>
}
export type OauthAccount = {
  id: string
  providerId: string
  providerUserId: string
  userId: string
}
export type RecurringTransaction = {
  id: string
  bankAccountId: string
  title: string
  description: string | null
  amount: number
  currency: string
  initialAccountBalance: number | null
  frequency: TransactionFrequency
  interval: Generated<number>
  startDate: Timestamp
  endDate: Timestamp | null
  dayOfMonth: number | null
  dayOfWeek: number | null
  weekOfMonth: number | null
  monthOfYear: number | null
  executionDays: number[]
  skipWeekends: Generated<boolean>
  adjustForHolidays: Generated<boolean>
  allowExecution: Generated<boolean>
  limitExecutions: number | null
  transactionTemplate: unknown | null
  categorySlug: string | null
  tags: Generated<string[]>
  notes: string | null
  customFields: unknown | null
  targetAccountId: string | null
  affectAvailableBalance: Generated<boolean>
  lastExecutedAt: Timestamp | null
  nextScheduledDate: Timestamp | null
  executionCount: Generated<number>
  totalExecuted: Generated<number>
  lastExecutionStatus: string | null
  lastExecutionError: string | null
  minBalanceRequired: number | null
  overspendAction: Generated<string | null>
  insufficientFundsCount: Generated<number>
  expectedAmount: number | null
  allowedVariance: number | null
  varianceAction: string | null
  reminderDays: Generated<number[]>
  reminderSentAt: Timestamp | null
  notifyOnExecution: Generated<boolean>
  notifyOnFailure: Generated<boolean>
  status: Generated<string>
  isAutomated: Generated<boolean>
  requiresApproval: Generated<boolean>
  isVariable: Generated<boolean>
  source: string | null
  confidenceScore: number | null
  merchantId: string | null
  merchantName: string | null
  transactionType: string | null
  importanceLevel: string | null
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  lastModifiedBy: string | null
}
export type Report = {
  id: string
  type: ReportType | null
  from: Timestamp | null
  to: Timestamp | null
  currency: string | null
  link_id: string | null
  short_link: string | null
  expire_at: Timestamp | null
  created_by: string | null
  team_id: string | null
  created_at: Generated<Timestamp>
}
export type Session = {
  id: string
  user_id: string
  expires_at: Timestamp
  ip_address: string | null
  user_agent: string | null
}
export type SpendingInsight = {
  id: string
  userId: string
  startDate: Timestamp
  endDate: Timestamp
  timeframe: Generated<SpendingTimeframe>
  year: number
  month: number | null
  quarter: number | null
  week: number | null
  totalTransactions: number
  totalSpending: number
  avgTransactionSize: number
  categoryStats: unknown
  merchantStats: unknown | null
  spendingTrend: number | null
  incomeTotal: number | null
  incomeTrend: number | null
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
}
export type Tag = {
  id: string
  name: string
  team_id: string
  created_at: Generated<Timestamp>
}
export type Team = {
  id: string
  name: string | null
  slug: string
  base_currency: string | null
  email: string | null
  logo_url: string | null
  inbox_email: string | null
  inbox_id: string | null
  inbox_forwarding: boolean | null
  document_classification: boolean | null
  flags: Generated<string[]>
  created_at: Generated<Timestamp>
}
export type TrackerEntry = {
  id: string
  project_id: string | null
  assigned_id: string | null
  description: string | null
  date: Timestamp | null
  start: Timestamp | null
  stop: Timestamp | null
  duration: number | null
  rate: number | null
  currency: string | null
  billed: boolean | null
  team_id: string | null
  created_at: Generated<Timestamp>
}
export type TrackerProject = {
  id: string
  name: string
  description: string | null
  status: Generated<TrackerStatus>
  customer_id: string | null
  billable: boolean | null
  currency: string | null
  rate: number | null
  estimate: number | null
  team_id: string | null
  created_at: Generated<Timestamp>
}
export type TrackerProjectTag = {
  id: string
  tracker_project_id: string
  tag_id: string
  team_id: string
  created_at: Generated<Timestamp>
}
export type TrackerReport = {
  id: string
  project_id: string | null
  created_by: string | null
  link_id: string | null
  short_link: string | null
  team_id: string | null
  created_at: Generated<Timestamp>
}
export type Transaction = {
  id: string
  userId: string
  bankAccountId: string
  teamId: string | null
  plaidTransactionId: string | null
  amount: number
  isoCurrencyCode: string | null
  date: Timestamp
  name: string
  merchantName: string | null
  description: string | null
  pending: Generated<boolean>
  category: TransactionCategory | null
  subCategory: string | null
  categoryIconUrl: string | null
  customCategory: string | null
  merchantId: string | null
  merchantLogoUrl: string | null
  merchantCategory: string | null
  merchantWebsite: string | null
  merchantPhone: string | null
  merchantAddress: string | null
  merchantCity: string | null
  merchantState: string | null
  merchantZip: string | null
  merchantCountry: string | null
  assigneeId: string | null
  assignedAt: Timestamp | null
  assignedById: string | null
  location: unknown | null
  latitude: number | null
  longitude: number | null
  paymentChannel: string | null
  paymentMethod: string | null
  paymentProcessor: string | null
  paymentGateway: string | null
  transactionReference: string | null
  authorizationCode: string | null
  checkNumber: string | null
  wireReference: string | null
  accountNumber: string | null
  cardType: string | null
  cardNetwork: string | null
  cardLastFour: string | null
  originalDescription: string | null
  originalCategory: string | null
  originalMerchantName: string | null
  fiscalYear: number | null
  fiscalMonth: number | null
  fiscalQuarter: number | null
  vatAmount: number | null
  vatRate: number | null
  taxAmount: number | null
  taxRate: number | null
  taxDeductible: Generated<boolean>
  taxExempt: Generated<boolean>
  taxCategory: string | null
  status: string | null
  transactionType: string | null
  transactionMethod: string | null
  transactionChannel: string | null
  budgetCategory: string | null
  budgetSubcategory: string | null
  budgetId: string | null
  plannedExpense: Generated<boolean>
  discretionary: Generated<boolean>
  needsWantsCategory: string | null
  spendingGoalId: string | null
  investmentCategory: string | null
  businessPurpose: string | null
  costCenter: string | null
  projectCode: string | null
  reimbursable: Generated<boolean>
  clientId: string | null
  invoiceId: string | null
  excludeFromBudget: Generated<boolean>
  isRecurring: Generated<boolean>
  recurrenceId: string | null
  recurringFrequency: string | null
  recurringDay: number | null
  estimatedNextDate: Timestamp | null
  similarTransactions: number | null
  cashFlowCategory: string | null
  cashFlowType: string | null
  inflationCategory: string | null
  confidenceScore: number | null
  anomalyScore: number | null
  insightTags: Generated<string[]>
  isManual: Generated<boolean>
  isModified: Generated<boolean>
  isVerified: Generated<boolean>
  isFlagged: Generated<boolean>
  isHidden: Generated<boolean>
  isLocked: Generated<boolean>
  isReconciled: Generated<boolean>
  needsAttention: Generated<boolean>
  reviewStatus: string | null
  userNotes: string | null
  tags: Generated<string[]>
  notes: string | null
  customFields: unknown | null
  labels: Generated<string[]>
  parentTransactionId: string | null
  isSplit: Generated<boolean>
  splitTotal: number | null
  splitCount: number | null
  searchableText: string | null
  dateYear: number | null
  dateMonth: number | null
  dateDay: number | null
  dateDayOfWeek: number | null
  dateWeekOfYear: number | null
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  importedAt: Timestamp | null
  lastReviewedAt: Timestamp | null
  lastModifiedAt: Timestamp | null
  lastCategorizedAt: Timestamp | null
  category_slug: string | null
  frequency: TransactionFrequency | null
  internal: boolean | null
  notified: boolean | null
  base_amount: number | null
  base_currency: string | null
  recurringTransactionId: string | null
}
export type TransactionAttachment = {
  id: string
  transaction_id: string | null
  name: string | null
  type: string | null
  size: number | null
  path: Generated<string[]>
  team_id: string | null
  created_at: Generated<Timestamp>
}
export type TransactionEnrichment = {
  id: string
  name: string | null
  category_slug: string | null
  team_id: string | null
  system: boolean | null
  created_at: Generated<Timestamp>
}
export type TransactionTag = {
  id: string
  transaction_id: string
  tag_id: string
  team_id: string
  created_at: Generated<Timestamp>
}
export type User = {
  id: string
  username: string
  password_hash: string | null
  email: string | null
  role: Generated<UserRole>
  name: string | null
  firstName: string | null
  lastName: string | null
  profileImageUrl: string | null
  bio: string | null
  timezone: string | null
  language: Generated<string | null>
  jobTitle: string | null
  department: string | null
  employeeId: string | null
  hireDate: Timestamp | null
  yearsOfExperience: number | null
  skills: Generated<string[]>
  phoneNumber: string | null
  businessEmail: string | null
  businessPhone: string | null
  officeLocation: string | null
  organizationName: string | null
  organizationUnit: string | null
  managerUserId: string | null
  teamName: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
  notificationPreferences: unknown | null
  displayPreferences: unknown | null
  documentPreferences: unknown | null
  notificationsEnabled: Generated<boolean>
  lastTransactionNotificationAt: Timestamp | null
  linkedinProfile: string | null
  twitterProfile: string | null
  githubProfile: string | null
  version: Generated<number>
  stripeCustomerId: string | null
  accountStatus: Generated<AccountStatus>
  lastLoginAt: Timestamp | null
  uploadLimit: Generated<number>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  deletedAt: Timestamp | null
  teamId: string | null
}
export type UserActivity = {
  id: string
  userId: string
  type: string
  detail: string
  metadata: unknown | null
  createdAt: Generated<Timestamp>
}
export type UserInvite = {
  id: string
  email: string | null
  code: string | null
  team_id: string | null
  invited_by: string | null
  role: TeamRole | null
  created_at: Generated<Timestamp>
}
export type UsersOnTeam = {
  id: string
  user_id: string
  team_id: string
  role: Generated<TeamRole>
  created_at: Generated<Timestamp | null>
}
export type DB = {
  _BankAccountToTeam: BankAccountToTeam
  _BankConnectionToTeam: BankConnectionToTeam
  _InvoiceToInvoiceLineItem: InvoiceToInvoiceLineItem
  apps: App
  Attachment: Attachment
  BankAccount: BankAccount
  BankConnection: BankConnection
  Comment: Comment
  customer_tags: CustomerTag
  customers: Customer
  Discussion: Discussion
  Document: Document
  DocumentVersion: DocumentVersion
  exchange_rates: ExchangeRate
  File: File
  inbox: Inbox
  invoice_line_items: InvoiceLineItem
  invoice_templates: InvoiceTemplate
  invoices: Invoice
  Notification: Notification
  OauthAccount: OauthAccount
  recurring_transactions: RecurringTransaction
  reports: Report
  Session: Session
  SpendingInsight: SpendingInsight
  tags: Tag
  teams: Team
  tracker_entries: TrackerEntry
  tracker_project_tags: TrackerProjectTag
  tracker_projects: TrackerProject
  tracker_reports: TrackerReport
  transaction_attachments: TransactionAttachment
  transaction_categories: CustomTransactionCategory
  transaction_enrichments: TransactionEnrichment
  transaction_tags: TransactionTag
  transactions: Transaction
  User: User
  user_invites: UserInvite
  UserActivity: UserActivity
  users_on_team: UsersOnTeam
}
