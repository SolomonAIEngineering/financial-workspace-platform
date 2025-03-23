import { ChartType, DateRangeType, Transaction } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/default/potion-ui/tabs";
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
    const [activeTab, setActiveTab] = useState<string>("account");

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

    useEffect(() => {
        if (transactionsQuery.isLoading) {
            setIsLoadingTransactions(true);
        } else if (transactionsQuery.isSuccess) {
            // Transform API transactions to match our Transaction type
            const transformedTransactions = transactionsQuery.data?.transactions.map(tx => ({
                id: tx.id,
                date: new Date(tx.date),
                description: tx.name || tx.merchantName || 'Unnamed transaction',
                amount: tx.amount,
                category: tx.category || tx.customCategory || 'Uncategorized',
                status: tx.pending ? 'pending' : 'completed'
            } as Transaction)) || [];

            setTransactions(transformedTransactions);
            setIsLoadingTransactions(false);
        }
    }, [transactionsQuery.isLoading, transactionsQuery.isSuccess, transactionsQuery.data]);

    // Prepare chart data
    const chartData = prepareChartData(transactions, dateRange);

    // Calculate monthly statistics
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
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full h-full flex flex-col"
                    >
                        <div className="px-4 pt-4">
                            <TabsList className="grid w-[400px] grid-cols-2">
                                <TabsTrigger value="account">Account Details</TabsTrigger>
                                <TabsTrigger value="statistics">Statistics</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-grow overflow-auto">
                            <TabsContent value="account" className="h-full">
                                <AccountDetailsPanel
                                    userName={userName}
                                    formattedBalance={formattedBalance}
                                    cardNumber={bankAccountCardData.number}
                                    transactions={transactions}
                                    isLoadingTransactions={isLoadingTransactions}
                                />
                            </TabsContent>

                            <TabsContent value="statistics" className="h-full">
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
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
} 