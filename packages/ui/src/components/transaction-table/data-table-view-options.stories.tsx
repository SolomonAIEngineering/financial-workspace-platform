import { Meta, StoryFn } from '@storybook/react'

import { Table } from '@tanstack/react-table'
import { DataTableViewOptions } from './data-table-view-options'

// Create a mock table for the story
const createMockTable = () =>
  ({
    getAllColumns: () => [
      {
        id: 'amount',
        getCanHide: () => true,
        getIsVisible: () => true,
        toggleVisibility: () => {},
        getToggleVisibilityHandler: () => () => {},
      },
      {
        id: 'date',
        getCanHide: () => true,
        getIsVisible: () => true,
        toggleVisibility: () => {},
        getToggleVisibilityHandler: () => () => {},
      },
      {
        id: 'description',
        getCanHide: () => true,
        getIsVisible: () => true,
        toggleVisibility: () => {},
        getToggleVisibilityHandler: () => () => {},
      },
      {
        id: 'category',
        getCanHide: () => true,
        getIsVisible: () => false,
        toggleVisibility: () => {},
        getToggleVisibilityHandler: () => () => {},
      },
      {
        id: 'status',
        getCanHide: () => false,
        getIsVisible: () => true,
        toggleVisibility: () => {},
        getToggleVisibilityHandler: () => () => {},
      },
    ],
  }) as unknown as Table<unknown>

export default {
  component: DataTableViewOptions,
  title: 'TransactionTable/DataTableViewOptions',
  parameters: {
    layout: 'centered',
  },
} as Meta

const Template: StoryFn = (args) => (
  <div className="flex justify-end p-4">
    <DataTableViewOptions table={createMockTable()} />
  </div>
)

export const Default = Template.bind({})
Default.args = {}
