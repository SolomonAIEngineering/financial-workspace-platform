import { ConnectTransactionsProvider } from '@/components/bank-connection/connect-transactions-context';
import { ReactNode } from 'react';
import { trpc } from '@/trpc/server';

export default async function BankConnectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const currentUser = (await trpc.layout.app()).currentUser;

  return (
    <ConnectTransactionsProvider defaultUserId={currentUser.id as string}>
      {children}
    </ConnectTransactionsProvider>
  );
}
