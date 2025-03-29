-- AlterTable
ALTER TABLE "recurring_transactions" ADD COLUMN     "isNotesReadOnly" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "isNotesReadOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isUserNotesReadOnly" BOOLEAN NOT NULL DEFAULT false;
