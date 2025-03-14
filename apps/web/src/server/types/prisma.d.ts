export interface Session {
  id: string;
  user_id: string;
  expires_at: Date;
  ip_address: string| null;
  user_agent: string| null;
}

export interface OauthAccount {
  id: string;
  providerId: string;
  providerUserId: string;
  userId: string;
}

export interface User {
  id: string;
  username: string;
  password_hash: string| null;
  email: string| null;
  role: UserRole;
  name: string| null;
  firstName: string| null;
  lastName: string| null;
  profileImageUrl: string| null;
  bio: string| null;
  timezone: string| null;
  language: string| null;
  jobTitle: string| null;
  department: string| null;
  employeeId: string| null;
  hireDate: Date| null;
  yearsOfExperience: number| null;
  skills: string[];
  phoneNumber: string| null;
  businessEmail: string| null;
  businessPhone: string| null;
  officeLocation: string| null;
  organizationName: string| null;
  organizationUnit: string| null;
  managerUserId: string| null;
  teamName: string| null;
  addressLine1: string| null;
  addressLine2: string| null;
  city: string| null;
  state: string| null;
  postalCode: string| null;
  country: string| null;
  notificationPreferences: Record<string, unknown>| null;
  displayPreferences: Record<string, unknown>| null;
  documentPreferences: Record<string, unknown>| null;
  notificationsEnabled: boolean;
  lastTransactionNotificationAt: Date| null;
  linkedinProfile: string| null;
  twitterProfile: string| null;
  githubProfile: string| null;
  version: number;
  stripeCustomerId: string| null;
  accountStatus: AccountStatus;
  lastLoginAt: Date| null;
  uploadLimit: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date| null;
  teamId: string| null;
}

