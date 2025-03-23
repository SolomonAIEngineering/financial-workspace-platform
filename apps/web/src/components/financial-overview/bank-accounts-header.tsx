import { ConnectTransactionsButton } from '@/components/bank-connection/connect-transactions-button';
import React from 'react';

/** Props for the BankAccountsHeader component */
interface BankAccountsHeaderProps {
  /** The ID of the user to connect bank accounts to */
  userId: string;
}

/**
 * Renders a header for the bank accounts section with a button to connect bank
 * accounts
 *
 * @param userId - The ID of the user to connect bank accounts to
 */
export const BankAccountsHeader: React.FC<BankAccountsHeaderProps> = ({
  userId,
}) => (
  <div className="mb-5 sm:flex sm:items-center sm:justify-between">
    <div className="mb-4 sm:mb-0">
      <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">
        Bank Accounts
      </h1>
    </div>

    <ConnectTransactionsButton
      userId={userId}
      buttonProps={{
        variant: 'secondary',
        size: 'xs',
        className:
          'btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white',
      }}
    >
      Add Bank Account
    </ConnectTransactionsButton>
  </div>
);
