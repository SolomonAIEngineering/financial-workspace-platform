import { ChartType, DateRangeType, Transaction } from './types';
import { animationStyles, convertBankAccountsToCardData } from '@/components/financial-overview';
import { calculateMonthlyStats, hideScrollbarCSS, prepareChartData } from './utils';
import { useEffect, useState } from 'react';

import { AccountDetailsPanel } from './account-details';
import { BankAccount } from '@solomonai/prisma';
import { StatisticsPanel } from './statistic-panel';
import { api } from '@/trpc/react';
import { useCurrentUser } from '@/components/auth/useCurrentUser';

interface SingleBankAccountViewProps {
    bankAccount: BankAccount;
}

export function SingleBankAccountView({ bankAccount }: SingleBankAccountViewProps) {
    const user = useCurrentUser();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
    const [activeChartType, setActiveChartType] = useState<ChartType>('bar');
    const [dateRange, setDateRange] = useState<DateRangeType>('30d');

    // Convert bank account data to the format expected by our components
    const accountType = bankAccount.type;
    // Create a proper Record<AccountType, BankAccount[]> with type assertion
    const accountsRecord = {} as Record<typeof accountType, BankAccount[]>;
    accountsRecord[accountType] = [bankAccount];

    const bankAccountCardData = convertBankAccountsToCardData(accountsRecord)[0];

    // Format total balance
    const formattedBalance = `$${(
        bankAccount.availableBalance || 0
    ).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

    // Get user's name or use default
    const userName = user?.name?.split(' ')[0] || 'User';

    // Fetch real transactions 
    const transactionsQuery = api.bankAccounts.getTransactions.useQuery(
        {
            accountId: bankAccount.id,
            limit: 100,
            offset: 0
        },
        {
            enabled: !!bankAccount.id
        }
    );

    // Process transactions when data changes
    useEffect(() => {
        if (transactionsQuery.status === 'pending') {
            setIsLoadingTransactions(true);
        } else if (transactionsQuery.status === 'error') {
            console.error('Failed to fetch transactions:', transactionsQuery.error);
            setIsLoadingTransactions(false);
        } else if (transactionsQuery.data?.transactions) {
            // Convert to our Transaction type format
            const formattedTransactions: Transaction[] = transactionsQuery.data.transactions.map(tx => ({
                id: tx.id,
                date: new Date(tx.date),
                description: tx.name || tx.merchantName || 'Unknown',
                amount: tx.amount,
                category: tx.category || tx.customCategory || 'Uncategorized',
                status: tx.pending ? 'pending' : 'completed'
            }));

            setTransactions(formattedTransactions);
            setIsLoadingTransactions(false);
        }
    }, [transactionsQuery.status, transactionsQuery.data, transactionsQuery.error]);

    // Process transaction data for the chart
    const chartData = prepareChartData(transactions);

    // Calculate total spending, income, and balance this month
    const monthlyStats = calculateMonthlyStats(transactions);

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Apply animation styles */}
            <style dangerouslySetInnerHTML={{ __html: animationStyles }} />

            {/* Apply hide scrollbar styles */}
            <style dangerouslySetInnerHTML={{ __html: hideScrollbarCSS }} />

            {/* Main Content */}
            <div className="flex-grow overflow-hidden">
                <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
                    <div className="mx-auto w-full  h-full flex">
                        {/* Left Panel - Account Details */}
                        <AccountDetailsPanel
                            userName={userName}
                            formattedBalance={formattedBalance}
                            cardNumber={bankAccountCardData.number}
                            transactions={transactions}
                            isLoadingTransactions={isLoadingTransactions}
                        />

                        {/* Right Panel - Statistics */}
                        <StatisticsPanel
                            transactions={transactions}
                            isLoadingTransactions={isLoadingTransactions}
                            activeChartType={activeChartType}
                            setActiveChartType={setActiveChartType}
                            dateRange={dateRange}
                            setDateRange={setDateRange}
                            chartData={chartData}
                            monthlyStats={monthlyStats}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 