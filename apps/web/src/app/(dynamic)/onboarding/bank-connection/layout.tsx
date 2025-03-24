import { ConnectTransactionsProvider } from '@/components/bank-connection/connect-transactions-context';
import { ReactNode } from 'react';
import { WithUserAndTeamConnectBankProvider } from '@/components/providers/with-user-team-connect-bank-provider';
import { getUserAndTeamId } from '@/lib/team';
import { trpc } from '@/trpc/server';

export default async function BankConnectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WithUserAndTeamConnectBankProvider>
      {children}
    </WithUserAndTeamConnectBankProvider>
  );
}
