import { Meta, StoryFn } from '@storybook/react'
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { DataTablePagination } from './data-table-pagination'

export default {
  title: 'Transaction Table/DataTablePagination',
  component: DataTablePagination,
  parameters: {
    layout: 'centered',
  },
} as Meta

// Sample data type
type Person = {
  id: string
  firstName: string
  lastName: string
  age: number
  email: string
}

// Sample data
const data: Person[] = Array.from({ length: 100 }).map((_, index) => ({
  id: `person-${index}`,
  firstName: `First${index}`,
  lastName: `Last${index}`,
  age: 20 + (index % 50),
  email: `person${index}@example.com`,
}))

// Column definitions
const columnHelper = createColumnHelper<Person>()

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('firstName', {
    header: 'First Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('lastName', {
    header: 'Last Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('age', {
    header: 'Age',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: (info) => info.getValue(),
  }),
]

const Template: StoryFn = () => {
  // Initialize the table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
    },
  })

  return (
    <div className="w-[800px] rounded-md border p-4">
      <div className="h-[200px] border-b">
        <p className="p-8 text-center text-gray-500">
          Table content would appear here
        </p>
      </div>
      <div className="pt-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}

export const Default = Template.bind({})
