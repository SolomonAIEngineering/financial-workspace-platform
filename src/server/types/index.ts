export interface Session {
  id: string;
  user_id: string;
  expires_at: Date;
  ip_address: string | null;
  user_agent: string | null;
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
  password_hash: string | null;
  email: string | null;
  role: UserRole;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  timezone: string | null;
  language: string | null;
  jobTitle: string | null;
  department: string | null;
  employeeId: string | null;
  hireDate: Date | null;
  yearsOfExperience: number | null;
  skills: string[];
  phoneNumber: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  officeLocation: string | null;
  organizationName: string | null;
  organizationUnit: string | null;
  managerUserId: string | null;
  teamName: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  notificationPreferences: any | null;
  displayPreferences: any | null;
  documentPreferences: any | null;
  notificationsEnabled: boolean;
  lastTransactionNotificationAt: Date | null;
  linkedinProfile: string | null;
  twitterProfile: string | null;
  githubProfile: string | null;
  version: number;
  stripeCustomerId: string | null;
  accountStatus: AccountStatus;
  lastLoginAt: Date | null;
  uploadLimit: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Document {
  id: string;
  templateId: string | null;
  userId: string;
  parentDocumentId: string | null;
  title: string | null;
  content: string | null;
  contentRich: any | null;
  coverImage: string | null;
  icon: string | null;
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
  title: string | null;
  contentRich: any | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Discussion {
  id: string;
  documentId: string;
  userId: string;
  documentContent: string;
  documentContentRich: any | null;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  discussionId: string;
  content: string;
  contentRich: any | null;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface File {
  id: string;
  userId: string;
  documentId: string | null;
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
  errorCode: string | null;
  errorMessage: string | null;
  lastStatusChangedAt: Date | null;
  logo: string | null;
  primaryColor: string | null;
  oauthSupported: boolean;
  mfaSupported: boolean;
  lastSyncedAt: Date | null;
  nextSyncScheduledAt: Date | null;
  syncStatus: SyncStatus;
  balanceLastUpdated: Date | null;
  lastNotifiedAt: Date | null;
  notificationCount: number;
  webhookUrl: string | null;
  consentExpiresAt: Date | null;
  disabled: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  lastAlertedAt: Date | null;
  alertCount: number;
  lastCheckedAt: Date | null;
  lastAccessedAt: Date | null;
  lastExpiryNotifiedAt: Date | null;
  expiryNotificationCount: number;
}

export interface BankAccount {
  id: string;
  userId: string;
  bankConnectionId: string;
  plaidAccountId: string;
  name: string;
  officialName: string | null;
  type: AccountType;
  subtype: AccountSubtype | null;
  verificationStatus: VerificationStatus;
  mask: string | null;
  displayName: string | null;
  accountNumber: string | null;
  routingNumber: string | null;
  iban: string | null;
  swift: string | null;
  availableBalance: number | null;
  currentBalance: number | null;
  limit: number | null;
  isoCurrencyCode: string | null;
  balanceLastUpdated: Date | null;
  capabilities: AccountCapabilities[];
  permissionsGranted: string[];
  status: AccountStatus;
  isHidden: boolean;
  isPrimary: boolean;
  isFavorite: boolean;
  enabled: boolean;
  monthlySpending: number | null;
  monthlyIncome: number | null;
  averageBalance: number | null;
  tags: string[];
  budgetCategory: string | null;
  lastSyncedAt: Date | null;
  errorCount: number;
  errorMessage: string | null;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Transaction {
  id: string;
  userId: string;
  bankAccountId: string;
  bankConnectionId: string;
  plaidTransactionId: string;
  amount: number;
  isoCurrencyCode: string | null;
  date: Date;
  name: string;
  merchantName: string | null;
  description: string | null;
  pending: boolean;
  category: TransactionCategory | null;
  subCategory: string | null;
  categoryIconUrl: string | null;
  customCategory: string | null;
  location: any | null;
  paymentChannel: string | null;
  paymentMethod: string | null;
  originalDescription: string | null;
  originalCategory: string | null;
  originalMerchantName: string | null;
  excludeFromBudget: boolean;
  isRecurring: boolean;
  recurrenceId: string | null;
  tags: string[];
  notes: string | null;
  parentTransactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
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
  metadata: any | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  metadata: any | null;
  createdAt: Date;
}

export interface SpendingInsight {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  timeframe: SpendingTimeframe;
  year: number;
  month: number | null;
  quarter: number | null;
  week: number | null;
  totalTransactions: number;
  totalSpending: number;
  avgTransactionSize: number;
  categoryStats: any;
  merchantStats: any | null;
  spendingTrend: number | null;
  incomeTotal: number | null;
  incomeTrend: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export const BankConnectionStatus = {
  ACTIVE: "ACTIVE",
  ERROR: "ERROR",
  DISCONNECTED: "DISCONNECTED",
  PENDING: "PENDING",
  REQUIRES_ATTENTION: "REQUIRES_ATTENTION",
  LOGIN_REQUIRED: "LOGIN_REQUIRED",
  REQUIRES_REAUTH: "REQUIRES_REAUTH",
} as const;
export type BankConnectionStatus =
  (typeof BankConnectionStatus)[keyof typeof BankConnectionStatus];

export const SyncStatus = {
  IDLE: "IDLE",
  SYNCING: "SYNCING",
  FAILED: "FAILED",
  SCHEDULED: "SCHEDULED",
} as const;
export type SyncStatus = (typeof SyncStatus)[keyof typeof SyncStatus];

export const AccountType = {
  DEPOSITORY: "DEPOSITORY",
  CREDIT: "CREDIT",
  LOAN: "LOAN",
  INVESTMENT: "INVESTMENT",
  MORTGAGE: "MORTGAGE",
  BROKERAGE: "BROKERAGE",
  OTHER: "OTHER",
} as const;
export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export const AccountSubtype = {
  CHECKING: "CHECKING",
  SAVINGS: "SAVINGS",
  CD: "CD",
  MONEY_MARKET: "MONEY_MARKET",
  CREDIT_CARD: "CREDIT_CARD",
  PAYPAL: "PAYPAL",
  AUTO_LOAN: "AUTO_LOAN",
  STUDENT_LOAN: "STUDENT_LOAN",
  MORTGAGE: "MORTGAGE",
  RETIREMENT: "RETIREMENT",
  MUTUAL_FUND: "MUTUAL_FUND",
  ETF: "ETF",
  STOCK: "STOCK",
  CASH_MANAGEMENT: "CASH_MANAGEMENT",
  PREPAID: "PREPAID",
  HEALTH_SAVINGS: "HEALTH_SAVINGS",
  OTHER: "OTHER",
} as const;
export type AccountSubtype =
  (typeof AccountSubtype)[keyof typeof AccountSubtype];

export const AccountStatus = {
  ACTIVE: "ACTIVE",
  CLOSED: "CLOSED",
  FROZEN: "FROZEN",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING",
  DISCONNECTED: "DISCONNECTED",
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const VerificationStatus = {
  NONE: "NONE",
  PENDING_AUTOMATIC_VERIFICATION: "PENDING_AUTOMATIC_VERIFICATION",
  PENDING_MANUAL_VERIFICATION: "PENDING_MANUAL_VERIFICATION",
  MANUALLY_VERIFIED: "MANUALLY_VERIFIED",
  AUTOMATICALLY_VERIFIED: "AUTOMATICALLY_VERIFIED",
  VERIFICATION_FAILED: "VERIFICATION_FAILED",
} as const;
export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const AccountCapabilities = {
  BALANCE: "BALANCE",
  OWNERSHIP: "OWNERSHIP",
  PAYMENT: "PAYMENT",
  TRANSACTIONS: "TRANSACTIONS",
  STATEMENTS: "STATEMENTS",
  IDENTITY: "IDENTITY",
  AUTH: "AUTH",
} as const;
export type AccountCapabilities =
  (typeof AccountCapabilities)[keyof typeof AccountCapabilities];

export const TransactionCategory = {
  INCOME: "INCOME",
  TRANSFER: "TRANSFER",
  LOAN_PAYMENTS: "LOAN_PAYMENTS",
  BANK_FEES: "BANK_FEES",
  ENTERTAINMENT: "ENTERTAINMENT",
  FOOD_AND_DRINK: "FOOD_AND_DRINK",
  GENERAL_MERCHANDISE: "GENERAL_MERCHANDISE",
  HOME_IMPROVEMENT: "HOME_IMPROVEMENT",
  MEDICAL: "MEDICAL",
  PERSONAL_CARE: "PERSONAL_CARE",
  GENERAL_SERVICES: "GENERAL_SERVICES",
  GOVERNMENT_AND_NON_PROFIT: "GOVERNMENT_AND_NON_PROFIT",
  TRANSPORTATION: "TRANSPORTATION",
  TRAVEL: "TRAVEL",
  UTILITIES: "UTILITIES",
  OTHER: "OTHER",
} as const;
export type TransactionCategory =
  (typeof TransactionCategory)[keyof typeof TransactionCategory];

export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
  SUPERADMIN: "SUPERADMIN",
  MANAGER: "MANAGER",
  EDITOR: "EDITOR",
  VIEWER: "VIEWER",
  GUEST: "GUEST",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const TextStyle = {
  DEFAULT: "DEFAULT",
  SERIF: "SERIF",
  MONO: "MONO",
} as const;
export type TextStyle = (typeof TextStyle)[keyof typeof TextStyle];

export const SpendingTimeframe = {
  DAY: "DAY",
  WEEK: "WEEK",
  MONTH: "MONTH",
  QUARTER: "QUARTER",
  YEAR: "YEAR",
  CUSTOM: "CUSTOM",
} as const;
export type SpendingTimeframe =
  (typeof SpendingTimeframe)[keyof typeof SpendingTimeframe];
