import { PageSkeleton } from "@/components/ui/page-skeleton";
import { routes } from "@/lib/navigation/routes";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PageSkeleton
      description="View and manage all your recurring financial transactions across accounts.
              Filter, sort, and analyze your spending patterns."
      title="Recurring Transactions"
      breadcrumbs={[
        { href: routes.dashboard(), label: 'Dashboard' },
        { href: routes.recurringTransactions(), label: 'Recurring Transactions' },
      ]}
      className="flex min-h-screen w-full max-w-screen overflow-x-hidden"
    >
      {children}
    </PageSkeleton>
  );
}