export interface Document {
  id: string;
  templateId: string| null;
  userId: string;
  parentDocumentId: string| null;
  title: string| null;
  content: string| null;
  contentRich: Record<string, unknown>| null;
  coverImage: string| null;
  icon: string| null;
  isPublished: boolean;
  isArchived: boolean;
  pinned: boolean;
  tags: string[];
  isTemplate: boolean;
  status: string;
  textStyle: TextStyle;
  smallText: boolean;
  fullWidth: boolean;
  lockPage: boolean;
  toc: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  userId: string;
  title: string| null;
  contentRich: Record<string, unknown>| null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Discussion {
  id: string;
  documentId: string;
  userId: string;
  documentContent: string;
  documentContentRich: Record<string, unknown>| null;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  discussionId: string;
  content: string;
  contentRich: Record<string, unknown>| null;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface File {
  id: string;
  userId: string;
  documentId: string| null;
  size: number;
  url: string;
  appUrl: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankConnection {
  id: string;
  userId: string;
  institutionId: string;
  institutionName: string;
  accessToken: string;
  itemId: string;
  status: BankConnectionStatus;
  errorCode: string| null;
  errorMessage: string| null;
  lastStatusChangedAt: Date| null;
  logo: string| null;
  primaryColor: string| null;
  oauthSupported: boolean;
  mfaSupported: boolean;
  lastSyncedAt: Date| null;
  nextSyncScheduledAt: Date| null;
  syncStatus: SyncStatus;
  balanceLastUpdated: Date| null;
  lastNotifiedAt: Date| null;
  notificationCount: number;
  webhookUrl: string| null;
  consentExpiresAt: Date| null;
  disabled: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date| null;
  lastAlertedAt: Date| null;
  alertCount: number;
  lastCheckedAt: Date| null;
  lastAccessedAt: Date| null;
  lastExpiryNotifiedAt: Date| null;
  expiryNotificationCount: number;
  expiresAt: Date| null;
  provider: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  bankConnectionId: string;
  plaidAccountId: string;
  name: string;
  officialName: string| null;
  type: AccountType;
  subtype: AccountSubtype| null;
  verificationStatus: VerificationStatus;
  mask: string| null;
  displayName: string| null;
  accountNumber: string| null;
  routingNumber: string| null;
  iban: string| null;
  swift: string| null;
  availableBalance: number| null;
  currentBalance: number| null;
  limit: number| null;
  isoCurrencyCode: string| null;
  balanceLastUpdated: Date| null;
  capabilities: AccountCapabilities[];
  permissionsGranted: string[];
  status: AccountStatus;
  isHidden: boolean;
  isPrimary: boolean;
  isFavorite: boolean;
  enabled: boolean;
  monthlySpending: number| null;
  monthlyIncome: number| null;
  averageBalance: number| null;
  tags: string[];
  budgetCategory: string| null;
  lastSyncedAt: Date| null;
  errorCount: number;
  errorMessage: string| null;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date| null;
  balanceProjections: Record<string, unknown>| null;
  scheduledInflows: number| null;
  scheduledOutflows: number| null;
  recurringMonthlyInflow: number| null;
  recurringMonthlyOutflow: number| null;
  nextScheduledTransaction: Date| null;
  errorDetails: string| null;
  errorRetries: number| null;
  balance: number| null;
}

export interface Transaction {
  id: string;
  userId: string;
  bankAccountId: string;
  plaidTransactionId: string| null;
  amount: number;
  isoCurrencyCode: string| null;
  date: Date;
  name: string;
  merchantName: string| null;
  description: string| null;
  pending: boolean;
  category: TransactionCategory| null;
  subCategory: string| null;
  categoryIconUrl: string| null;
  customCategory: string| null;
  merchantId: string| null;
  merchantLogoUrl: string| null;
  merchantCategory: string| null;
  merchantWebsite: string| null;
  merchantPhone: string| null;
  merchantAddress: string| null;
  merchantCity: string| null;
  merchantState: string| null;
  merchantZip: string| null;
  merchantCountry: string| null;
  location: Record<string, unknown>| null;
  latitude: number| null;
  longitude: number| null;
  paymentChannel: string| null;
  paymentMethod: string| null;
  paymentProcessor: string| null;
  paymentGateway: string| null;
  transactionReference: string| null;
  authorizationCode: string| null;
  checkNumber: string| null;
  wireReference: string| null;
  accountNumber: string| null;
  cardType: string| null;
  cardNetwork: string| null;
  cardLastFour: string| null;
  originalDescription: string| null;
  originalCategory: string| null;
  originalMerchantName: string| null;
  fiscalYear: number| null;
  fiscalMonth: number| null;
  fiscalQuarter: number| null;
  vatAmount: number| null;
  vatRate: number| null;
  taxAmount: number| null;
  taxRate: number| null;
  taxDeductible: boolean;
  taxExempt: boolean;
  taxCategory: string| null;
  status: string| null;
  transactionType: string| null;
  transactionMethod: string| null;
  transactionChannel: string| null;
  budgetCategory: string| null;
  budgetSubcategory: string| null;
  budgetId: string| null;
  plannedExpense: boolean;
  discretionary: boolean;
  needsWantsCategory: string| null;
  spendingGoalId: string| null;
  investmentCategory: string| null;
  businessPurpose: string| null;
  costCenter: string| null;
  projectCode: string| null;
  reimbursable: boolean;
  clientId: string| null;
  invoiceId: string| null;
  excludeFromBudget: boolean;
  isRecurring: boolean;
  recurrenceId: string| null;
  recurringFrequency: string| null;
  recurringDay: number| null;
  estimatedNextDate: Date| null;
  similarTransactions: number| null;
  cashFlowCategory: string| null;
  cashFlowType: string| null;
  inflationCategory: string| null;
  confidenceScore: number| null;
  anomalyScore: number| null;
  insightTags: string[];
  isManual: boolean;
  isModified: boolean;
  isVerified: boolean;
  isFlagged: boolean;
  isHidden: boolean;
  isLocked: boolean;
  isReconciled: boolean;
  needsAttention: boolean;
  reviewStatus: string| null;
  userNotes: string| null;
  tags: string[];
  notes: string| null;
  customFields: Record<string, unknown>| null;
  labels: string[];
  parentTransactionId: string| null;
  isSplit: boolean;
  splitTotal: number| null;
  splitCount: number| null;
  searchableText: string| null;
  dateYear: number| null;
  dateMonth: number| null;
  dateDay: number| null;
  dateDayOfWeek: number| null;
  dateWeekOfYear: number| null;
  createdAt: Date;
  updatedAt: Date;
  importedAt: Date| null;
  lastReviewedAt: Date| null;
  lastModifiedAt: Date| null;
  lastCategorizedAt: Date| null;
  categorySlug: string| null;
  frequency: TransactionFrequency| null;
  internal: boolean| null;
  notified: boolean| null;
  baseAmount: number| null;
  baseCurrency: string| null;
  recurringTransactionId: string| null;
}

export interface RecurringTransaction {
  id: string;
  bankAccountId: string;
  title: string;
  description: string| null;
  amount: number;
  currency: string;
  initialAccountBalance: number| null;
  frequency: TransactionFrequency;
  interval: number;
  startDate: Date;
  endDate: Date| null;
  dayOfMonth: number| null;
  dayOfWeek: number| null;
  weekOfMonth: number| null;
  monthOfYear: number| null;
  executionDays: number[];
  skipWeekends: boolean;
  adjustForHolidays: boolean;
  allowExecution: boolean;
  limitExecutions: number| null;
  transactionTemplate: Record<string, unknown>| null;
  categorySlug: string| null;
  tags: string[];
  notes: string| null;
  customFields: Record<string, unknown>| null;
  targetAccountId: string| null;
  affectAvailableBalance: boolean;
  lastExecutedAt: Date| null;
  nextScheduledDate: Date| null;
  executionCount: number;
  totalExecuted: number;
  lastExecutionStatus: string| null;
  lastExecutionError: string| null;
  minBalanceRequired: number| null;
  overspendAction: string| null;
  insufficientFundsCount: number;
  expectedAmount: number| null;
  allowedVariance: number| null;
  varianceAction: string| null;
  reminderDays: number[];
  reminderSentAt: Date| null;
  notifyOnExecution: boolean;
  notifyOnFailure: boolean;
  status: string;
  isAutomated: boolean;
  requiresApproval: boolean;
  isVariable: boolean;
  source: string| null;
  confidenceScore: number| null;
  merchantId: string| null;
  merchantName: string| null;
  transactionType: string| null;
  importanceLevel: string| null;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string| null;
}

export interface Attachment {
  id: string;
  transactionId: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: string;
  detail: string;
  metadata: Record<string, unknown>| null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  metadata: Record<string, unknown>| null;
  createdAt: Date;
}

export interface SpendingInsight {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  timeframe: SpendingTimeframe;
  year: number;
  month: number| null;
  quarter: number| null;
  week: number| null;
  totalTransactions: number;
  totalSpending: number;
  avgTransactionSize: number;
  categoryStats: Record<string, unknown>;
  merchantStats: Record<string, unknown>| null;
  spendingTrend: number| null;
  incomeTotal: number| null;
  incomeTrend: number| null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string| null;
  baseCurrency: string| null;
  email: string| null;
  logoUrl: string| null;
  inboxEmail: string| null;
  inboxId: string| null;
  inboxForwarding: boolean| null;
  documentClassification: boolean| null;
  flags: string[];
  createdAt: Date;
}

export interface UsersOnTeam {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  createdAt: Date| null;
}

export interface UserInvite {
  id: string;
  email: string| null;
  code: string| null;
  teamId: string| null;
  invitedBy: string| null;
  role: TeamRole| null;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  token: string;
  phone: string| null;
  contact: string| null;
  website: string| null;
  note: string| null;
  vatNumber: string| null;
  addressLine1: string| null;
  addressLine2: string| null;
  city: string| null;
  state: string| null;
  zip: string| null;
  country: string| null;
  countryCode: string| null;
  teamId: string;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  teamId: string;
  createdAt: Date;
}

export interface CustomerTag {
  id: string;
  customerId: string;
  tagId: string;
  teamId: string;
  createdAt: Date;
}

export interface TransactionTag {
  id: string;
  transactionId: string;
  tagId: string;
  teamId: string;
  createdAt: Date;
}

export interface CustomTransactionCategory {
  id: string;
  name: string;
  slug: string;
  description: string| null;
  color: string| null;
  vat: number| null;
  system: boolean| null;
  embedding: string| null;
  teamId: string;
  createdAt: Date| null;
}

export interface TransactionEnrichment {
  id: string;
  name: string| null;
  categorySlug: string| null;
  teamId: string| null;
  system: boolean| null;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  teamId: string;
  status: InvoiceStatus;
  customerId: string| null;
  customerName: string| null;
  invoiceNumber: string| null;
  amount: number| null;
  subtotal: number| null;
  tax: number| null;
  vat: number| null;
  discount: number| null;
  currency: string| null;
  issueDate: Date| null;
  dueDate: Date| null;
  paidAt: Date| null;
  viewedAt: Date| null;
  reminderSentAt: Date| null;
  lineItems: Record<string, unknown>| null;
  fromDetails: Record<string, unknown>| null;
  customerDetails: Record<string, unknown>| null;
  paymentDetails: Record<string, unknown>| null;
  note: string| null;
  internalNote: string| null;
  noteDetails: Record<string, unknown>| null;
  topBlock: Record<string, unknown>| null;
  bottomBlock: Record<string, unknown>| null;
  template: Record<string, unknown>| null;
  url: string| null;
  token: string;
  fileSize: number| null;
  filePath: string[];
  sentTo: string| null;
  userId: string| null;
  createdAt: Date;
  updatedAt: Date| null;
}

export interface InvoiceTemplate {
  id: string;
  teamId: string;
  title: string| null;
  deliveryType: InvoiceDeliveryType;
  size: InvoiceSize| null;
  logoUrl: string| null;
  currency: string| null;
  fromLabel: string| null;
  fromDetails: Record<string, unknown>| null;
  customerLabel: string| null;
  invoiceNoLabel: string| null;
  issueDateLabel: string| null;
  dueDateLabel: string| null;
  descriptionLabel: string| null;
  quantityLabel: string| null;
  priceLabel: string| null;
  taxLabel: string| null;
  discountLabel: string| null;
  vatLabel: string| null;
  totalLabel: string| null;
  totalSummaryLabel: string| null;
  noteLabel: string| null;
  paymentLabel: string| null;
  paymentDetails: Record<string, unknown>| null;
  taxRate: number| null;
  vatRate: number| null;
  dateFormat: string| null;
  includeDecimals: boolean| null;
  includeDiscount: boolean| null;
  includeTax: boolean| null;
  includeVat: boolean| null;
  includeUnits: boolean| null;
  includeQr: boolean| null;
  createdAt: Date;
}

export interface TrackerProject {
  id: string;
  name: string;
  description: string| null;
  status: TrackerStatus;
  customerId: string| null;
  billable: boolean| null;
  currency: string| null;
  rate: number| null;
  estimate: number| null;
  teamId: string| null;
  createdAt: Date;
}

export interface TrackerProjectTag {
  id: string;
  trackerProjectId: string;
  tagId: string;
  teamId: string;
  createdAt: Date;
}

export interface TrackerEntry {
  id: string;
  projectId: string| null;
  assignedId: string| null;
  description: string| null;
  date: Date| null;
  start: Date| null;
  stop: Date| null;
  duration: number| null;
  rate: number| null;
  currency: string| null;
  billed: boolean| null;
  teamId: string| null;
  createdAt: Date;
}

export interface TrackerReport {
  id: string;
  projectId: string| null;
  createdBy: string| null;
  linkId: string| null;
  shortLink: string| null;
  teamId: string| null;
  createdAt: Date;
}

export interface Report {
  id: string;
  type: ReportType| null;
  from: Date| null;
  to: Date| null;
  currency: string| null;
  linkId: string| null;
  shortLink: string| null;
  expireAt: Date| null;
  createdBy: string| null;
  teamId: string| null;
  createdAt: Date;
}

export interface ExchangeRate {
  id: string;
  base: string| null;
  target: string| null;
  rate: number| null;
  updatedAt: Date| null;
}

export interface Inbox {
  id: string;
  type: InboxType| null;
  status: InboxStatus| null;
  displayName: string| null;
  description: string| null;
  date: Date| null;
  amount: number| null;
  currency: string| null;
  baseAmount: number| null;
  baseCurrency: string| null;
  website: string| null;
  fileName: string| null;
  contentType: string| null;
  size: number| null;
  filePath: string[];
  attachmentId: string| null;
  transactionId: string| null;
  referenceId: string| null;
  forwardedTo: string| null;
  meta: Record<string, unknown>| null;
  teamId: string| null;
  createdAt: Date;
}

export interface TransactionAttachment {
  id: string;
  transactionId: string| null;
  name: string| null;
  type: string| null;
  size: number| null;
  path: string[];
  teamId: string| null;
  createdAt: Date;
}

export interface App {
  id: string;
  appId: string;
  config: Record<string, unknown>| null;
  settings: Record<string, unknown>| null;
  teamId: string| null;
  createdBy: string| null;
  createdAt: Date| null;
}

export type BankConnectionStatus = "ACTIVE" | "ERROR" | "DISCONNECTED" | "PENDING" | "REQUIRES_ATTENTION" | "LOGIN_REQUIRED" | "REQUIRES_REAUTH";

export declare const BankConnectionStatus: {
  readonly ACTIVE: "ACTIVE";
  readonly ERROR: "ERROR";
  readonly DISCONNECTED: "DISCONNECTED";
  readonly PENDING: "PENDING";
  readonly REQUIRES_ATTENTION: "REQUIRES_ATTENTION";
  readonly LOGIN_REQUIRED: "LOGIN_REQUIRED";
  readonly REQUIRES_REAUTH: "REQUIRES_REAUTH";
};

export type SyncStatus = "IDLE" | "SYNCING" | "FAILED" | "SCHEDULED";

export declare const SyncStatus: {
  readonly IDLE: "IDLE";
  readonly SYNCING: "SYNCING";
  readonly FAILED: "FAILED";
  readonly SCHEDULED: "SCHEDULED";
};

export type AccountType = "DEPOSITORY" | "CREDIT" | "LOAN" | "INVESTMENT" | "MORTGAGE" | "BROKERAGE" | "OTHER";

export declare const AccountType: {
  readonly DEPOSITORY: "DEPOSITORY";
  readonly CREDIT: "CREDIT";
  readonly LOAN: "LOAN";
  readonly INVESTMENT: "INVESTMENT";
  readonly MORTGAGE: "MORTGAGE";
  readonly BROKERAGE: "BROKERAGE";
  readonly OTHER: "OTHER";
};

export type AccountSubtype = "CHECKING" | "SAVINGS" | "CD" | "MONEY_MARKET" | "CREDIT_CARD" | "PAYPAL" | "AUTO_LOAN" | "STUDENT_LOAN" | "MORTGAGE" | "RETIREMENT" | "MUTUAL_FUND" | "ETF" | "STOCK" | "CASH_MANAGEMENT" | "PREPAID" | "HEALTH_SAVINGS" | "OTHER";

export declare const AccountSubtype: {
  readonly CHECKING: "CHECKING";
  readonly SAVINGS: "SAVINGS";
  readonly CD: "CD";
  readonly MONEY_MARKET: "MONEY_MARKET";
  readonly CREDIT_CARD: "CREDIT_CARD";
  readonly PAYPAL: "PAYPAL";
  readonly AUTO_LOAN: "AUTO_LOAN";
  readonly STUDENT_LOAN: "STUDENT_LOAN";
  readonly MORTGAGE: "MORTGAGE";
  readonly RETIREMENT: "RETIREMENT";
  readonly MUTUAL_FUND: "MUTUAL_FUND";
  readonly ETF: "ETF";
  readonly STOCK: "STOCK";
  readonly CASH_MANAGEMENT: "CASH_MANAGEMENT";
  readonly PREPAID: "PREPAID";
  readonly HEALTH_SAVINGS: "HEALTH_SAVINGS";
  readonly OTHER: "OTHER";
};

export type AccountStatus = "ACTIVE" | "CLOSED" | "FROZEN" | "INACTIVE" | "PENDING" | "DISCONNECTED" | "SUSPENDED" | "ARCHIVED";

export declare const AccountStatus: {
  readonly ACTIVE: "ACTIVE";
  readonly CLOSED: "CLOSED";
  readonly FROZEN: "FROZEN";
  readonly INACTIVE: "INACTIVE";
  readonly PENDING: "PENDING";
  readonly DISCONNECTED: "DISCONNECTED";
  readonly SUSPENDED: "SUSPENDED";
  readonly ARCHIVED: "ARCHIVED";
};

export type VerificationStatus = "NONE" | "PENDING_AUTOMATIC_VERIFICATION" | "PENDING_MANUAL_VERIFICATION" | "MANUALLY_VERIFIED" | "AUTOMATICALLY_VERIFIED" | "VERIFICATION_FAILED";

export declare const VerificationStatus: {
  readonly NONE: "NONE";
  readonly PENDING_AUTOMATIC_VERIFICATION: "PENDING_AUTOMATIC_VERIFICATION";
  readonly PENDING_MANUAL_VERIFICATION: "PENDING_MANUAL_VERIFICATION";
  readonly MANUALLY_VERIFIED: "MANUALLY_VERIFIED";
  readonly AUTOMATICALLY_VERIFIED: "AUTOMATICALLY_VERIFIED";
  readonly VERIFICATION_FAILED: "VERIFICATION_FAILED";
};

export type AccountCapabilities = "BALANCE" | "OWNERSHIP" | "PAYMENT" | "TRANSACTIONS" | "STATEMENTS" | "IDENTITY" | "AUTH";

export declare const AccountCapabilities: {
  readonly BALANCE: "BALANCE";
  readonly OWNERSHIP: "OWNERSHIP";
  readonly PAYMENT: "PAYMENT";
  readonly TRANSACTIONS: "TRANSACTIONS";
  readonly STATEMENTS: "STATEMENTS";
  readonly IDENTITY: "IDENTITY";
  readonly AUTH: "AUTH";
};

export type TransactionCategory = "INCOME" | "TRANSFER" | "LOAN_PAYMENTS" | "BANK_FEES" | "ENTERTAINMENT" | "FOOD_AND_DRINK" | "GENERAL_MERCHANDISE" | "HOME_IMPROVEMENT" | "MEDICAL" | "PERSONAL_CARE" | "GENERAL_SERVICES" | "GOVERNMENT_AND_NON_PROFIT" | "TRANSPORTATION" | "TRAVEL" | "UTILITIES" | "OTHER";

export declare const TransactionCategory: {
  readonly INCOME: "INCOME";
  readonly TRANSFER: "TRANSFER";
  readonly LOAN_PAYMENTS: "LOAN_PAYMENTS";
  readonly BANK_FEES: "BANK_FEES";
  readonly ENTERTAINMENT: "ENTERTAINMENT";
  readonly FOOD_AND_DRINK: "FOOD_AND_DRINK";
  readonly GENERAL_MERCHANDISE: "GENERAL_MERCHANDISE";
  readonly HOME_IMPROVEMENT: "HOME_IMPROVEMENT";
  readonly MEDICAL: "MEDICAL";
  readonly PERSONAL_CARE: "PERSONAL_CARE";
  readonly GENERAL_SERVICES: "GENERAL_SERVICES";
  readonly GOVERNMENT_AND_NON_PROFIT: "GOVERNMENT_AND_NON_PROFIT";
  readonly TRANSPORTATION: "TRANSPORTATION";
  readonly TRAVEL: "TRAVEL";
  readonly UTILITIES: "UTILITIES";
  readonly OTHER: "OTHER";
};

export type UserRole = "USER" | "ADMIN" | "SUPERADMIN" | "MANAGER" | "EDITOR" | "VIEWER" | "GUEST";

export declare const UserRole: {
  readonly USER: "USER";
  readonly ADMIN: "ADMIN";
  readonly SUPERADMIN: "SUPERADMIN";
  readonly MANAGER: "MANAGER";
  readonly EDITOR: "EDITOR";
  readonly VIEWER: "VIEWER";
  readonly GUEST: "GUEST";
};

export type TextStyle = "DEFAULT" | "SERIF" | "MONO";

export declare const TextStyle: {
  readonly DEFAULT: "DEFAULT";
  readonly SERIF: "SERIF";
  readonly MONO: "MONO";
};

export type SpendingTimeframe = "DAY" | "WEEK" | "MONTH" | "QUARTER" | "YEAR" | "CUSTOM";

export declare const SpendingTimeframe: {
  readonly DAY: "DAY";
  readonly WEEK: "WEEK";
  readonly MONTH: "MONTH";
  readonly QUARTER: "QUARTER";
  readonly YEAR: "YEAR";
  readonly CUSTOM: "CUSTOM";
};

export type TeamRole = "OWNER" | "MEMBER";

export declare const TeamRole: {
  readonly OWNER: "OWNER";
  readonly MEMBER: "MEMBER";
};

export type InvoiceStatus = "DRAFT" | "UNPAID" | "PAID" | "OVERDUE" | "CANCELED";

export declare const InvoiceStatus: {
  readonly DRAFT: "DRAFT";
  readonly UNPAID: "UNPAID";
  readonly PAID: "PAID";
  readonly OVERDUE: "OVERDUE";
  readonly CANCELED: "CANCELED";
};

export type InvoiceDeliveryType = "CREATE" | "CREATE_AND_SEND";

export declare const InvoiceDeliveryType: {
  readonly CREATE: "CREATE";
  readonly CREATE_AND_SEND: "CREATE_AND_SEND";
};

export type InvoiceSize = "A4" | "LETTER";

export declare const InvoiceSize: {
  readonly A4: "A4";
  readonly LETTER: "LETTER";
};

export type TrackerStatus = "IN_PROGRESS" | "COMPLETED";

export declare const TrackerStatus: {
  readonly IN_PROGRESS: "IN_PROGRESS";
  readonly COMPLETED: "COMPLETED";
};

export type InboxType = "INVOICE" | "EXPENSE";

export declare const InboxType: {
  readonly INVOICE: "INVOICE";
  readonly EXPENSE: "EXPENSE";
};

export type InboxStatus = "NEW" | "PROCESSING" | "PENDING" | "ARCHIVED" | "DELETED";

export declare const InboxStatus: {
  readonly NEW: "NEW";
  readonly PROCESSING: "PROCESSING";
  readonly PENDING: "PENDING";
  readonly ARCHIVED: "ARCHIVED";
  readonly DELETED: "DELETED";
};

export type ReportType = "PROFIT" | "REVENUE" | "BURN_RATE" | "EXPENSE";

export declare const ReportType: {
  readonly PROFIT: "PROFIT";
  readonly REVENUE: "REVENUE";
  readonly BURN_RATE: "BURN_RATE";
  readonly EXPENSE: "EXPENSE";
};

export type TransactionFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "SEMI_MONTHLY" | "ANNUALLY" | "IRREGULAR" | "UNKNOWN";

export declare const TransactionFrequency: {
  readonly WEEKLY: "WEEKLY";
  readonly BIWEEKLY: "BIWEEKLY";
  readonly MONTHLY: "MONTHLY";
  readonly SEMI_MONTHLY: "SEMI_MONTHLY";
  readonly ANNUALLY: "ANNUALLY";
  readonly IRREGULAR: "IRREGULAR";
  readonly UNKNOWN: "UNKNOWN";
};

declare global {
  export type TSession = Session;
  export type TOauthAccount = OauthAccount;
  export type TUser = User;
  export type TDocument = Document;
  export type TDocumentVersion = DocumentVersion;
  export type TDiscussion = Discussion;
  export type TComment = Comment;
  export type TFile = File;
  export type TBankConnection = BankConnection;
  export type TBankAccount = BankAccount;
  export type TTransaction = Transaction;
  export type TRecurringTransaction = RecurringTransaction;
  export type TAttachment = Attachment;
  export type TUserActivity = UserActivity;
  export type TNotification = Notification;
  export type TSpendingInsight = SpendingInsight;
  export type TTeam = Team;
  export type TUsersOnTeam = UsersOnTeam;
  export type TUserInvite = UserInvite;
  export type TCustomer = Customer;
  export type TTag = Tag;
  export type TCustomerTag = CustomerTag;
  export type TTransactionTag = TransactionTag;
  export type TCustomTransactionCategory = CustomTransactionCategory;
  export type TTransactionEnrichment = TransactionEnrichment;
  export type TInvoice = Invoice;
  export type TInvoiceTemplate = InvoiceTemplate;
  export type TTrackerProject = TrackerProject;
  export type TTrackerProjectTag = TrackerProjectTag;
  export type TTrackerEntry = TrackerEntry;
  export type TTrackerReport = TrackerReport;
  export type TReport = Report;
  export type TExchangeRate = ExchangeRate;
  export type TInbox = Inbox;
  export type TTransactionAttachment = TransactionAttachment;
  export type TApp = App;
  export type TBankConnectionStatus = BankConnectionStatus;
  export type TSyncStatus = SyncStatus;
  export type TAccountType = AccountType;
  export type TAccountSubtype = AccountSubtype;
  export type TAccountStatus = AccountStatus;
  export type TVerificationStatus = VerificationStatus;
  export type TAccountCapabilities = AccountCapabilities;
  export type TTransactionCategory = TransactionCategory;
  export type TUserRole = UserRole;
  export type TTextStyle = TextStyle;
  export type TSpendingTimeframe = SpendingTimeframe;
  export type TTeamRole = TeamRole;
  export type TInvoiceStatus = InvoiceStatus;
  export type TInvoiceDeliveryType = InvoiceDeliveryType;
  export type TInvoiceSize = InvoiceSize;
  export type TTrackerStatus = TrackerStatus;
  export type TInboxType = InboxType;
  export type TInboxStatus = InboxStatus;
  export type TReportType = ReportType;
  export type TTransactionFrequency = TransactionFrequency;
}

