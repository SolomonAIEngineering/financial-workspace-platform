import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const BankConnectionStatus = {
    ACTIVE: "ACTIVE",
    ERROR: "ERROR",
    DISCONNECTED: "DISCONNECTED",
    PENDING: "PENDING",
    REQUIRES_ATTENTION: "REQUIRES_ATTENTION",
    LOGIN_REQUIRED: "LOGIN_REQUIRED",
    REQUIRES_REAUTH: "REQUIRES_REAUTH"
} as const;
export type BankConnectionStatus = (typeof BankConnectionStatus)[keyof typeof BankConnectionStatus];
export const SyncStatus = {
    IDLE: "IDLE",
    SYNCING: "SYNCING",
    FAILED: "FAILED",
    SCHEDULED: "SCHEDULED"
} as const;
export type SyncStatus = (typeof SyncStatus)[keyof typeof SyncStatus];
export const AccountType = {
    DEPOSITORY: "DEPOSITORY",
    CREDIT: "CREDIT",
    LOAN: "LOAN",
    INVESTMENT: "INVESTMENT",
    MORTGAGE: "MORTGAGE",
    BROKERAGE: "BROKERAGE",
    OTHER: "OTHER"
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
    OTHER: "OTHER"
} as const;
export type AccountSubtype = (typeof AccountSubtype)[keyof typeof AccountSubtype];
export const AccountStatus = {
    ACTIVE: "ACTIVE",
    CLOSED: "CLOSED",
    FROZEN: "FROZEN",
    INACTIVE: "INACTIVE",
    PENDING: "PENDING",
    DISCONNECTED: "DISCONNECTED",
    SUSPENDED: "SUSPENDED",
    ARCHIVED: "ARCHIVED"
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];
export const VerificationStatus = {
    NONE: "NONE",
    PENDING_AUTOMATIC_VERIFICATION: "PENDING_AUTOMATIC_VERIFICATION",
    PENDING_MANUAL_VERIFICATION: "PENDING_MANUAL_VERIFICATION",
    MANUALLY_VERIFIED: "MANUALLY_VERIFIED",
    AUTOMATICALLY_VERIFIED: "AUTOMATICALLY_VERIFIED",
    VERIFICATION_FAILED: "VERIFICATION_FAILED"
} as const;
export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus];
export const AccountCapabilities = {
    BALANCE: "BALANCE",
    OWNERSHIP: "OWNERSHIP",
    PAYMENT: "PAYMENT",
    TRANSACTIONS: "TRANSACTIONS",
    STATEMENTS: "STATEMENTS",
    IDENTITY: "IDENTITY",
    AUTH: "AUTH"
} as const;
export type AccountCapabilities = (typeof AccountCapabilities)[keyof typeof AccountCapabilities];
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
    OTHER: "OTHER"
} as const;
export type TransactionCategory = (typeof TransactionCategory)[keyof typeof TransactionCategory];
export const UserRole = {
    USER: "USER",
    ADMIN: "ADMIN",
    SUPERADMIN: "SUPERADMIN",
    MANAGER: "MANAGER",
    EDITOR: "EDITOR",
    VIEWER: "VIEWER",
    GUEST: "GUEST"
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const TextStyle = {
    DEFAULT: "DEFAULT",
    SERIF: "SERIF",
    MONO: "MONO"
} as const;
export type TextStyle = (typeof TextStyle)[keyof typeof TextStyle];
export const SpendingTimeframe = {
    DAY: "DAY",
    WEEK: "WEEK",
    MONTH: "MONTH",
    QUARTER: "QUARTER",
    YEAR: "YEAR",
    CUSTOM: "CUSTOM"
} as const;
export type SpendingTimeframe = (typeof SpendingTimeframe)[keyof typeof SpendingTimeframe];
export type Attachment = {
    id: string;
    transactionId: string;
    name: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type BankAccount = {
    id: string;
    userId: string;
    bankConnectionId: string;
    plaidAccountId: string;
    name: string;
    officialName: string | null;
    type: AccountType;
    subtype: AccountSubtype | null;
    verificationStatus: Generated<VerificationStatus>;
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
    balanceLastUpdated: Timestamp | null;
    capabilities: AccountCapabilities[];
    permissionsGranted: Generated<string[]>;
    status: Generated<AccountStatus>;
    isHidden: Generated<boolean>;
    isPrimary: Generated<boolean>;
    isFavorite: Generated<boolean>;
    enabled: Generated<boolean>;
    monthlySpending: number | null;
    monthlyIncome: number | null;
    averageBalance: number | null;
    tags: Generated<string[]>;
    budgetCategory: string | null;
    lastSyncedAt: Timestamp | null;
    errorCount: Generated<number>;
    errorMessage: string | null;
    lastUpdated: Generated<Timestamp>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
    deletedAt: Timestamp | null;
};
export type BankConnection = {
    id: string;
    userId: string;
    institutionId: string;
    institutionName: string;
    accessToken: string;
    itemId: string;
    status: Generated<BankConnectionStatus>;
    errorCode: string | null;
    errorMessage: string | null;
    lastStatusChangedAt: Timestamp | null;
    logo: string | null;
    primaryColor: string | null;
    oauthSupported: Generated<boolean>;
    mfaSupported: Generated<boolean>;
    lastSyncedAt: Timestamp | null;
    nextSyncScheduledAt: Timestamp | null;
    syncStatus: Generated<SyncStatus>;
    balanceLastUpdated: Timestamp | null;
    lastNotifiedAt: Timestamp | null;
    notificationCount: Generated<number>;
    webhookUrl: string | null;
    consentExpiresAt: Timestamp | null;
    disabled: Generated<boolean>;
    lastUpdated: Generated<Timestamp>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
    deletedAt: Timestamp | null;
    lastAlertedAt: Timestamp | null;
    alertCount: Generated<number>;
    lastCheckedAt: Timestamp | null;
    lastAccessedAt: Timestamp | null;
    lastExpiryNotifiedAt: Timestamp | null;
    expiryNotificationCount: Generated<number>;
};
export type Comment = {
    id: string;
    userId: string;
    discussionId: string;
    content: string;
    contentRich: unknown | null;
    isEdited: Generated<boolean>;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};
export type Discussion = {
    id: string;
    documentId: string;
    userId: string;
    documentContent: string;
    documentContentRich: unknown | null;
    isResolved: Generated<boolean>;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};
export type Document = {
    id: string;
    templateId: string | null;
    userId: string;
    parentDocumentId: string | null;
    title: string | null;
    content: string | null;
    contentRich: unknown | null;
    coverImage: string | null;
    icon: string | null;
    isPublished: Generated<boolean>;
    isArchived: Generated<boolean>;
    pinned: Generated<boolean>;
    tags: Generated<string[]>;
    isTemplate: Generated<boolean>;
    status: Generated<string>;
    textStyle: Generated<TextStyle>;
    smallText: Generated<boolean>;
    fullWidth: Generated<boolean>;
    lockPage: Generated<boolean>;
    toc: Generated<boolean>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type DocumentVersion = {
    id: string;
    documentId: string;
    userId: string;
    title: string | null;
    contentRich: unknown | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type File = {
    id: string;
    userId: string;
    documentId: string | null;
    size: number;
    url: string;
    appUrl: string;
    type: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};
export type Notification = {
    id: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    read: Generated<boolean>;
    metadata: unknown | null;
    createdAt: Generated<Timestamp>;
};
export type OauthAccount = {
    id: string;
    providerId: string;
    providerUserId: string;
    userId: string;
};
export type Session = {
    id: string;
    user_id: string;
    expires_at: Timestamp;
    ip_address: string | null;
    user_agent: string | null;
};
export type SpendingInsight = {
    id: string;
    userId: string;
    startDate: Timestamp;
    endDate: Timestamp;
    timeframe: Generated<SpendingTimeframe>;
    year: number;
    month: number | null;
    quarter: number | null;
    week: number | null;
    totalTransactions: number;
    totalSpending: number;
    avgTransactionSize: number;
    categoryStats: unknown;
    merchantStats: unknown | null;
    spendingTrend: number | null;
    incomeTotal: number | null;
    incomeTrend: number | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Transaction = {
    id: string;
    userId: string;
    bankAccountId: string;
    bankConnectionId: string;
    plaidTransactionId: string;
    amount: number;
    isoCurrencyCode: string | null;
    date: Timestamp;
    name: string;
    merchantName: string | null;
    description: string | null;
    pending: Generated<boolean>;
    category: TransactionCategory | null;
    subCategory: string | null;
    categoryIconUrl: string | null;
    customCategory: string | null;
    location: unknown | null;
    paymentChannel: string | null;
    paymentMethod: string | null;
    originalDescription: string | null;
    originalCategory: string | null;
    originalMerchantName: string | null;
    excludeFromBudget: Generated<boolean>;
    isRecurring: Generated<boolean>;
    recurrenceId: string | null;
    tags: Generated<string[]>;
    notes: string | null;
    parentTransactionId: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type User = {
    id: string;
    username: string;
    password_hash: string | null;
    email: string | null;
    role: Generated<UserRole>;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    bio: string | null;
    timezone: string | null;
    language: Generated<string | null>;
    jobTitle: string | null;
    department: string | null;
    employeeId: string | null;
    hireDate: Timestamp | null;
    yearsOfExperience: number | null;
    skills: Generated<string[]>;
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
    notificationPreferences: unknown | null;
    displayPreferences: unknown | null;
    documentPreferences: unknown | null;
    notificationsEnabled: Generated<boolean>;
    lastTransactionNotificationAt: Timestamp | null;
    linkedinProfile: string | null;
    twitterProfile: string | null;
    githubProfile: string | null;
    version: Generated<number>;
    stripeCustomerId: string | null;
    accountStatus: Generated<AccountStatus>;
    lastLoginAt: Timestamp | null;
    uploadLimit: Generated<number>;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
    deletedAt: Timestamp | null;
};
export type UserActivity = {
    id: string;
    userId: string;
    type: string;
    detail: string;
    metadata: unknown | null;
    createdAt: Generated<Timestamp>;
};
export type DB = {
    Attachment: Attachment;
    BankAccount: BankAccount;
    BankConnection: BankConnection;
    Comment: Comment;
    Discussion: Discussion;
    Document: Document;
    DocumentVersion: DocumentVersion;
    File: File;
    Notification: Notification;
    OauthAccount: OauthAccount;
    Session: Session;
    SpendingInsight: SpendingInsight;
    Transaction: Transaction;
    User: User;
    UserActivity: UserActivity;
};
