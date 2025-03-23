import { LimitsSectionProps } from './types';
import React from 'react';

/**
 * Renders a section displaying limits information for a bank account with a
 * visual progress bar
 *
 * @param title - The title of the section
 * @param label - The label for the current amount
 * @param currentAmount - The current amount to display
 * @param totalAmount - The total amount to display
 * @param percentUsed - The percentage of the total amount that is used
 */
export const LimitsSection: React.FC<LimitsSectionProps> = ({
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
      <div className="mb-2 flex justify-between text-sm">
        <div className="text-gray-500 dark:text-gray-400">{label}</div>
        <div className="font-medium text-gray-700 dark:text-gray-300">
          {currentAmount}{' '}
          <span className="font-normal text-gray-400 dark:text-gray-500">
            /
          </span>{' '}
          {totalAmount}
        </div>
      </div>
      <div className="relative mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        <div
          className={`absolute inset-0 ${
            percentUsed > 80
              ? 'bg-red-400 dark:bg-red-500'
              : 'bg-green-400 dark:bg-green-500'
          } rounded-full`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>
    </div>
  </div>
);
