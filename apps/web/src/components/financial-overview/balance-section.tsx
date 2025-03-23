import { BalanceSectionProps } from './types';
import React from 'react';

/**
 * Renders a section displaying balance information for a bank account
 *
 * @param title - The title of the section
 * @param label - The label for the current amount
 * @param currentAmount - The current amount to display
 * @param totalAmount - The total amount to display (not used for bank accounts)
 * @param percentUsed - The percentage of the total amount that is used (not
 *   used for bank accounts)
 */
export const BalanceSection: React.FC<BalanceSectionProps> = ({
  title,
  label,
  currentAmount,
  totalAmount,
  percentUsed,
}) => (
  <div>
    <div className="mb-3 pl-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
      {title}
    </div>
    <div className="rounded-lg bg-white/70 px-4 py-4 shadow-sm dark:bg-gray-800/70">
      <div className="flex justify-between text-sm">
        <div className="text-gray-500 dark:text-gray-400">{label}</div>
        <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
          {currentAmount}
        </div>
      </div>
      <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-700/30">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  </div>
);
