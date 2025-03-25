import { HydrateClient, trpc } from '@/trpc/server';

import type { PageProps } from '@/lib/navigation/next-types';
import SingleBankAccountClient from './page.client';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

// Define a more specific type for the parameters
type BankAccountParams = {
  id: string;
};

export default async function BankAccountPage({
  params,
}: PageProps<BankAccountParams>) {
  // Create a loading fallback component
  const LoadingFallback = (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
      <Skeleton className="h-96 w-full max-w-5xl rounded-lg" />
      <div className="mt-4 animate-pulse text-sm text-muted-foreground">
        Loading bank account details...
      </div>
    </div>
  );

  try {
    // Wait for params Promise to resolve
    const resolvedParams = await params;

    // Query the bank account by ID
    // eslint-disable-next-line testing-library/no-await-sync-queries
    const bankAccount = await trpc.bankAccounts.getById({
      id: resolvedParams.id,
    });

    if (!bankAccount) {
      return notFound();
    }

    return (
      <Suspense fallback={LoadingFallback}>
        <HydrateClient>
          <SingleBankAccountClient bankAccount={bankAccount} />
        </HydrateClient>
      </Suspense>
    );
  } catch (error) {
    // Log the error but don't expose it to the user
    console.error('Error fetching bank account:', error);

    // Redirect to 404 page
    return notFound();
  }
}
