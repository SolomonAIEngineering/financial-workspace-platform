import { AccountType, BankAccount } from '@solomonai/prisma';
import { HydrateClient, trpc } from '@/trpc/server';

import FinancialOverviewClient from './page.client';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export default async function FinancialOverviewPage() {
  // Create a loading fallback component
  const LoadingFallback = (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
      <Skeleton className="h-96 w-full max-w-5xl rounded-lg" />
      <div className="mt-4 animate-pulse text-sm text-muted-foreground">
        Loading financial overview...
      </div>
    </div>
  );

  try {
    // Query bank accounts for the current user
    const bankAccounts = await trpc.bankAccounts.getAll();

    // partition by account type into a hashmap
    const bankAccountsByType = bankAccounts.reduce(
      (acc, account) => {
        acc[account.type] = [...(acc[account.type] || []), account];
        return acc;
      },
      {} as Record<AccountType, BankAccount[]>
    );

    return (
      <Suspense fallback={LoadingFallback}>
        <HydrateClient>
          <FinancialOverviewClient bankAccountsByType={bankAccountsByType} />
        </HydrateClient>
      </Suspense>
    );
  } catch (error) {
    // Log the error but don't expose it to the user
    console.error('Error fetching transactions:', error);

    // Fallback to render without initial data
    return (
      <Suspense fallback={LoadingFallback}>
        <HydrateClient>
          <FinancialOverviewClient />
        </HydrateClient>
      </Suspense>
    );
  }
}
