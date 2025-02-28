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
}

export interface Transaction {
  id: string;
  userId: string;
  bankAccountId: string;
  bankConnectionId: string;
  plaidTransactionId: string;
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
  location: Record<string, unknown>| null;
  paymentChannel: string| null;
  paymentMethod: string| null;
  originalDescription: string| null;
  originalCategory: string| null;
  originalMerchantName: string| null;
  excludeFromBudget: boolean;
  isRecurring: boolean;
  recurrenceId: string| null;
  tags: string[];
  notes: string| null;
  parentTransactionId: string| null;
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
  export type TAttachment = Attachment;
  export type TUserActivity = UserActivity;
  export type TNotification = Notification;
  export type TSpendingInsight = SpendingInsight;
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
}

