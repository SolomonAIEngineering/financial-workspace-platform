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
        <div className="mb-2 flex items-center gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white text-gray-800"
          >
            <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-blue-50">
              <span className="text-xs font-bold">$</span>
            </span>
            USD
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button className="rounded-lg bg-sky-100 text-sky-800 hover:bg-sky-200">
            Withdraw
          </Button>
        </div>
      </div>
    </div>
  );
}
