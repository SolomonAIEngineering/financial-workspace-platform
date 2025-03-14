import { data, filterFields } from "./constants";

import { DataTable } from "./data-table";
import { Skeleton } from "./skeleton";
import { Suspense } from "react";
import { columns } from "./columns";

export const metadata = {
  title: "Transactions",
  description: "View and manage your financial transactions",
};

export default function TransactionsPage() {
  return (
    <div className="py-10 hide-scrollbar">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          View and manage all your financial transactions across accounts
        </p>
      </div>
      <Suspense fallback={<Skeleton />}>
        <DataTable data={data} columns={columns} filterFields={filterFields} />
      </Suspense>
    </div>
  );
}
