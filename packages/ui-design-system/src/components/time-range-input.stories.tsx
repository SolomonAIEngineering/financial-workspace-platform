import type { Meta, StoryObj } from '@storybook/react'

import { useState } from 'react'
import { TimeRangeInput } from './time-range-input'

const meta: Meta<typeof TimeRangeInput> = {
  component: TimeRangeInput,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof TimeRangeInput>

export const Default: Story = {
  render: () => {
    const [timeRange, setTimeRange] = useState({
      startTime: '09:00',
      endTime: '17:00',
    })

    return (
      <TimeRangeInput
        value={{ start: timeRange.startTime, end: timeRange.endTime }}
        onChange={(value) =>
          setTimeRange({
            startTime: value.start,
            endTime: value.end,
          })
        }
      />
    )
  },
}

export const WithLabel: Story = {
  render: () => {
    const [timeRange, setTimeRange] = useState({
      startTime: '10:00',
      endTime: '15:30',
    })

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Operating Hours</label>
        <TimeRangeInput
          value={{ start: timeRange.startTime, end: timeRange.endTime }}
          onChange={(value) =>
            setTimeRange({
              startTime: value.start,
              endTime: value.end,
            })
          }
        />
      </div>
    )
  },
}

export const WithError: Story = {
  render: () => {
    const [timeRange, setTimeRange] = useState({
      startTime: '18:00',
      endTime: '09:00',
    })

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Operating Hours</label>
        <TimeRangeInput
          value={{ start: timeRange.startTime, end: timeRange.endTime }}
          onChange={(value) =>
            setTimeRange({
              startTime: value.start,
              endTime: value.end,
            })
          }
        />
        <p className="text-sm text-red-500">
          End time must be after start time
        </p>
      </div>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <TimeRangeInput
      value={{ start: '08:00', end: '16:00' }}
      onChange={() => {}}
    />
  ),
}
