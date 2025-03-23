import React, { useState } from 'react';

/** Type for account filter options */
export type AccountFilterOption = 'all' | 'checking' | 'savings';

/** Props for the AccountFilter component */
interface AccountFilterProps {
  /**
   * Callback function called when the filter changes
   *
   * @param filter - The selected filter option
   */
  onFilterChange: (filter: AccountFilterOption) => void;
}

/**
 * Renders a filter component for bank accounts
 *
 * @param onFilterChange - Callback function for filter changes
 */
export const AccountFilter: React.FC<AccountFilterProps> = ({
  onFilterChange,
}) => {
  const [activeFilter, setActiveFilter] = useState<AccountFilterOption>('all');

  const handleFilterChange = (filter: AccountFilterOption) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  return (
    <div className="mb-5">
      <ul className="-m-1 flex flex-wrap">
        <li className="m-1">
          <button
            className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-sm leading-5 font-medium transition ${
              activeFilter === 'all'
                ? 'border-transparent bg-gray-900 text-white shadow-sm dark:bg-gray-100 dark:text-gray-800'
                : 'border-gray-200 bg-white text-gray-500 shadow-sm hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600'
            }`}
            onClick={() => handleFilterChange('all')}
          >
            All Accounts
          </button>
        </li>
        <li className="m-1">
          <button
            className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-sm leading-5 font-medium transition ${
              activeFilter === 'checking'
                ? 'border-transparent bg-gray-900 text-white shadow-sm dark:bg-gray-100 dark:text-gray-800'
                : 'border-gray-200 bg-white text-gray-500 shadow-sm hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600'
            }`}
            onClick={() => handleFilterChange('checking')}
          >
            Checking Accounts
          </button>
        </li>
        <li className="m-1">
          <button
            className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-sm leading-5 font-medium transition ${
              activeFilter === 'savings'
                ? 'border-transparent bg-gray-900 text-white shadow-sm dark:bg-gray-100 dark:text-gray-800'
                : 'border-gray-200 bg-white text-gray-500 shadow-sm hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600'
            }`}
            onClick={() => handleFilterChange('savings')}
          >
            Savings Accounts
          </button>
        </li>
      </ul>
    </div>
  );
};
