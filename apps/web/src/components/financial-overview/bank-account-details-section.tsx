import { BankAccountCardData } from './types';
import React from 'react';

/** Props for the BankAccountDetailsSection component */
interface BankAccountDetailsSectionProps {
  /** The bank account data to display details for */
  account: BankAccountCardData;
}

/**
 * Renders a section displaying detailed information about a bank account
 *
 * @param account - The bank account data to display details for
 */
export const BankAccountDetailsSection: React.FC<
  BankAccountDetailsSectionProps
> = ({ account }) => {
  // Generate a fake routing number as a placeholder
  const routingNumber = '07200' + account.number;

  return (
    <div>
      <div className="mb-3 pl-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
        Account Details
      </div>
      <div className="rounded-lg bg-white/70 shadow-sm dark:bg-gray-800/70">
        <ul>
          <li className="flex items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-gray-700/30">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Account Name
            </div>
            <div className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
              {account.name}
            </div>
          </li>
          <li className="flex items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-gray-700/30">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Account Type
            </div>
            <div className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
              {account.type}
            </div>
          </li>
          <li className="flex items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-gray-700/30">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Account Number
            </div>
            <div className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
              ****{account.number}
            </div>
          </li>
          <li className="flex items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-gray-700/30">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Routing Number
            </div>
            <div className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
              {routingNumber}
            </div>
          </li>
          <li className="flex items-center justify-between px-4 py-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Status
            </div>
            <div className="flex items-center whitespace-nowrap">
              <div
                className={`h-2 w-2 rounded-full ${account.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}
              />
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {account.status}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};
