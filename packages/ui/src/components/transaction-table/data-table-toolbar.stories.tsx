import { Meta, StoryFn } from '@storybook/react'

import { Table } from '@tanstack/react-table'
import { DataTableToolbar } from './data-table-toolbar'

// Create mock data and table for the story
const mockTransactions = [
  {
    id: 'tx1',
    amount: 125.5,
    description: 'Office Supplies',
    category: 'Business',
    date: new Date('2023-04-15'),
    status: 'completed',
  },
  {
    id: 'tx2',
    amount: 75.2,
    description: 'Client Lunch',
    category: 'Food & Dining',
    date: new Date('2023-04-16'),
    status: 'pending',
  },
  {
    id: 'tx3',
    amount: 200.0,
    description: 'Software License',
    category: 'Software',
    date: new Date('2023-04-17'),
    status: 'completed',
  },
]

const createMockTable = () =>
  ({
    getState: () => ({
      columnFilters: [],
      globalFilter: '',
    }),
    setGlobalFilter: () => {},
    resetColumnFilters: () => {},
    getColumn: (columnId) => ({
      getCanFilter: () => true,
      getFilterValue: () => undefined,
      setFilterValue: () => {},
      getIsFiltered: () => false,
      getFacetedUniqueValues: () => new Map(),
    }),
    getAllColumns: () =>
      [
        { id: 'amount', accessorKey: 'amount' },
        { id: 'date', accessorKey: 'date' },
        { id: 'description', accessorKey: 'description' },
        { id: 'category', accessorKey: 'category' },
        { id: 'status', accessorKey: 'status' },
      ].map((col) => ({
        ...col,
        getCanFilter: () => true,
        getFilterValue: () => undefined,
        setFilterValue: () => {},
        getIsFiltered: () => false,
        getFacetedUniqueValues: () => new Map(),
      })),
  }) as unknown as Table<unknown>

export default {
  component: DataTableToolbar,
  title: 'TransactionTable/DataTableToolbar',
  parameters: {
    layout: 'centered',
  },
} as Meta

const Template: StoryFn = (args) => (
  <div className="w-[900px] rounded border p-4">
    <DataTableToolbar
      table={createMockTable()}
      transactions={args.transactions}
    />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  transactions: mockTransactions,
}

export const WithFilters = Template.bind({})
WithFilters.args = {
  transactions: mockTransactions,
  hasFilters: true,
}
