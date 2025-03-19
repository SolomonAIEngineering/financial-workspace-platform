import type { Meta, StoryObj } from '@storybook/react'

import { addDays } from 'date-fns'
import { useState } from 'react'
import { Calendar } from './calendar'

const meta: Meta<typeof Calendar> = {
  component: Calendar,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof Calendar>

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date>(new Date())
    return (
      <div className="w-[300px]">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(day) => setDate(day as Date)}
        />
      </div>
    )
  },
}

export const MultiSelection: Story = {
  render: () => {
    const [dates, setDates] = useState<Date[]>([
      new Date(),
      addDays(new Date(), 2),
      addDays(new Date(), 5),
    ])
    return (
      <div className="w-[300px]">
        <Calendar
          mode="multiple"
          selected={dates}
          onSelect={(days) => setDates(days as Date[])}
        />
      </div>
    )
  },
}

export const RangeSelection: Story = {
  render: () => {
    const [dateRange, setDateRange] = useState<{
      from: Date
      to?: Date
    }>({
      from: new Date(),
      to: addDays(new Date(), 7),
    })
    return (
      <div className="w-[300px]">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={(range) => setDateRange(range as { from: Date; to?: Date })}
        />
      </div>
    )
  },
}

export const WithDisabledDates: Story = {
  render: () => {
    const [date, setDate] = useState<Date>(new Date())
    return (
      <div className="w-[300px]">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(day) => setDate(day as Date)}
          disabled={[
            { from: addDays(new Date(), -4), to: addDays(new Date(), -2) },
            { from: addDays(new Date(), 3), to: addDays(new Date(), 5) },
          ]}
        />
      </div>
    )
  },
}

export const WithFooter: Story = {
  render: () => {
    const [date, setDate] = useState<Date>(new Date())
    return (
      <div className="w-[300px]">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(day) => setDate(day as Date)}
          footer={
            <div className="text-muted-foreground mt-2 text-center text-sm">
              Today: {new Date().toLocaleDateString()}
            </div>
          }
        />
      </div>
    )
  },
}
