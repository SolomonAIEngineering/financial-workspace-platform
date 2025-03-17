'use client';

import { DataTable } from '@/components/tables/transaction/data-table';
import { columns } from '@/components/tables/transaction/columns';
import { data } from '@/components/tables/transaction/constants';
import { filterFields } from '@/components/tables/transaction/constants';

export function ClientTransactionsTable() {
    return (
        <DataTable
            data={data}
            columns={columns}
            filterFields={filterFields}
        />
    );
} 