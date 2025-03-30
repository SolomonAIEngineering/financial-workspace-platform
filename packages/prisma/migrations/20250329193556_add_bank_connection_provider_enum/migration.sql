/*
  Warnings:

  - Changed the type of `provider` on the `BankConnection` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BankConnectionProvider" AS ENUM ('PLAID', 'TELLER', 'GOCARDLESS', 'STRIPE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SubscriptionStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "SubscriptionStatus" ADD VALUE 'TRIAL';

-- AlterTable
ALTER TABLE "BankConnection" DROP COLUMN "provider",
ADD COLUMN     "provider" "BankConnectionProvider" NOT NULL;
