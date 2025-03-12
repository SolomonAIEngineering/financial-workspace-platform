import { Card, CardContent } from '../../../primitives/card';
import { ColumnDef, createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

import { Badge } from '../../../primitives/badge';
import { DataTableFilterSlider } from './DataTableFilterSlider';
import { DataTableProvider } from '../core/DataTableProvider';

const meta: Meta<typeof DataTableFilterSlider> = {
    title: 'Components/DataTable/V2/Filters/DataTableFilterSlider',
    component: DataTableFilterSlider,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A range slider component for filtering numeric data table columns with min/max values.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTableFilterSlider>;

// Sample data for the table
interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    rating: number;
    stock: number;
}

const data: Product[] = [
    { id: '1', name: 'Laptop', category: 'Electronics', price: 999, rating: 4.5, stock: 25 },
    { id: '2', name: 'Smartphone', category: 'Electronics', price: 699, rating: 4.2, stock: 12 },
    { id: '3', name: 'Headphones', category: 'Audio', price: 199, rating: 3.8, stock: 8 },
    { id: '4', name: 'Monitor', category: 'Electronics', price: 299, rating: 4.7, stock: 15 },
    { id: '5', name: 'Keyboard', category: 'Peripherals', price: 89, rating: 4.0, stock: 30 },
    { id: '6', name: 'Gaming Mouse', category: 'Peripherals', price: 59, rating: 4.9, stock: 22 },
    { id: '7', name: 'Tablet', category: 'Electronics', price: 449, rating: 3.6, stock: 5 },
    { id: '8', name: 'Speakers', category: 'Audio', price: 159, rating: 4.1, stock: 18 },
    { id: '9', name: 'Camera', category: 'Electronics', price: 789, rating: 4.4, stock: 7 },
    { id: '10', name: 'Microphone', category: 'Audio', price: 129, rating: 3.9, stock: 14 },
];

// Column helper for the table
const columnHelper = createColumnHelper<Product>();

// Column definitions
const columns: ColumnDef<Product, any>[] = [
    columnHelper.accessor('name', {
        header: 'Product Name',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('category', {
        header: 'Category',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('price', {
        header: 'Price',
        cell: info => `$${info.getValue()}`,
    }),
    columnHelper.accessor('rating', {
        header: 'Rating',
        cell: info => `${info.getValue()} ⭐`,
    }),
    columnHelper.accessor('stock', {
        header: 'Stock',
        cell: info => info.getValue(),
    }),
];

// Find min and max values for price
const minPrice = Math.min(...data.map(product => product.price));
const maxPrice = Math.max(...data.map(product => product.price));

// Find min and max values for rating
const minRating = Math.min(...data.map(product => product.rating));
const maxRating = Math.max(...data.map(product => product.rating));

// Find min and max values for stock
const minStock = Math.min(...data.map(product => product.stock));
const maxStock = Math.max(...data.map(product => product.stock));

// Wrapper to provide the DataTable context
const FilterSliderWrapper = ({
    children,
    columnId = 'price',
    initialFilter = { min: undefined, max: undefined },
}: {
    children: React.ReactNode;
    columnId?: string;
    initialFilter?: { min?: number; max?: number };
}) => {
    const [columnFilters, setColumnFilters] = useState([
        { id: columnId, value: initialFilter }
    ]);

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
        },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
    });

    // Get current filter values
    const currentFilter = columnFilters[0]?.value as { min?: number; max?: number } || { min: undefined, max: undefined };

    return (
        <DataTableProvider table={table} columns={columns}>
            <Card className="w-[350px]">
                <CardContent className="p-4">
                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Current filter range:</h3>
                        <div className="flex flex-wrap gap-2">
                            {(currentFilter.min !== undefined || currentFilter.max !== undefined) ? (
                                <Badge variant="secondary">
                                    {currentFilter.min !== undefined ? `Min: ${currentFilter.min}` : 'No min'} -
                                    {currentFilter.max !== undefined ? `Max: ${currentFilter.max}` : 'No max'}
                                </Badge>
                            ) : (
                                <span className="text-sm text-muted-foreground">No range selected</span>
                            )}
                        </div>
                    </div>
                    {children}
                </CardContent>
            </Card>
        </DataTableProvider>
    );
};

export const Basic: Story = {
    render: () => (
        <FilterSliderWrapper>
            <DataTableFilterSlider
                value="price"
                min={minPrice}
                max={maxPrice}
            />
        </FilterSliderWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Basic usage of the DataTableFilterSlider component for filtering by price.',
            },
        },
    },
};

export const WithStep: Story = {
    render: () => (
        <FilterSliderWrapper>
            <DataTableFilterSlider
                value="price"
                min={minPrice}
                max={maxPrice}
                step={50}
            />
        </FilterSliderWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterSlider with a custom step value of 50.',
            },
        },
    },
};

export const WithCustomClasses: Story = {
    render: () => (
        <FilterSliderWrapper>
            <DataTableFilterSlider
                value="price"
                min={minPrice}
                max={maxPrice}
                className="px-2 py-4 border rounded-md"
            />
        </FilterSliderWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterSlider with custom class names for the container.',
            },
        },
    },
};

export const WithInitialValues: Story = {
    render: () => (
        <FilterSliderWrapper initialFilter={{ min: 200, max: 500 }}>
            <DataTableFilterSlider
                value="price"
                min={minPrice}
                max={maxPrice}
            />
        </FilterSliderWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterSlider with initial min and max values.',
            },
        },
    },
};

export const RatingFilter: Story = {
    render: () => (
        <FilterSliderWrapper columnId="rating">
            <DataTableFilterSlider
                value="rating"
                min={minRating}
                max={maxRating}
                step={0.1}
                formatValue={(value) => `${value.toFixed(1)} ⭐`}
            />
        </FilterSliderWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterSlider used for filtering product ratings with a custom formatter.',
            },
        },
    },
};

export const StockFilter: Story = {
    render: () => (
        <FilterSliderWrapper columnId="stock">
            <DataTableFilterSlider
                value="stock"
                min={minStock}
                max={maxStock}
                step={1}
                formatValue={(value) => `${value} units`}
            />
        </FilterSliderWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterSlider used for filtering product stock with a custom formatter.',
            },
        },
    },
};

export const WithCustomLabel: Story = {
    render: () => (
        <FilterSliderWrapper>
            <DataTableFilterSlider
                value="price"
                min={minPrice}
                max={maxPrice}
                label="Price Range ($)"
            />
        </FilterSliderWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterSlider with a custom label.',
            },
        },
    },
};

export const WithCallback: Story = {
    render: () => {
        const [sliderValues, setSliderValues] = useState<{ min?: number; max?: number }>({ min: undefined, max: undefined });

        return (
            <FilterSliderWrapper>
                <div className="space-y-4">
                    <DataTableFilterSlider
                        value="price"
                        min={minPrice}
                        max={maxPrice}
                        onChange={(values) => setSliderValues(values)}
                    />

                    <div className="text-sm py-2 px-3 bg-muted rounded-md">
                        <p>Range via callback: </p>
                        <p className="font-mono mt-1">
                            {JSON.stringify(sliderValues, null, 2)}
                        </p>
                    </div>
                </div>
            </FilterSliderWrapper>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterSlider with an onChange callback to track range changes.',
            },
        },
    },
}; 