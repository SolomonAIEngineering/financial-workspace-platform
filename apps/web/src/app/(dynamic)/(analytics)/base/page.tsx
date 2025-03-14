import { data, filterFields } from "./constants";

import { DataTable } from "./data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { columns } from "./columns";

export const metadata = {
  title: "Transactions",
  description: "View and manage your financial transactions",
};

export default function TransactionsPage() {
  return (
    <div className="py-8 md:py-12 animate-in fade-in duration-500">
      <div className="relative mb-10 md:mb-12">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
              Transactions
            </h1>
          </div>

          <div className="ml-10">
            <p className="text-muted-foreground max-w-2xl">
              View and manage all your financial transactions across accounts. Filter, sort, and analyze your spending patterns.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="rounded-lg bg-muted/50 px-3 py-1.5 text-sm flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                <span className="font-medium">Income</span>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-1.5 text-sm flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                <span className="font-medium">Expenses</span>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-1.5 text-sm flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="font-medium">Transfers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-background/80 to-background pointer-events-none" />
        <div className="relative z-10">
          <Suspense fallback={
            <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
              <Skeleton className="w-full max-w-5xl h-96 rounded-lg" />
              <div className="mt-4 text-sm text-muted-foreground animate-pulse">Loading transactions...</div>
            </div>
          }>
            <DataTable data={data} columns={columns} filterFields={filterFields} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
