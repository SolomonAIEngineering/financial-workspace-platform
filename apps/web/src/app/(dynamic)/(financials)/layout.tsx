import { ConnectTransactionsProvider } from '@/components/bank-connection/connect-transactions-context';
import { MiniSidebar } from '@/components/sidebar/mini-sidebar';
import { auth } from '@/components/auth/rsc/auth';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await auth();

  return (
    <ConnectTransactionsProvider defaultUserId={currentUser?.user?.id}>
      <div className="flex min-h-screen">
        <div className="sticky top-0 z-30 h-screen flex-shrink-0">
          <MiniSidebar />
        </div>
        <div className="flex-1 overflow-auto px-[2%]">{children}</div>
      </div>
    </ConnectTransactionsProvider>
  );
}

