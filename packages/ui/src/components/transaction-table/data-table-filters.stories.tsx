import { Meta, StoryFn } from '@storybook/react'
import { Column, Table } from '@tanstack/react-table'

import { DataTableFilter } from './data-table-filters'

// Mock table and column for the story
const createMockTable = () =>
  ({
    getPreFilteredRowModel: () => ({
      flatRows: [
        {
          getValue: () => 'Sample Value',
        },
      ],
    }),
  }) as unknown as Table<unknown>

const createMockColumn = (filterValue = '', type = 'text') =>
  ({
    id: 'sample',
    getFilterValue: () => filterValue,
    setFilterValue: () => {},
    getFacetedUniqueValues: () =>
      new Map([
        ['Value 1', 5],
        ['Value 2', 10],
        ['Value 3', 3],
        ['Value 4', 7],
        ['Value 5', 2],
      ]),
  }) as unknown as Column<unknown, unknown>

export default {
  component: DataTableFilter,
  title: 'TransactionTable/DataTableFilter',
  parameters: {
    layout: 'centered',
  },
} as Meta

const Template: StoryFn = (args) => (
  <div className="w-[300px] rounded border p-4">
    <DataTableFilter
      table={createMockTable()}
      column={createMockColumn(args.filterValue, args.columnType)}
    />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  filterValue: '',
  columnType: 'text',
}

export const WithValue = Template.bind({})
WithValue.args = {
  filterValue: 'Value 1',
  columnType: 'text',
}
