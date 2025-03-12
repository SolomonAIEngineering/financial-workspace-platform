import type { Meta, StoryObj } from '@storybook/react';
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable
} from '@tanstack/react-table';

import { DataTableColumnHeader } from './DataTableColumnHeader';
import { DataTableProvider } from '../core/DataTableProvider';
import React from 'react';

// Define a simple data interface for our demo
interface Person {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
}

// Sample data
const data: Person[] = [
    {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        age: 35,
    },
    {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        age: 42,
    },
];

// Column helper for type safety
const columnHelper = createColumnHelper<Person>();

// Define the story metadata
const meta: Meta<typeof DataTableColumnHeader> = {
    title: 'Components/DataTable/V2/Columns/DataTableColumnHeader',
    component: DataTableColumnHeader,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A sortable column header component for data tables',
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
type Story = StoryObj<typeof DataTableColumnHeader>;

// Wrapper component to provide context
const HeaderWithContext: React.FC<{
    title: string;
    canSort?: boolean;
    showSortIndicator?: boolean;
    isSorted?: 'asc' | 'desc' | false;
}> = ({
    title,
    canSort = true,
    showSortIndicator = true,
    isSorted = false
}) => {
        // Create a column definition
        const columns = [
            columnHelper.accessor('firstName', {
                header: 'First Name',
                cell: info => info.getValue(),
                enableSorting: canSort,
            }),
        ];

        // Create a table instance
        const table = useReactTable({
            data,
            columns,
            getCoreRowModel: getCoreRowModel(),
            state: {
                sorting: isSorted ? [{ id: 'firstName', desc: isSorted === 'desc' }] : [],
            },
        });

        // Get the column
        const column = table.getHeaderGroups()[0].headers[0].column;

        return (
            <DataTableProvider table={table} columns={columns} filterFields={[]}>
                <DataTableColumnHeader
                    column={column}
                    title={title}
                    showSortIndicator={showSortIndicator}
                />
            </DataTableProvider>
        );
    };

// Basic story
export const Basic: Story = {
    render: () => <HeaderWithContext title="First Name" />,
    parameters: {
        docs: {
            description: {
                story: 'A basic sortable column header.',
            },
        },
    },
};

// Non-sortable column
export const NonSortable: Story = {
    render: () => <HeaderWithContext title="First Name" canSort={false} />,
    parameters: {
        docs: {
            description: {
                story: 'A column header that cannot be sorted.',
            },
        },
    },
};

// Sorted ascending
export const SortedAscending: Story = {
    render: () => <HeaderWithContext title="First Name" isSorted="asc" />,
    parameters: {
        docs: {
            description: {
                story: 'A column header that is sorted in ascending order.',
            },
        },
    },
};

// Sorted descending
export const SortedDescending: Story = {
    render: () => <HeaderWithContext title="First Name" isSorted="desc" />,
    parameters: {
        docs: {
            description: {
                story: 'A column header that is sorted in descending order.',
            },
        },
    },
};

// Without sort indicator
export const WithoutSortIndicator: Story = {
    render: () => <HeaderWithContext title="First Name" showSortIndicator={false} />,
    parameters: {
        docs: {
            description: {
                story: 'A column header without sort indicators.',
            },
        },
    },
}; 