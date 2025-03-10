import { auth, isAuth } from '@/components/auth/rsc/auth';

import { AIProvider } from '@/components/ai/ai-provider';
import { ConnectTransactionsProvider } from '@/components/bank-connection/connect-transactions-context';
import { DocumentPlate } from '@/components/editor/providers/document-plate';
import type { LayoutProps } from '@/lib/navigation/next-types';
import { Main } from '@/app/(dynamic)/(main)/main';
import { MiniSidebar } from '@/components/sidebar/mini-sidebar';
import { Panels } from '@/components/layouts/panels';
import { PublicPlate } from '@/components/editor/providers/public-plate';
import { RightPanelType } from '@/hooks/useResizablePanel';
import { cookies } from 'next/headers';
import { getCookie } from 'cookies-next/server';

export default async function MainLayout({ children }: LayoutProps) {
  const session = await isAuth();
  const currentUser = await auth();

  const PlateProvider = session ? DocumentPlate : PublicPlate;

  const navCookie = await getCookie('nav', { cookies });
  const rightPanelTypeCookie = await getCookie('right-panel-type', {
    cookies,
  });

  const initialLayout = navCookie
    ? JSON.parse(navCookie)
    : { leftSize: 300, rightSize: 240 };

  const initialRightPanelType = rightPanelTypeCookie
    ? JSON.parse(rightPanelTypeCookie)
    : RightPanelType.comment;

  return (
    <div className="flex h-full min-h-dvh dark:bg-[#1F1F1F]">
      <PlateProvider>
        <AIProvider>
          <ConnectTransactionsProvider defaultUserId={currentUser?.user?.id}>
            <MiniSidebar />
            <Panels
              initialLayout={initialLayout}
              initialRightPanelType={initialRightPanelType}
            >
              <Main>{children}</Main>
            </Panels>
          </ConnectTransactionsProvider>
        </AIProvider>
      </PlateProvider>
    </div>
  );
}
