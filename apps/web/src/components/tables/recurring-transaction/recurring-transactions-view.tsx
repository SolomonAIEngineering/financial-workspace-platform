"use client";

import * as React from "react";

import { filterFields, sampleRecurringTransactions } from "./constants";

import { DataTable } from "./data-table";
import { columns } from "./columns";

export function RecurringTransactionsView() {
    return (
        <DataTable
            columns={columns}
            data={sampleRecurringTransactions}
            filterFields={filterFields}
        />
    );
} 