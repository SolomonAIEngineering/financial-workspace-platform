-- CreateEnum
CREATE TYPE "BankConnectionStatus" AS ENUM ('ACTIVE', 'ERROR', 'DISCONNECTED', 'PENDING', 'REQUIRES_ATTENTION', 'LOGIN_REQUIRED', 'REQUIRES_REAUTH');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('IDLE', 'SYNCING', 'FAILED', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('DEPOSITORY', 'CREDIT', 'LOAN', 'INVESTMENT', 'MORTGAGE', 'BROKERAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "AccountSubtype" AS ENUM ('CHECKING', 'SAVINGS', 'CD', 'MONEY_MARKET', 'CREDIT_CARD', 'PAYPAL', 'AUTO_LOAN', 'STUDENT_LOAN', 'MORTGAGE', 'RETIREMENT', 'MUTUAL_FUND', 'ETF', 'STOCK', 'CASH_MANAGEMENT', 'PREPAID', 'HEALTH_SAVINGS', 'OTHER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NONE', 'PENDING_AUTOMATIC_VERIFICATION', 'PENDING_MANUAL_VERIFICATION', 'MANUALLY_VERIFIED', 'AUTOMATICALLY_VERIFIED', 'VERIFICATION_FAILED');

-- CreateEnum
CREATE TYPE "AccountCapabilities" AS ENUM ('BALANCE', 'OWNERSHIP', 'PAYMENT', 'TRANSACTIONS', 'STATEMENTS', 'IDENTITY', 'AUTH');

-- CreateEnum
CREATE TYPE "TransactionCategory" AS ENUM ('INCOME', 'TRANSFER', 'LOAN_PAYMENTS', 'BANK_FEES', 'ENTERTAINMENT', 'FOOD_AND_DRINK', 'GENERAL_MERCHANDISE', 'HOME_IMPROVEMENT', 'MEDICAL', 'PERSONAL_CARE', 'GENERAL_SERVICES', 'GOVERNMENT_AND_NON_PROFIT', 'TRANSPORTATION', 'TRAVEL', 'UTILITIES', 'OTHER');

-- CreateEnum
CREATE TYPE "SpendingTimeframe" AS ENUM ('DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR', 'CUSTOM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AccountStatus" ADD VALUE 'CLOSED';
ALTER TYPE "AccountStatus" ADD VALUE 'FROZEN';
ALTER TYPE "AccountStatus" ADD VALUE 'DISCONNECTED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastTransactionNotificationAt" TIMESTAMP(3),
ADD COLUMN     "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "BankConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "status" "BankConnectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "lastStatusChangedAt" TIMESTAMP(3),
    "logo" TEXT,
    "primaryColor" TEXT,
    "oauthSupported" BOOLEAN NOT NULL DEFAULT false,
    "mfaSupported" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3),
    "nextSyncScheduledAt" TIMESTAMP(3),
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'IDLE',
    "balanceLastUpdated" TIMESTAMP(3),
    "lastNotifiedAt" TIMESTAMP(3),
    "notificationCount" INTEGER NOT NULL DEFAULT 0,
    "webhookUrl" TEXT,
    "consentExpiresAt" TIMESTAMP(3),
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "lastAlertedAt" TIMESTAMP(3),
    "alertCount" INTEGER NOT NULL DEFAULT 0,
    "lastCheckedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),
    "lastExpiryNotifiedAt" TIMESTAMP(3),
    "expiryNotificationCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BankConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bankConnectionId" TEXT NOT NULL,
    "plaidAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "officialName" TEXT,
    "type" "AccountType" NOT NULL,
    "subtype" "AccountSubtype",
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NONE',
    "mask" TEXT,
    "displayName" TEXT,
    "accountNumber" TEXT,
    "routingNumber" TEXT,
    "iban" TEXT,
    "swift" TEXT,
    "availableBalance" DOUBLE PRECISION,
    "currentBalance" DOUBLE PRECISION,
    "limit" DOUBLE PRECISION,
    "isoCurrencyCode" TEXT,
    "balanceLastUpdated" TIMESTAMP(3),
    "capabilities" "AccountCapabilities"[],
    "permissionsGranted" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "monthlySpending" DOUBLE PRECISION,
    "monthlyIncome" DOUBLE PRECISION,
    "averageBalance" DOUBLE PRECISION,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "budgetCategory" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "bankConnectionId" TEXT NOT NULL,
    "plaidTransactionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isoCurrencyCode" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "merchantName" TEXT,
    "description" TEXT,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "category" "TransactionCategory",
    "subCategory" TEXT,
    "categoryIconUrl" TEXT,
    "customCategory" TEXT,
    "location" JSONB,
    "paymentChannel" TEXT,
    "paymentMethod" TEXT,
    "originalDescription" TEXT,
    "originalCategory" TEXT,
    "originalMerchantName" TEXT,
    "excludeFromBudget" BOOLEAN NOT NULL DEFAULT false,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "parentTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpendingInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "timeframe" "SpendingTimeframe" NOT NULL DEFAULT 'MONTH',
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "quarter" INTEGER,
    "week" INTEGER,
    "totalTransactions" INTEGER NOT NULL,
    "totalSpending" DOUBLE PRECISION NOT NULL,
    "avgTransactionSize" DOUBLE PRECISION NOT NULL,
    "categoryStats" JSONB NOT NULL,
    "merchantStats" JSONB,
    "spendingTrend" DOUBLE PRECISION,
    "incomeTotal" DOUBLE PRECISION,
    "incomeTrend" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpendingInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankConnection_itemId_key" ON "BankConnection"("itemId");

-- CreateIndex
CREATE INDEX "BankConnection_userId_idx" ON "BankConnection"("userId");

-- CreateIndex
CREATE INDEX "BankConnection_itemId_idx" ON "BankConnection"("itemId");

-- CreateIndex
CREATE INDEX "BankConnection_status_idx" ON "BankConnection"("status");

-- CreateIndex
CREATE INDEX "BankConnection_institutionId_idx" ON "BankConnection"("institutionId");

-- CreateIndex
CREATE INDEX "BankAccount_userId_idx" ON "BankAccount"("userId");

-- CreateIndex
CREATE INDEX "BankAccount_bankConnectionId_idx" ON "BankAccount"("bankConnectionId");

-- CreateIndex
CREATE INDEX "BankAccount_type_idx" ON "BankAccount"("type");

-- CreateIndex
CREATE INDEX "BankAccount_status_idx" ON "BankAccount"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_userId_plaidAccountId_key" ON "BankAccount"("userId", "plaidAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_plaidTransactionId_key" ON "Transaction"("plaidTransactionId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_bankAccountId_idx" ON "Transaction"("bankAccountId");

-- CreateIndex
CREATE INDEX "Transaction_bankConnectionId_idx" ON "Transaction"("bankConnectionId");

-- CreateIndex
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");

-- CreateIndex
CREATE INDEX "Transaction_category_idx" ON "Transaction"("category");

-- CreateIndex
CREATE INDEX "Transaction_pending_idx" ON "Transaction"("pending");

-- CreateIndex
CREATE INDEX "Transaction_isRecurring_idx" ON "Transaction"("isRecurring");

-- CreateIndex
CREATE INDEX "Attachment_transactionId_idx" ON "Attachment"("transactionId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "SpendingInsight_userId_idx" ON "SpendingInsight"("userId");

-- CreateIndex
CREATE INDEX "SpendingInsight_startDate_endDate_idx" ON "SpendingInsight"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "SpendingInsight_timeframe_year_month_idx" ON "SpendingInsight"("timeframe", "year", "month");

-- CreateIndex
CREATE INDEX "SpendingInsight_userId_timeframe_year_month_idx" ON "SpendingInsight"("userId", "timeframe", "year", "month");

-- AddForeignKey
ALTER TABLE "BankConnection" ADD CONSTRAINT "BankConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_bankConnectionId_fkey" FOREIGN KEY ("bankConnectionId") REFERENCES "BankConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_bankConnectionId_fkey" FOREIGN KEY ("bankConnectionId") REFERENCES "BankConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_parentTransactionId_fkey" FOREIGN KEY ("parentTransactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpendingInsight" ADD CONSTRAINT "SpendingInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
