/*
  Warnings:

  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'UNPAID', 'PAID', 'OVERDUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "InvoiceDeliveryType" AS ENUM ('CREATE', 'CREATE_AND_SEND');

-- CreateEnum
CREATE TYPE "InvoiceSize" AS ENUM ('A4', 'LETTER');

-- CreateEnum
CREATE TYPE "TrackerStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InboxType" AS ENUM ('INVOICE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "InboxStatus" AS ENUM ('NEW', 'PROCESSING', 'PENDING', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('PROFIT', 'REVENUE', 'BURN_RATE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "TransactionFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'SEMI_MONTHLY', 'ANNUALLY', 'IRREGULAR', 'UNKNOWN');

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_bankAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_bankConnectionId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_parentTransactionId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "teamId" TEXT;

-- DropTable
DROP TABLE "Transaction";

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "bankConnectionId" TEXT NOT NULL,
    "plaidTransactionId" TEXT,
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
    "merchantId" TEXT,
    "merchantLogoUrl" TEXT,
    "merchantCategory" TEXT,
    "merchantWebsite" TEXT,
    "merchantPhone" TEXT,
    "merchantAddress" TEXT,
    "merchantCity" TEXT,
    "merchantState" TEXT,
    "merchantZip" TEXT,
    "merchantCountry" TEXT,
    "location" JSONB,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "paymentChannel" TEXT,
    "paymentMethod" TEXT,
    "paymentProcessor" TEXT,
    "paymentGateway" TEXT,
    "transactionReference" TEXT,
    "authorizationCode" TEXT,
    "checkNumber" TEXT,
    "wireReference" TEXT,
    "accountNumber" TEXT,
    "cardType" TEXT,
    "cardNetwork" TEXT,
    "cardLastFour" TEXT,
    "originalDescription" TEXT,
    "originalCategory" TEXT,
    "originalMerchantName" TEXT,
    "fiscalYear" INTEGER,
    "fiscalMonth" INTEGER,
    "fiscalQuarter" INTEGER,
    "vatAmount" DOUBLE PRECISION,
    "vatRate" DOUBLE PRECISION,
    "taxAmount" DOUBLE PRECISION,
    "taxRate" DOUBLE PRECISION,
    "taxDeductible" BOOLEAN NOT NULL DEFAULT false,
    "taxExempt" BOOLEAN NOT NULL DEFAULT false,
    "taxCategory" TEXT,
    "status" TEXT,
    "transactionType" TEXT,
    "transactionMethod" TEXT,
    "transactionChannel" TEXT,
    "budgetCategory" TEXT,
    "budgetSubcategory" TEXT,
    "budgetId" TEXT,
    "plannedExpense" BOOLEAN NOT NULL DEFAULT false,
    "discretionary" BOOLEAN NOT NULL DEFAULT false,
    "needsWantsCategory" TEXT,
    "spendingGoalId" TEXT,
    "investmentCategory" TEXT,
    "businessPurpose" TEXT,
    "costCenter" TEXT,
    "projectCode" TEXT,
    "reimbursable" BOOLEAN NOT NULL DEFAULT false,
    "clientId" TEXT,
    "invoiceId" TEXT,
    "excludeFromBudget" BOOLEAN NOT NULL DEFAULT false,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceId" TEXT,
    "recurringFrequency" TEXT,
    "recurringDay" INTEGER,
    "estimatedNextDate" TIMESTAMP(3),
    "similarTransactions" INTEGER,
    "cashFlowCategory" TEXT,
    "cashFlowType" TEXT,
    "inflationCategory" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "anomalyScore" DOUBLE PRECISION,
    "insightTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "isModified" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "isReconciled" BOOLEAN NOT NULL DEFAULT false,
    "needsAttention" BOOLEAN NOT NULL DEFAULT false,
    "reviewStatus" TEXT,
    "userNotes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "customFields" JSONB,
    "labels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "parentTransactionId" TEXT,
    "isSplit" BOOLEAN NOT NULL DEFAULT false,
    "splitTotal" DOUBLE PRECISION,
    "splitCount" INTEGER,
    "searchableText" TEXT,
    "ftsIndex" tsvector,
    "dateYear" INTEGER,
    "dateMonth" INTEGER,
    "dateDay" INTEGER,
    "dateDayOfWeek" INTEGER,
    "dateWeekOfYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "importedAt" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),
    "lastModifiedAt" TIMESTAMP(3),
    "lastCategorizedAt" TIMESTAMP(3),
    "teamId" TEXT,
    "category_slug" TEXT,
    "frequency" "TransactionFrequency",
    "internal" BOOLEAN,
    "notified" BOOLEAN,
    "base_amount" DOUBLE PRECISION,
    "base_currency" TEXT,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "base_currency" TEXT,
    "email" TEXT,
    "logo_url" TEXT,
    "inbox_email" TEXT,
    "inbox_id" TEXT,
    "inbox_forwarding" BOOLEAN,
    "document_classification" BOOLEAN,
    "flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_on_team" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_on_team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_invites" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "code" TEXT,
    "team_id" TEXT,
    "invited_by" TEXT,
    "role" "TeamRole",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "phone" TEXT,
    "contact" TEXT,
    "website" TEXT,
    "note" TEXT,
    "vat_number" TEXT,
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "country_code" TEXT,
    "team_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_tags" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_tags" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "vat" DOUBLE PRECISION,
    "system" BOOLEAN,
    "embedding" TEXT,
    "team_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_enrichments" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "category_slug" TEXT,
    "team_id" TEXT,
    "system" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_enrichments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "customer_id" TEXT,
    "customer_name" TEXT,
    "invoice_number" TEXT,
    "amount" DOUBLE PRECISION,
    "subtotal" DOUBLE PRECISION,
    "tax" DOUBLE PRECISION,
    "vat" DOUBLE PRECISION,
    "discount" DOUBLE PRECISION,
    "currency" TEXT,
    "issue_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "viewed_at" TIMESTAMP(3),
    "reminder_sent_at" TIMESTAMP(3),
    "line_items" JSONB,
    "from_details" JSONB,
    "customer_details" JSONB,
    "payment_details" JSONB,
    "note" TEXT,
    "internal_note" TEXT,
    "note_details" JSONB,
    "top_block" JSONB,
    "bottom_block" JSONB,
    "template" JSONB,
    "url" TEXT,
    "token" TEXT NOT NULL,
    "file_size" INTEGER,
    "file_path" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sent_to" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_templates" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "title" TEXT,
    "delivery_type" "InvoiceDeliveryType" NOT NULL DEFAULT 'CREATE',
    "size" "InvoiceSize",
    "logo_url" TEXT,
    "currency" TEXT,
    "from_label" TEXT,
    "from_details" JSONB,
    "customer_label" TEXT,
    "invoice_no_label" TEXT,
    "issue_date_label" TEXT,
    "due_date_label" TEXT,
    "description_label" TEXT,
    "quantity_label" TEXT,
    "price_label" TEXT,
    "tax_label" TEXT,
    "discount_label" TEXT,
    "vat_label" TEXT,
    "total_label" TEXT,
    "total_summary_label" TEXT,
    "note_label" TEXT,
    "payment_label" TEXT,
    "payment_details" JSONB,
    "tax_rate" DOUBLE PRECISION,
    "vat_rate" DOUBLE PRECISION,
    "date_format" TEXT,
    "include_decimals" BOOLEAN,
    "include_discount" BOOLEAN,
    "include_tax" BOOLEAN,
    "include_vat" BOOLEAN,
    "include_units" BOOLEAN,
    "include_qr" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracker_projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "TrackerStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "customer_id" TEXT,
    "billable" BOOLEAN,
    "currency" TEXT,
    "rate" DOUBLE PRECISION,
    "estimate" DOUBLE PRECISION,
    "team_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracker_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracker_project_tags" (
    "id" TEXT NOT NULL,
    "tracker_project_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracker_project_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracker_entries" (
    "id" TEXT NOT NULL,
    "project_id" TEXT,
    "assigned_id" TEXT,
    "description" TEXT,
    "date" TIMESTAMP(3),
    "start" TIMESTAMP(3),
    "stop" TIMESTAMP(3),
    "duration" INTEGER,
    "rate" DOUBLE PRECISION,
    "currency" TEXT,
    "billed" BOOLEAN,
    "team_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracker_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracker_reports" (
    "id" TEXT NOT NULL,
    "project_id" TEXT,
    "created_by" TEXT,
    "link_id" TEXT,
    "short_link" TEXT,
    "team_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracker_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "type" "ReportType",
    "from" TIMESTAMP(3),
    "to" TIMESTAMP(3),
    "currency" TEXT,
    "link_id" TEXT,
    "short_link" TEXT,
    "expire_at" TIMESTAMP(3),
    "created_by" TEXT,
    "team_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" TEXT NOT NULL,
    "base" TEXT,
    "target" TEXT,
    "rate" DOUBLE PRECISION,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbox" (
    "id" TEXT NOT NULL,
    "type" "InboxType",
    "status" "InboxStatus" DEFAULT 'NEW',
    "display_name" TEXT,
    "description" TEXT,
    "date" TIMESTAMP(3),
    "amount" DOUBLE PRECISION,
    "currency" TEXT,
    "base_amount" DOUBLE PRECISION,
    "base_currency" TEXT,
    "website" TEXT,
    "file_name" TEXT,
    "content_type" TEXT,
    "size" INTEGER,
    "file_path" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attachment_id" TEXT,
    "transaction_id" TEXT,
    "reference_id" TEXT,
    "forwarded_to" TEXT,
    "meta" JSONB,
    "team_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_attachments" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "name" TEXT,
    "type" TEXT,
    "size" INTEGER,
    "path" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "team_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apps" (
    "id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "config" JSONB,
    "settings" JSONB,
    "team_id" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BankAccountToTeam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BankAccountToTeam_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_plaidTransactionId_key" ON "transactions"("plaidTransactionId");

-- CreateIndex
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");

-- CreateIndex
CREATE INDEX "transactions_bankAccountId_idx" ON "transactions"("bankAccountId");

-- CreateIndex
CREATE INDEX "transactions_bankConnectionId_idx" ON "transactions"("bankConnectionId");

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");

-- CreateIndex
CREATE INDEX "transactions_category_idx" ON "transactions"("category");

-- CreateIndex
CREATE INDEX "transactions_pending_idx" ON "transactions"("pending");

-- CreateIndex
CREATE INDEX "transactions_isRecurring_idx" ON "transactions"("isRecurring");

-- CreateIndex
CREATE INDEX "transactions_merchantName_idx" ON "transactions"("merchantName");

-- CreateIndex
CREATE INDEX "transactions_isManual_idx" ON "transactions"("isManual");

-- CreateIndex
CREATE INDEX "transactions_transactionType_idx" ON "transactions"("transactionType");

-- CreateIndex
CREATE INDEX "transactions_dateYear_dateMonth_idx" ON "transactions"("dateYear", "dateMonth");

-- CreateIndex
CREATE INDEX "transactions_teamId_category_slug_idx" ON "transactions"("teamId", "category_slug");

-- CreateIndex
CREATE INDEX "transactions_excludeFromBudget_idx" ON "transactions"("excludeFromBudget");

-- CreateIndex
CREATE UNIQUE INDEX "users_on_team_user_id_team_id_key" ON "users_on_team"("user_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_categories_slug_team_id_key" ON "transaction_categories"("slug", "team_id");

-- CreateIndex
CREATE INDEX "_BankAccountToTeam_B_index" ON "_BankAccountToTeam"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_bankConnectionId_fkey" FOREIGN KEY ("bankConnectionId") REFERENCES "BankConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_parentTransactionId_fkey" FOREIGN KEY ("parentTransactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_slug_teamId_fkey" FOREIGN KEY ("category_slug", "teamId") REFERENCES "transaction_categories"("slug", "team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_on_team" ADD CONSTRAINT "users_on_team_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_on_team" ADD CONSTRAINT "users_on_team_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_tags" ADD CONSTRAINT "customer_tags_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_tags" ADD CONSTRAINT "customer_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_tags" ADD CONSTRAINT "customer_tags_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_categories" ADD CONSTRAINT "transaction_categories_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_enrichments" ADD CONSTRAINT "transaction_enrichments_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_templates" ADD CONSTRAINT "invoice_templates_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_projects" ADD CONSTRAINT "tracker_projects_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_projects" ADD CONSTRAINT "tracker_projects_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_project_tags" ADD CONSTRAINT "tracker_project_tags_tracker_project_id_fkey" FOREIGN KEY ("tracker_project_id") REFERENCES "tracker_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_project_tags" ADD CONSTRAINT "tracker_project_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_project_tags" ADD CONSTRAINT "tracker_project_tags_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_entries" ADD CONSTRAINT "tracker_entries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "tracker_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_entries" ADD CONSTRAINT "tracker_entries_assigned_id_fkey" FOREIGN KEY ("assigned_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_entries" ADD CONSTRAINT "tracker_entries_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_reports" ADD CONSTRAINT "tracker_reports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "tracker_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_reports" ADD CONSTRAINT "tracker_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_reports" ADD CONSTRAINT "tracker_reports_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbox" ADD CONSTRAINT "inbox_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbox" ADD CONSTRAINT "inbox_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbox" ADD CONSTRAINT "inbox_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "transaction_attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_attachments" ADD CONSTRAINT "transaction_attachments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_attachments" ADD CONSTRAINT "transaction_attachments_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apps" ADD CONSTRAINT "apps_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apps" ADD CONSTRAINT "apps_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BankAccountToTeam" ADD CONSTRAINT "_BankAccountToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "BankAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BankAccountToTeam" ADD CONSTRAINT "_BankAccountToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
