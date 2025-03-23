import { Greeting } from './greeting';
import { RecentTransactions } from './recent-transaction';
import { TotalBalance } from './total-balance';
import { Transaction } from './types';
import { WalletCard } from './wallet-card';

interface AccountDetailsPanelProps {
    userName: string;
    formattedBalance: string;
    cardNumber: string;
    transactions: Transaction[];
    isLoadingTransactions: boolean;
}

export function AccountDetailsPanel({
    userName,
    formattedBalance,
    cardNumber,
    transactions,
    isLoadingTransactions
}: AccountDetailsPanelProps) {
    return (
        <div className="w-full p-8 overflow-auto no-scrollbar">
            {/* Greeting */}
            <Greeting userName={userName} />

            {/* Total Balance */}
            <TotalBalance formattedBalance={formattedBalance} />

            {/* My Wallet */}
            <WalletCard userName={userName} cardNumber={cardNumber} />

            {/* Recent Transactions */}
            <RecentTransactions
                isLoading={isLoadingTransactions}
            />
        </div>
    );
} 