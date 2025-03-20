-- DropForeignKey
ALTER TABLE "recurring_transactions" DROP CONSTRAINT "recurring_transactions_bankAccountId_fkey";

-- AddForeignKey
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
