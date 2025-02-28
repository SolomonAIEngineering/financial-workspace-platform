import { redirect } from 'next/navigation';

import { isAuth } from '@/components/auth/rsc/auth';
import { LandingPage } from '@/components/marketing/landing-page';

export default async function HomePage() {
  const session = await isAuth();

  if (session) {
    redirect('/dashboard');
  }

  return <LandingPage />;
}
