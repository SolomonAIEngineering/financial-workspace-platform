import { Meta, StoryFn } from '@storybook/react'

import { Column } from '@tanstack/react-table'
import { DataTableColumnHeader } from './data-table-column-header'

// Create a mock column for the story
const createMockColumn = (canSort = true, isSorted = false) =>
  ({
    getCanSort: () => canSort,
    getIsSorted: () =>
      isSorted ? (Math.random() > 0.5 ? 'asc' : 'desc') : false,
    getToggleSortingHandler: () => () => console.info('Toggle sorting'),
  }) as unknown as Column<unknown, unknown>

export default {
  component: DataTableColumnHeader,
  title: 'TransactionTable/DataTableColumnHeader',
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: { control: 'text' },
  },
} as Meta

const Template: StoryFn = (args) => (
  <div className="rounded border p-4">
    <DataTableColumnHeader
      column={createMockColumn(args.canSort, args.isSorted)}
      title={args.title}
      className={args.className}
    />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  title: 'Transaction Date',
  canSort: true,
  isSorted: false,
}

export const Sortable = Template.bind({})
Sortable.args = {
  title: 'Amount',
  canSort: true,
  isSorted: true,
}

export const NonSortable = Template.bind({})
NonSortable.args = {
  title: 'Description',
  canSort: false,
  isSorted: false,
}
