import {
  AccountType,
  BankAccount
} from '@solomonai/prisma';

import { z } from 'zod';

/** Zod schema for bank account card data */
export const BankAccountCardSchema = z.object({
  id: z.string(),
  type: z.string(),
  number: z.string(),
  name: z.string(),
  limit: z.string(),
  available: z.string(),
  status: z.enum(['Active', 'Blocked']),
  isPhysical: z.boolean(),
  expDate: z.string(),
  cvc: z.string(),
  spentThisMonth: z.string(),
  spentLimit: z.string(),
  spentPercentage: z.number(),
  withdrawnThisMonth: z.string(),
  withdrawnLimit: z.string(),
  withdrawnPercentage: z.number(),
});

/** Type for bank account card data */
export type BankAccountCardData = z.infer<typeof BankAccountCardSchema>;

/** Props for the bank account item component */
export type BankAccountItemProps = {
  account: BankAccountCardData;
  isSelected: boolean;
  onSelect: (account: BankAccountCardData) => void;
};

/** Props for the balance section component */
export type BalanceSectionProps = {
  title: string;
  label: string;
  currentAmount: string;
  totalAmount: string;
  percentUsed: number;
};

/** Props for the limits section component */
export type LimitsSectionProps = {
  title: string;
  label: string;
  currentAmount: string;
  totalAmount: string;
  percentUsed: number;
};

/**
 * Helper function to convert bank accounts to bank account card data
 *
 * @param bankAccountsByType - Record of bank accounts by account type
 * @returns Array of bank account card data
 */
export const convertBankAccountsToCardData = (
  bankAccountsByType: Record<AccountType, BankAccount[]>
): BankAccountCardData[] => {
  const accountCards: BankAccountCardData[] = [];

  // Process each account type and its accounts
  Object.entries(bankAccountsByType).forEach(([type, accounts]) => {
    accounts.forEach((account) => {
      // Use actual data from the account with proper null checks
      const isPhysical =
        account.subtype === 'CHECKING' || account.subtype === 'SAVINGS';
      const last4 = account.accountNumber?.slice(-4) || account.mask || '****';

      // Format account balance for display
      const availableBalance = account.availableBalance || 0;
      const limit = account.limit || 20000; // Default limit if not provided
      const formattedLimit = `$${availableBalance.toLocaleString()} / $${limit.toLocaleString()}`;

      // Calculate spending percentages based on real values when possible
      const monthlySpending = account.monthlySpending || 0;
      const monthlyIncome = account.monthlyIncome || 0;
      const spendingPercentage =
        limit > 0 ? (monthlySpending / limit) * 100 : 0;
      // Cap percentage at 100 for display purposes
      const cappedSpendingPercentage = Math.min(spendingPercentage, 100);

      // Use a random value for withdrawn percentage if not available
      const withdrawnPercentage = Math.min(
        ((monthlySpending * 0.15) / limit) * 100,
        100
      );

      accountCards.push({
        id: account.id,
        type: account.subtype ? String(account.subtype) : String(type),
        number: last4,
        name: account.displayName || account.name,
        limit: formattedLimit,
        available: `$${availableBalance.toLocaleString()}`,
        status: account.status === 'ACTIVE' ? 'Active' : 'Blocked',
        isPhysical,
        expDate: '12/24', // This might need to come from a separate card entity
        cvc: '***', // Security info - always masked
        spentThisMonth: `$${monthlySpending.toLocaleString()}`,
        spentLimit: `$${limit.toLocaleString()}`,
        spentPercentage: cappedSpendingPercentage,
        withdrawnThisMonth: `$${(monthlySpending * 0.15).toLocaleString()}`,
        withdrawnLimit: `$${limit.toLocaleString()}`,
        withdrawnPercentage: withdrawnPercentage,
      });
    });
  });

  return accountCards;
};
