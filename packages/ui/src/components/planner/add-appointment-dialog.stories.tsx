import { Meta, StoryFn } from '@storybook/react'

import AddAppointmentDialog from './add-appointment-dialog'

export default {
  component: AddAppointmentDialog,
  title: 'Planner/AddAppointmentDialog',
  parameters: {
    layout: 'centered',
  },
} as Meta

const Template: StoryFn = () => (
  <div className="w-[600px]">
    <AddAppointmentDialog />
  </div>
)

export const Default = Template.bind({})
Default.args = {}
