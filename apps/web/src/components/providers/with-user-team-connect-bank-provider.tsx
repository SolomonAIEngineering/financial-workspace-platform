import { ConnectTransactionsProvider } from '../bank-connection/connect-transactions-context';
import { getUserAndTeamId } from '@/lib/team';

interface WithUserAndTeamProps {
  children: React.ReactNode;
}

/**
 * Server component that fetches user and team data This is the component you
 * should use in your layouts
 */
export async function WithUserAndTeamConnectBankProvider({
  children,
}: WithUserAndTeamProps) {
  const { userId, defaultTeamId } = await getUserAndTeamId();

  return (
    <ConnectTransactionsProvider
      defaultUserId={userId || ''}
      defaultTeamId={defaultTeamId || ''}
    >
      {children}
    </ConnectTransactionsProvider>
  );
}
