import { Meta, StoryFn } from '@storybook/react'

import ResourceTableCell from './resource-table-cell'

export default {
  component: ResourceTableCell,
  title: 'Planner/ResourceTableCell',
  parameters: {
    layout: 'centered',
  },
} as Meta

const Template: StoryFn = (args) => (
  <div className="w-[400px]">
    <table className="border-collapse">
      <tbody>
        <tr>
          <ResourceTableCell resourceItem={args.resourceItem} {...args} />
        </tr>
      </tbody>
    </table>
  </div>
)

export const Default = Template.bind({})
Default.args = {
  resourceItem: {
    id: '1',
    name: 'John Doe',
    details: {
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      image: 'https://i.pravatar.cc/150?img=1',
      role: 'Developer',
    },
  },
}

export const WithLongName = Template.bind({})
WithLongName.args = {
  resourceItem: {
    id: '2',
    name: 'Alexandra Christine Smith-Johnson',
    details: {
      email: 'alexandra.smith@example.com',
      phone: '123-456-7891',
      image: 'https://i.pravatar.cc/150?img=5',
      role: 'Project Manager',
    },
  },
}
