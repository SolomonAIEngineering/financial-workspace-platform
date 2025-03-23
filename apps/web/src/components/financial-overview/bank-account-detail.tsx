import { BalanceSection } from './balance-section';
import { BankAccountCardData } from './types';
import { BankAccountDetailsSection } from './bank-account-details-section';
import { BankAccountVisual } from './bank-account-visual';
import { CreditCard } from 'lucide-react';
import React from 'react';

/** Props for the BankAccountDetail component */
interface BankAccountDetailProps {
  /** The bank account data to display details for, if any */
  account: BankAccountCardData | null;

  /** Whether the user has any bank accounts connected */
  hasAccounts: boolean;
}

/**
 * Renders detailed information about a bank account in a sidebar
 *
 * @param account - The bank account data to display details for, if any
 * @param hasAccounts - Whether the user has any bank accounts connected
 */
export const BankAccountDetail: React.FC<BankAccountDetailProps> = ({
  account,
  hasAccounts,
}) => {
  if (!hasAccounts) {
    return (
      <div className="flex h-full items-center justify-center px-6 py-10">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-800/80">
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
          <p className="font-medium text-gray-700 dark:text-gray-300">
            No bank accounts connected yet
          </p>
          <p className="mt-2 max-w-xs text-sm text-gray-500 dark:text-gray-400">
            Connect a bank account to view your account details
          </p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex h-full items-center justify-center px-6 py-10">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-800/80">
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
          <p className="font-medium text-gray-700 dark:text-gray-300">
            Select an account to view details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-sm space-y-8 lg:max-w-none">
        <div className="mb-2 text-center text-lg font-semibold text-gray-800 dark:text-gray-100">
          {account.type}
        </div>

        {/* Account Visual Representation */}
        <BankAccountVisual account={account} />

        {/* Account Details */}
        <BankAccountDetailsSection account={account} />

        {/* Balance Information */}
        <BalanceSection
          title="Account Balance"
          currentAmount={account.available}
          totalAmount={account.available}
          percentUsed={100}
          label="Available Balance"
        />
      </div>
    </div>
  );
};
