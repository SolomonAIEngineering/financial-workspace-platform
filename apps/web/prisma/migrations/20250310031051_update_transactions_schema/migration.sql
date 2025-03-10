/*
  Warnings:

  - You are about to drop the column `bankConnectionId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_bankConnectionId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_category_slug_teamId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_teamId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_userId_fkey";

-- DropIndex
DROP INDEX "transactions_bankConnectionId_idx";

-- DropIndex
DROP INDEX "transactions_teamId_category_slug_idx";

-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "balanceProjections" JSONB,
ADD COLUMN     "nextScheduledTransaction" TIMESTAMP(3),
ADD COLUMN     "recurringMonthlyInflow" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "recurringMonthlyOutflow" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "scheduledInflows" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "scheduledOutflows" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "bankConnectionId",
DROP COLUMN "teamId",
ADD COLUMN     "recurringTransactionId" TEXT;

-- CreateTable
CREATE TABLE "recurring_transactions" (
    "id" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "initialAccountBalance" DOUBLE PRECISION,
    "frequency" "TransactionFrequency" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "dayOfMonth" INTEGER,
    "dayOfWeek" INTEGER,
    "weekOfMonth" INTEGER,
    "monthOfYear" INTEGER,
    "executionDays" INTEGER[],
    "skipWeekends" BOOLEAN NOT NULL DEFAULT false,
    "adjustForHolidays" BOOLEAN NOT NULL DEFAULT false,
    "allowExecution" BOOLEAN NOT NULL DEFAULT true,
    "limitExecutions" INTEGER,
    "transactionTemplate" JSONB,
    "categorySlug" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "customFields" JSONB,
    "targetAccountId" TEXT,
    "affectAvailableBalance" BOOLEAN NOT NULL DEFAULT true,
    "lastExecutedAt" TIMESTAMP(3),
    "nextScheduledDate" TIMESTAMP(3),
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "totalExecuted" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastExecutionStatus" TEXT,
    "lastExecutionError" TEXT,
    "minBalanceRequired" DOUBLE PRECISION,
    "overspendAction" TEXT DEFAULT 'block',
    "insufficientFundsCount" INTEGER NOT NULL DEFAULT 0,
    "expectedAmount" DOUBLE PRECISION,
    "allowedVariance" DOUBLE PRECISION,
    "varianceAction" TEXT,
    "reminderDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "reminderSentAt" TIMESTAMP(3),
    "notifyOnExecution" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnFailure" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isAutomated" BOOLEAN NOT NULL DEFAULT true,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "isVariable" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "merchantId" TEXT,
    "merchantName" TEXT,
    "transactionType" TEXT,
    "importanceLevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastModifiedBy" TEXT,

    CONSTRAINT "recurring_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recurring_transactions_bankAccountId_idx" ON "recurring_transactions"("bankAccountId");

-- CreateIndex
CREATE INDEX "recurring_transactions_status_idx" ON "recurring_transactions"("status");

-- CreateIndex
CREATE INDEX "recurring_transactions_frequency_idx" ON "recurring_transactions"("frequency");

-- CreateIndex
CREATE INDEX "recurring_transactions_nextScheduledDate_idx" ON "recurring_transactions"("nextScheduledDate");

-- CreateIndex
CREATE INDEX "recurring_transactions_merchantName_idx" ON "recurring_transactions"("merchantName");

-- CreateIndex
CREATE INDEX "transactions_recurringTransactionId_idx" ON "transactions"("recurringTransactionId");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_slug_fkey" FOREIGN KEY ("category_slug") REFERENCES "transaction_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurringTransactionId_fkey" FOREIGN KEY ("recurringTransactionId") REFERENCES "recurring_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_targetAccountId_fkey" FOREIGN KEY ("targetAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
