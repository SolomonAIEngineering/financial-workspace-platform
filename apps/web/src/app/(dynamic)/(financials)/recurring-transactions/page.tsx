import { RecurringTransactionsView } from '../../../../components/tables/recurring-transaction/recurring-transactions-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export const metadata = {
  title: 'Recurring Transactions',
  description:
    'Manage your recurring transactions, subscriptions, and scheduled payments',
};

export default function RecurringTransactionsPage() {
  return (
    <div className="fade-in animate-in py-8 duration-500 md:py-12">
      <div className="relative mb-10 md:mb-12">
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/5 opacity-50 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-primary/10 opacity-30 blur-3xl" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-1 rounded-full bg-primary" />
            <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-gray-100 dark:to-gray-400">
              Recurring Transactions
            </h1>
          </div>

          <div className="ml-10">
            <p className="max-w-2xl text-muted-foreground">
              Track and manage your recurring transactions, subscriptions,
              bills, and scheduled payments. Monitor payment schedules and
              manage your cash flow.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-purple-500"></span>
                <span className="font-medium">Subscriptions</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span>
                <span className="font-medium">Bills</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                <span className="font-medium">Income</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/80 to-background" />
        <div className="relative z-10">
          <Suspense
            fallback={
              <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
                <Skeleton className="h-96 w-full max-w-5xl rounded-lg" />
                <div className="mt-4 animate-pulse text-sm text-muted-foreground">
                  Loading recurring transactions...
                </div>
              </div>
            }
          >
            <RecurringTransactionsView />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
