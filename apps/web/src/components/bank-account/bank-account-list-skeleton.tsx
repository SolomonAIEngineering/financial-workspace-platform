import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * BankAccountListSkeleton Component
 *
 * A loading placeholder component that displays a skeleton UI while bank
 * account data is being fetched. This component mimics the structure of the
 * BankAccountList component to provide a smooth loading experience and reduce
 * layout shift when the actual data loads.
 *
 * The skeleton includes:
 *
 * 1. Two bank connection skeletons, each with two account skeletons
 * 2. A manual accounts section skeleton with one account
 *
 * This provides a realistic preview of the content before it loads, improving
 * perceived performance and user experience by indicating that content is
 * loading rather than simply showing a blank space.
 *
 * @example
 *   // Used directly in a loading state
 *   {
 *     isLoading ? <BankAccountListSkeleton /> : <BankAccountList />;
 *   }
 *
 * @example
 *   // Used with Suspense
 *   <Suspense fallback={<BankAccountListSkeleton />}>
 *     <BankAccountList />
 *   </Suspense>;
 *
 * @returns {JSX.Element} A skeleton UI representation of the bank account list
 * @component
 */
export function BankAccountListSkeleton() {
  return (
    <div className="space-y-6 px-6">
      {Array.from({ length: 2 }, (_, bankIndex) => (
        <div key={`bank-${bankIndex}`} className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="ml-4 space-y-3 pl-6">
            {Array.from({ length: 2 }, (_, accountIndex) => (
              <div
                key={`account-${bankIndex}-${accountIndex}`}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Manual accounts section skeleton */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 1 }, (_, index) => (
            <div
              key={`manual-${index}`}
              className="flex items-center justify-between rounded-md border p-4"
            >
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
