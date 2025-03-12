import {
    ColumnDef,
    createColumnHelper,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable
} from '@tanstack/react-table';
import type { Meta, StoryObj } from '@storybook/react';

import { DataTablePagination } from './DataTablePagination';
import { DataTableProvider } from '../core/DataTableProvider';
import React from 'react';

// Define a simple data interface for our demo
interface Person {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    visits: number;
    status: string;
}

// Generate more sample data to demonstrate pagination
const generateData = (count: number): Person[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: `${i + 1}`,
        firstName: `First${i + 1}`,
        lastName: `Last${i + 1}`,
        age: 20 + (i % 50),
        visits: i * 2,
        status: i % 2 === 0 ? 'Active' : 'Inactive',
    }));
};

// Sample data with 100 records
const data = generateData(100);

// Column helper for type safety
const columnHelper = createColumnHelper<Person>();

// Column definitions
const columns = [
    columnHelper.accessor('firstName', {
        header: 'First Name',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('lastName', {
        header: 'Last Name',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('age', {
        header: 'Age',
        cell: info => info.getValue(),
    }),
];

// Define the story metadata
const meta: Meta<typeof DataTablePagination> = {
    title: 'Components/DataTable/V2/Pagination/DataTablePagination',
    component: DataTablePagination,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A pagination component for data tables with page size selection and navigation',
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="border rounded p-4">
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof DataTablePagination>;

// Wrapper component to provide context
const PaginationWithContext: React.FC<{
    pageSizeOptions?: number[];
    showEdgeButtons?: boolean;
    rowsPerPageText?: string;
    pageCountText?: string;
    initialPageSize?: number;
}> = ({
    pageSizeOptions,
    showEdgeButtons,
    rowsPerPageText,
    pageCountText,
    initialPageSize = 10
}) => {
        // Create a table instance
        const table = useReactTable({
            data,
            columns,
            getCoreRowModel: getCoreRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            initialState: {
                pagination: {
                    pageSize: initialPageSize,
                    pageIndex: 0,
                },
            },
        });

        return (
            <DataTableProvider
                table={table}
                columns={columns as ColumnDef<Person, string>[]}
                filterFields={[]}
                initialState={{
                    pageSize: initialPageSize,
                    pageIndex: 0,
                }}
            >
                <div className="space-y-4">
                    <div className="border p-4 rounded">
                        <p className="text-sm mb-2">Current Page: {table.getState().pagination.pageIndex + 1}</p>
                        <p className="text-sm mb-2">Page Size: {table.getState().pagination.pageSize}</p>
                        <p className="text-sm">Total Pages: {table.getPageCount()}</p>
                    </div>
                    <DataTablePagination
                        pageSizeOptions={pageSizeOptions}
                        showEdgeButtons={showEdgeButtons}
                        rowsPerPageText={rowsPerPageText}
                        pageCountText={pageCountText}
                    />
                </div>
            </DataTableProvider>
        );
    };

// Basic story
export const Basic: Story = {
    render: () => <PaginationWithContext />,
    parameters: {
        docs: {
            description: {
                story: 'The basic pagination component with default settings.',
            },
        },
    },
};

// Custom page size options
export const CustomPageSizeOptions: Story = {
    render: () => <PaginationWithContext pageSizeOptions={[5, 15, 25, 50, 100]} initialPageSize={15} />,
    parameters: {
        docs: {
            description: {
                story: 'Pagination with custom page size options.',
            },
        },
    },
};

// Without edge buttons
export const WithoutEdgeButtons: Story = {
    render: () => <PaginationWithContext showEdgeButtons={false} />,
    parameters: {
        docs: {
            description: {
                story: 'Pagination without the "Go to first page" and "Go to last page" buttons.',
            },
        },
    },
};

// Custom text
export const CustomText: Story = {
    render: () => (
        <PaginationWithContext
            rowsPerPageText="Items per view"
            pageCountText="Viewing page 1 of 10"
        />
    ),
    parameters: {
        docs: {
            description: {
                story: 'Pagination with custom text for labels.',
            },
        },
    },
}; 