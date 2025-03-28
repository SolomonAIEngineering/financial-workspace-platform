import { ClientTransactionsTable } from './page.client';
import { HydrateClient } from '@/trpc/server';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { trpc } from '@/trpc/server';

export const metadata = {
  title: 'Transactions',
  description: 'View and manage your financial transactions',
};

// Extract the page UI to avoid duplication
function TransactionsPageUI({ children }: { children: React.ReactNode }) {
  return (
    <div className="fade-in animate-in py-8 duration-500 md:py-12">
      <div className="relative mb-10 md:mb-12">
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/5 opacity-50 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-primary/10 opacity-30 blur-3xl" />
        <div className="relative z-10 space-y-2">
          <div className="ml-10">
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                <span className="font-medium">Income</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span>
                <span className="font-medium">Expenses</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                <span className="font-medium">Transfers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/80 to-background" />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

export default async function TransactionsPage() {
  // Create a loading fallback component
  const LoadingFallback = (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
      <Skeleton className="h-96 w-full max-w-5xl rounded-lg" />
      <div className="mt-4 animate-pulse text-sm text-muted-foreground">
        Loading transactions...
      </div>
    </div>
  );

  try {
    // Query transactions with default pagination
    const transactionsData = await trpc.transactions.getTransactions({
      page: 1,
      limit: 100,
    });

    return (
      <TransactionsPageUI>
        <Suspense fallback={LoadingFallback}>
          <HydrateClient>
            <ClientTransactionsTable initialData={transactionsData} />
          </HydrateClient>
        </Suspense>
      </TransactionsPageUI>
    );
  } catch (error) {
    // Log the error but don't expose it to the user
    console.error('Error fetching transactions:', error);

    // Fallback to render without initial data
    return (
      <TransactionsPageUI>
        <Suspense fallback={LoadingFallback}>
          <HydrateClient>
            <ClientTransactionsTable />
          </HydrateClient>
        </Suspense>
      </TransactionsPageUI>
    );
  }
}
