import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { LEVELS, METHODS, REGIONS } from "./core/constants";
import type { Meta, StoryObj } from "@storybook/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";

import { ColumnDef } from '@tanstack/react-table';
import { ColumnSchema } from './core/schema';
import React from 'react';
import { columns } from './columns';

// This is a story for a set of columns, so we'll create a simple table component to display them
const ColumnsDemo = ({ columns }: { columns: ColumnDef<any>[] }) => {
    // Generate sample data
    const generateData = (count: number) => {
        const data: Partial<ColumnSchema>[] = [];

        for (let i = 0; i < count; i++) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - i * 5);

            data.push({
                uuid: `uuid-${i}`,
                level: LEVELS[Math.floor(Math.random() * LEVELS.length)],
                method: METHODS[Math.floor(Math.random() * METHODS.length)],
                status: [200, 201, 204, 400, 401, 403, 404, 500][Math.floor(Math.random() * 8)],
                date: now,
                host: ['api.example.com', 'auth.example.com', 'app.example.com'][Math.floor(Math.random() * 3)],
                pathname: ['/api/users', '/api/auth', '/api/products', '/api/orders'][Math.floor(Math.random() * 4)],
                regions: [REGIONS[Math.floor(Math.random() * REGIONS.length)]],
                message: `This is a sample message ${i}`,
                latency: Math.random() * 500,
                headers: { 'content-type': 'application/json' },
                "timing.dns": Math.random() * 50,
                "timing.connection": Math.random() * 100,
                "timing.tls": Math.random() * 80,
                "timing.ttfb": Math.random() * 200,
                "timing.transfer": Math.random() * 300,
            });
        }

        return data;
    };

    const data = generateData(5);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Infinite Columns Demo</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((column, index) => (
                                    <TableHead key={index}>
                                        {typeof column.header === 'string'
                                            ? column.header
                                            : column.id || 'Column'}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row, i) => (
                                <TableRow key={i}>
                                    {columns.map((column, index) => {
                                        // Use id to get the value
                                        const key = column.id;
                                        return (
                                            <TableCell key={index}>
                                                {key && row[key] !== undefined
                                                    ? String(row[key])
                                                    : '-'}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

const meta: Meta = {
    title: 'Components/Infinite/Columns',
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'Predefined columns for the InfiniteTable component with specialized cell renderers.',
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof ColumnsDemo>;

export const AllColumns: Story = {
    render: () => (
        <div className="max-w-[1000px]">
            <ColumnsDemo columns={columns} />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'All available columns for the Infinite data table.',
            },
        },
    },
};

export const CoreColumns: Story = {
    render: () => (
        <div className="max-w-[800px]">
            <ColumnsDemo
                columns={columns.filter(column => {
                    const id = column.id;
                    return ['level', 'date', 'status', 'method', 'pathname', 'host'].includes(id || '');
                })}
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Core columns commonly used in log displays.',
            },
        },
    },
};

export const TimingColumns: Story = {
    render: () => (
        <div className="max-w-[600px]">
            <ColumnsDemo
                columns={columns.filter(column => {
                    const id = column.id || '';
                    return id.startsWith('timing.');
                })}
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Performance timing-related columns.',
            },
        },
    },
};

export const MetadataColumns: Story = {
    render: () => (
        <div className="max-w-[700px]">
            <ColumnsDemo
                columns={columns.filter(column => {
                    const id = column.id;
                    return ['uuid', 'regions'].includes(id || '');
                })}
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Metadata columns for additional context.',
            },
        },
    },
};

export const CustomColumnSet: Story = {
    render: () => {
        // Example of how to create a custom column set
        const customColumns = [
            columns.find(col => col.id === 'level'),
            columns.find(col => col.id === 'date'),
            columns.find(col => col.id === 'method'),
            columns.find(col => col.id === 'status'),
            columns.find(col => col.id === 'message'),
            columns.find(col => col.id === 'timing.total'),
        ].filter(Boolean) as ColumnDef<any>[];

        return (
            <div className="max-w-[800px]">
                <ColumnsDemo columns={customColumns} />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Example of how to create a custom column set by selecting specific columns.',
            },
        },
    },
}; 