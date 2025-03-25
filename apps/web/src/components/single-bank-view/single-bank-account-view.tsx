import { ChartType, DateRangeType, Transaction } from './types';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/registry/default/potion-ui/tabs';
import {
  animationStyles,
  convertBankAccountsToCardData,
} from '@/components/financial-overview';
import {
  calculateMonthlyStats,
  hideScrollbarCSS,
  prepareChartData,
} from './utils';
import { useEffect, useState } from 'react';

import { AccountDetailsPanel } from './account-details';
import { BankAccount } from '@solomonai/prisma';
import { StatisticsPanel } from './statistic-panel';
import { api } from '@/trpc/react';
import { useCurrentUser } from '@/components/auth/useCurrentUser';

/**
 * Props interface for the SingleBankAccountView component.
 *
 * @property {BankAccount} bankAccount - The bank account data to display in the
 *   view.
 * @interface SingleBankAccountViewProps
 */
interface SingleBankAccountViewProps {
  bankAccount: BankAccount;
}

/**
 * SingleBankAccountView component provides a detailed view of a single bank
 * account. It displays account details, transactions, and statistical
 * visualizations.
 *
 * @param {SingleBankAccountViewProps} props - The component props
 * @returns {JSX.Element} Rendered component with tabs for account details and
 *   statistics
 * @component
 */
export function SingleBankAccountView({
  bankAccount,
}: SingleBankAccountViewProps) {
  const user = useCurrentUser();

  /**
   * State for storing bank account transactions
   *
   * @type {[
   *   Transaction[],
   *   React.Dispatch<React.SetStateAction<Transaction[]>>,
   * ]}
   */
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  /**
   * State for tracking transaction loading status
   *
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  /**
   * State for tracking the active chart type (bar, line, etc.)
   *
   * @type {[ChartType, React.Dispatch<React.SetStateAction<ChartType>>]}
   */
  const [activeChartType, setActiveChartType] = useState<ChartType>('bar');

  /**
   * State for tracking the selected date range for filtering data
   *
   * @type {[
   *   DateRangeType,
   *   React.Dispatch<React.SetStateAction<DateRangeType>>,
   * ]}
   */
  const [dateRange, setDateRange] = useState<DateRangeType>('30d');

  /**
   * State for tracking the active tab (account or statistics)
   *
   * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
   */
  const [activeTab, setActiveTab] = useState<string>('account');

  // Convert bank account data to the format expected by our components
  const accountType = bankAccount.type;

  /**
   * Create a proper Record with account type as key and bank account array as
   * value
   *
   * @type {Record<string, BankAccount[]>}
   */
  const accountsRecord = {} as Record<typeof accountType, BankAccount[]>;
  accountsRecord[accountType] = [bankAccount];

  /** Formatted bank account data ready for display in UI components */
  const bankAccountCardData = convertBankAccountsToCardData(accountsRecord)[0];

  /**
   * Formatted balance string with currency symbol and proper decimal places
   *
   * @type {string}
   */
  const formattedBalance = `$${(
    bankAccount.availableBalance || 0
  ).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  /**
   * User's first name extracted from full name or default value
   *
   * @type {string}
   */
  const userName = user?.name?.split(' ')[0] || 'User';

  /** TRPC query to fetch transactions for the current bank account */
  const transactionsQuery = api.bankAccounts.getTransactions.useQuery(
    {
      accountId: bankAccount.id,
      limit: 100,
      offset: 0,
    },
    {
      enabled: !!bankAccount.id,
    }
  );

  /**
   * Effect hook to process transaction data when it's loaded from the API
   * Transforms API transaction format to the component's internal Transaction
   * type
   */
  useEffect(() => {
    if (transactionsQuery.isLoading) {
      setIsLoadingTransactions(true);
    } else if (transactionsQuery.isSuccess) {
      // Transform API transactions to match our Transaction type
      const transformedTransactions =
        transactionsQuery.data?.transactions.map(
          (tx) =>
            ({
              id: tx.id,
              date: new Date(tx.date),
              description: tx.name || tx.merchantName || 'Unnamed transaction',
              amount: tx.amount,
              category: tx.category || tx.customCategory || 'Uncategorized',
              status: tx.pending ? 'pending' : 'completed',
            }) as Transaction
        ) || [];

      setTransactions(transformedTransactions);
      setIsLoadingTransactions(false);
    }
  }, [
    transactionsQuery.isLoading,
    transactionsQuery.isSuccess,
    transactionsQuery.data,
  ]);

  /**
   * Prepared chart data based on transactions and selected date range
   *
   * @type {object}
   */
  const chartData = prepareChartData(transactions, dateRange);

  /**
   * Calculated monthly statistics from transaction data
   *
   * @type {object}
   */
  const monthlyStats = calculateMonthlyStats(transactions);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Apply animation styles */}
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />

      {/* Apply hide scrollbar styles */}
      <style dangerouslySetInnerHTML={{ __html: hideScrollbarCSS }} />

      {/* Main Content */}
      <div className="flex-grow overflow-hidden">
        <div className="h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex h-full w-full flex-col"
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
