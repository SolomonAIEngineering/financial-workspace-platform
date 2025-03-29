import { Button } from '@/registry/default/potion-ui/button';
import { ChevronDown } from 'lucide-react';

/**
 * Props interface for the TotalBalance component
 *
 * @property {string} formattedBalance - Pre-formatted balance string with
 *   currency symbol
 * @interface TotalBalanceProps
 */
interface TotalBalanceProps {
  formattedBalance: string;
}

/**
 * TotalBalance component displays the user's total account balance along with
 * currency selector and withdrawal options
 *
 * @param {TotalBalanceProps} props - Component props
 * @returns {JSX.Element} Balance display with currency selector and action
 *   buttons
 * @component
 */
export function TotalBalance({ formattedBalance }: TotalBalanceProps) {
  return (
    <div className="mb-8">
      <p className="text-lg text-gray-600 dark:text-gray-300">Total Balance</p>
      <div className="mt-2 flex items-end justify-between">
        <h2 className="text-5xl font-semibold text-indigo-950 dark:text-white">
          {formattedBalance}
        </h2>
      </div>
    </div>
  );
}
