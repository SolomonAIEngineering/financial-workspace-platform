import { endOfDay, endOfWeek, startOfWeek } from 'date-fns'
import React, { useEffect, useState } from 'react'

import { DateRange } from 'react-day-picker'
import { useCalendar } from '../../contexts/planner-context'
import { useData } from '../../contexts/planner-data-context'
import { cn } from '../../utils/cn'
import { DateRangePicker } from '../date-range-picker'
import AddAppointmentDialog from './add-appointment-dialog'

interface CalendarToolbarProps extends React.HTMLAttributes<HTMLDivElement> {}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  className,
  ...props
}) => {
  const { setDateRange } = useCalendar()
  const { addResource, addAppointment } = useData()

  const [range, setRange] = useState<DateRange>({
    from: startOfWeek(new Date(), {
      locale: { options: { weekStartsOn: 1 } },
    }),
    to: endOfWeek(new Date()),
  })
  const handleDateRangeUpdate = (range: DateRange) => {
    const from = range.from
    const to = range.to ?? endOfDay(range.from as Date)
    setDateRange({
      from: from,
      to: to,
    })
  }
  useEffect(() => {
    setDateRange(range)
  }, [range])

  return (
    <div
      className={cn('flex items-center justify-end space-x-2', className)}
      {...props}
    >
      <AddAppointmentDialog />
      <DateRangePicker
        onSelect={(newRange?: DateRange) =>
          newRange && handleDateRangeUpdate(newRange)
        }
        range={range}
        placeholder="Select date range"
        className={{}}
      />
    </div>
  )
}

export default React.memo(CalendarToolbar)
