import { Greeting } from './greeting';
import { RecentTransactions } from './recent-transaction';
import { TotalBalance } from './total-balance';
import { Transaction } from './types';
import { WalletCard } from './wallet-card';

/**
 * Props interface for the AccountDetailsPanel component
 *
 * @property {string} userName - The user's first name to display in greeting
 * @property {string} formattedBalance - Pre-formatted balance string with
 *   currency symbol
 * @property {string} cardNumber - The card number to display on wallet card
 * @property {Transaction[]} transactions - Array of transaction data
 * @property {boolean} isLoadingTransactions - Flag indicating if transactions
 *   are still loading
 * @interface AccountDetailsPanelProps
 */
interface AccountDetailsPanelProps {
  userName: string;
  formattedBalance: string;
  cardNumber: string;
  transactions: Transaction[];
  isLoadingTransactions: boolean;
}

/**
 * AccountDetailsPanel component displays personal account information including
 * greeting, balance, wallet card and recent transactions
 *
 * @param {AccountDetailsPanelProps} props - Component props
 * @returns {JSX.Element} Panel with account details and recent transactions
 * @component
 */
export function AccountDetailsPanel({
  userName,
  formattedBalance,
  cardNumber,
  transactions,
  isLoadingTransactions,
}: AccountDetailsPanelProps) {
  return (
    <div className="no-scrollbar w-full overflow-auto md:py-[4%] md:p-[1%]">
      {/* Greeting */}
      <Greeting userName={userName} />

      {/* Total Balance */}
      <TotalBalance formattedBalance={formattedBalance} />

      {/* My Account */}
      <WalletCard userName={userName} cardNumber={cardNumber} />

      {/* Recent Transactions */}
      <RecentTransactions isLoading={isLoadingTransactions} />
    </div>
  );
}
