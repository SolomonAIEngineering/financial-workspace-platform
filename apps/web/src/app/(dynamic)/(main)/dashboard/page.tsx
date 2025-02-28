import { redirect } from 'next/navigation';

import { isAuth } from '@/components/auth/rsc/auth';
import { HydrateClient, trpc } from '@/trpc/server';

import { Home } from './home';

export default async function DashboardPage() {
  const session = await isAuth();

  if (!session) {
    redirect('/');
  }

  // Prefetch documents for the authenticated user
  void trpc.document.documents.prefetch({});

  return (
    <HydrateClient>
      <Home />
    </HydrateClient>
  );
}
