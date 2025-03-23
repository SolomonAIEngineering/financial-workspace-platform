import { PageSkeleton } from '@/components/ui/page-skeleton';
import { auth } from '@/components/auth/rsc/auth';
import { routes } from '@/lib/navigation/routes';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await auth();

  return (
    <PageSkeleton
      description="Monitor your financial health with real-time dashboards and actionable insights."
      title={`Welcome, ${currentUser?.user?.username || 'User'}`}
      breadcrumbs={[
        { href: routes.dashboard(), label: 'Dashboard' },
        { href: routes.financialOverview(), label: 'Financial Overview' },
      ]}
      className="flex min-h-screen w-full max-w-screen overflow-x-hidden"
    >
      {children}
    </PageSkeleton>
  );
}
