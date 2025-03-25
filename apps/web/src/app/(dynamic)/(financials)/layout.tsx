import { MiniSidebar } from '@/components/sidebar/mini-sidebar';
import { WithUserAndTeamConnectBankProvider } from '@/components/providers/with-user-team-connect-bank-provider';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <WithUserAndTeamConnectBankProvider>
      <div className="flex min-h-screen">
        <div className="sticky top-0 z-30 h-screen flex-shrink-0">
          <MiniSidebar />
        </div>
        <div className="flex-1 overflow-auto px-[2%]">{children}</div>
      </div>
    </WithUserAndTeamConnectBankProvider>
  );
}
