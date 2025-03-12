import type { Meta, StoryObj } from '@storybook/react';

import { DataTable } from './DataTable';
import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { ColumnFiltersState, SortingState } from '@tanstack/react-table';

const meta: Meta<typeof DataTable> = {
    title: 'Components/DataTable/V2',
    component: DataTable,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'A comprehensive data table component that combines all data table subcomponents. ' +
                    'Provides sorting, filtering, pagination, and customization capabilities.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTable<Product, any>>;

// Sample data interface
interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: 'available' | 'low' | 'out_of_stock';
    createdAt: Date;
}

// Sample data
const data: Product[] = Array.from({ length: 50 }, (_, index) => ({
    id: `product-${index + 1}`,
    name: `Product ${index + 1}`,
    category: index % 3 === 0 ? 'Electronics' : index % 3 === 1 ? 'Clothing' : 'Food',
    price: Math.floor(Math.random() * 1000) + 10,
    stock: Math.floor(Math.random() * 100),
    status: index % 3 === 0 ? 'available' : index % 3 === 1 ? 'low' : 'out_of_stock',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
}));

// Column helper
const columnHelper = createColumnHelper<Product>();

// Columns
const columns = [
    columnHelper.accessor('id', {
        header: 'ID',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('name', {
        header: 'Name',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('category', {
        header: 'Category',
        cell: info => info.getValue(),
        filterFn: 'equals',
    }),
    columnHelper.accessor('price', {
        header: 'Price',
        cell: info => `$${info.getValue()}`,
        filterFn: 'inNumberRange',
    }),
    columnHelper.accessor('stock', {
        header: 'Stock',
        cell: info => info.getValue(),
        filterFn: 'inNumberRange',
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: info => {
            const status = info.getValue();
            let color = '';
            switch (status) {
                case 'available':
                    color = 'text-green-600';
                    break;
                case 'low':
                    color = 'text-amber-600';
                    break;
                case 'out_of_stock':
                    color = 'text-red-600';
                    break;
            }
            return <span className={color}>{status}</span>;
        },
        filterFn: 'equals',
    }),
    columnHelper.accessor('createdAt', {
        header: 'Created At',
        cell: info => info.getValue().toLocaleDateString(),
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || !filterValue.from || !filterValue.to) return true;
            const value = row.getValue(columnId) as Date;
            const from = new Date(filterValue.from);
            const to = new Date(filterValue.to);
            return value >= from && value <= to;
        },
    }),
];

// Filter fields
const filterFields = [
    {
        type: 'checkbox' as const,
        label: 'Category',
        value: 'category' as keyof Product,
        defaultOpen: true,
        options: [
            { label: 'Electronics', value: 'Electronics' },
            { label: 'Clothing', value: 'Clothing' },
            { label: 'Food', value: 'Food' },
        ],
    },
    {
        type: 'slider' as const,
        label: 'Price',
        value: 'price' as keyof Product,
        min: 0,
        max: 1000,
    },
    {
        type: 'slider' as const,
        label: 'Stock',
        value: 'stock' as keyof Product,
        min: 0,
        max: 100,
    },
    {
        type: 'checkbox' as const,
        label: 'Status',
        value: 'status' as keyof Product,
        options: [
            { label: 'Available', value: 'available' },
            { label: 'Low Stock', value: 'low' },
            { label: 'Out of Stock', value: 'out_of_stock' },
        ],
    },
    {
        type: 'timerange' as const,
        label: 'Created At',
        value: 'createdAt' as keyof Product,
    },
    {
        type: 'input' as const,
        label: 'Search Name',
        value: 'name' as keyof Product,
    },
];

export const Default: Story = {
    args: {
        data,
        columns,
        filterFields,
    },
    render: (args) => (
        <DataTable<Product, any> {...args} />
    ),
    parameters: {
        docs: {
            description: {
                story: 'The default data table with all features enabled.',
            },
        },
    },
};

export const WithoutFilters: Story = {
    args: {
        data,
        columns,
        showFilters: false,
    },
    render: (args) => (
        <DataTable<Product, any> {...args} />
    ),
    parameters: {
        docs: {
            description: {
                story: 'A data table without the filter sidebar or drawer.',
            },
        },
    },
};

export const WithoutToolbar: Story = {
    args: {
        data,
        columns,
        filterFields,
        showToolbar: false,
    },
    render: (args) => (
        <DataTable<Product, any> {...args} />
    ),
    parameters: {
        docs: {
            description: {
                story: 'A data table without the toolbar, but with filters still available.',
            },
        },
    },
};

export const WithoutPagination: Story = {
    args: {
        data,
        columns,
        filterFields,
        showPagination: false,
    },
    render: (args) => (
        <DataTable<Product, any> {...args} />
    ),
    parameters: {
        docs: {
            description: {
                story: 'A data table without pagination controls.',
            },
        },
    },
};

export const CustomPagination: Story = {
    args: {
        data,
        columns,
        filterFields,
        defaultPagination: { pageIndex: 0, pageSize: 5 },
    },
    render: (args) => (
        <DataTable<Product, any> {...args} />
    ),
    parameters: {
        docs: {
            description: {
                story: 'A data table with custom page size (5 items per page).',
            },
        },
    },
};

export const Loading: Story = {
    args: {
        data,
        columns,
        filterFields,
        isLoading: true,
    },
    render: (args) => (
        <DataTable<Product, any> {...args} />
    ),
    parameters: {
        docs: {
            description: {
                story: 'A data table in loading state, showing a skeleton.',
            },
        },
    },
};

export const WithRowClick: Story = {
    args: {
        data,
        columns,
        filterFields,
        onRowClick: (row) => {
            alert(`Clicked on product: ${row.original.name}`);
        },
    },
    render: (args) => (
        <DataTable<Product, any> {...args} />
    ),
    parameters: {
        docs: {
            description: {
                story: 'A data table with clickable rows that trigger an action.',
            },
        },
    },
};

export const WithDefaultSorting: Story = {
    args: {
        data,
        columns,
        filterFields,
        defaultSorting: [
            { id: 'price', desc: true }
        ],
    },
    render: (args) => (
        <DataTable<Product, any> {...args} />
    ),
    parameters: {
        docs: {
            description: {
                story: 'A data table with default sorting applied (price in descending order).',
            },
        },
    },
};

export const WithDefaultFilters: Story = {
    args: {
        data,
        columns,
        filterFields,
        defaultColumnFilters: [
            { id: 'category', value: ['Electronics'] }
        ],
    },
    render: (args) => (
        <DataTable<Product, any> {...args} />
    ),
    parameters: {
        docs: {
            description: {
                story: 'A data table with default filters applied (only showing Electronics category).',
            },
        },
    },
};

export const DenseLayout: Story = {
    render: (args) => (
        <div className="[--data-table-row-height:2rem] [--data-table-header-height:2.5rem]">
            <DataTable<Product, any> {...args} />
        </div>
    ),
    args: {
        data,
        columns,
        filterFields,
    },
    parameters: {
        docs: {
            description: {
                story: 'A data table with a more compact layout using CSS variables.',
            },
        },
    },
};

export const CustomStyling: Story = {
    render: (args) => (
        <div className="[--data-table-border-color:theme(colors.primary.200)] [--data-table-header-bg:theme(colors.primary.50)] [--data-table-row-hover:theme(colors.primary.50/30)]">
            <DataTable<Product, any> {...args} />
        </div>
    ),
    args: {
        data,
        columns,
        filterFields,
    },
    parameters: {
        docs: {
            description: {
                story: 'A data table with custom styling using CSS variables.',
            },
        },
    },
};

export const WithCallbacks: Story = {
    render: () => {
        const [state, setState] = React.useState({
            filters: [] as ColumnFiltersState,
            sorting: [] as SortingState,
            pagination: { pageIndex: 0, pageSize: 10 },
        });

        return (
            <div className="space-y-4">
                <div className="rounded-md border p-4 text-sm space-y-2">
                    <div><strong>Current Filters:</strong> {JSON.stringify(state.filters)}</div>
                    <div><strong>Current Sorting:</strong> {JSON.stringify(state.sorting)}</div>
                    <div><strong>Current Pagination:</strong> {JSON.stringify(state.pagination)}</div>
                </div>

                <DataTable<Product, any>
                    data={data}
                    columns={columns}
                    filterFields={filterFields}
                    onColumnFiltersChange={(filters) => setState((prev) => ({ ...prev, filters }))}
                    onSortingChange={(sorting) => setState((prev) => ({ ...prev, sorting }))}
                    onPaginationChange={(pagination) => setState((prev) => ({ ...prev, pagination }))}
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'A data table that demonstrates the callback functionality by displaying the current state.',
            },
        },
    },
}; 