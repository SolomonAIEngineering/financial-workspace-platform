import { ReactNode } from 'react';
import { WithUserAndTeamConnectBankProvider } from '@/components/providers/with-user-team-connect-bank-provider';

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
