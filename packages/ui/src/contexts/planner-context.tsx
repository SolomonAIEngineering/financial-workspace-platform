import React, { createContext, useContext, useMemo, useState } from 'react'
import { endOfDay, startOfDay, startOfWeek } from 'date-fns'

import { DateRange } from 'react-day-picker'
import { getLabelsForView } from '../lib/utils'

/**
 * Type definition for the Planner context.
 * 
 * This interface defines the shape of the context that manages calendar/planner
 * state, including view mode, time labels, and date ranges.
 * 
 * @property viewMode - The current calendar view mode (day, week, month, or year)
 * @property timeLabels - Array of time labels appropriate for the current view mode
 * @property dateRange - The selected date range for the planner
 * @property currentDateRange - The currently visible date range in the planner
 * @property setDateRange - Function to update the selected date range
 */
interface PlannerContextType {
  viewMode: 'day' | 'week' | 'month' | 'year'
  timeLabels: string[]
  dateRange: DateRange
  currentDateRange: DateRange
  setDateRange: (dateRange: DateRange) => void
}

/**
 * Default values for the Planner context.
 * 
 * These values are used when initializing the context and provide sensible defaults
 * for the planner state.
 */
const defaultContextValue: PlannerContextType = {
  viewMode: 'week', // default starting view
  timeLabels: [],
  dateRange: { from: startOfWeek(new Date()), to: endOfDay(new Date()) },
  currentDateRange: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
  setDateRange: (dateRange: DateRange) => {
    console.info(dateRange)
  },
}

/**
 * Context for managing planner/calendar state.
 * 
 * This context provides a way to manage calendar view state across components
 * without prop drilling, including view modes, date ranges, and time labels.
 */
const PlannerContext = createContext<PlannerContextType>(defaultContextValue)

/**
 * Provider component for the Planner context.
 * 
 * This component sets up the context for managing calendar/planner state.
 * It handles date range selection, view mode determination based on the selected
 * date range, and generation of appropriate time labels for the current view.
 * 
 * @param props - Component props
 * @param props.children - Child components that will have access to the planner context
 * @returns A provider component with the planner context
 * 
 * @example
 * // Wrap components that need access to planner state
 * <PlannerProvider>
 *   <Calendar />
 *   <EventList />
 * </PlannerProvider>
 */
export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  })

  /**
   * Determines the appropriate view mode based on the selected date range.
   * 
   * - 'day' for ranges less than 1 day
   * - 'week' for ranges up to 7 days
   * - 'month' for ranges up to 31 days
   * - 'year' for ranges longer than 31 days
   */
  const viewMode = useMemo(() => {
    const days =
      (Number(dateRange.to) - Number(dateRange.from)) / (1000 * 3600 * 24)
    if (days < 1) return 'day'
    if (days <= 7) return 'week'
    if (days <= 31) return 'month'
    return 'year'
  }, [dateRange])

  /**
   * Generates appropriate time labels for the current view mode and date range.
   */
  const timeLabels = useMemo(() => {
    return getLabelsForView(viewMode, {
      start: dateRange.from ?? startOfDay(new Date()),
      end: dateRange.to ?? endOfDay(new Date()),
    })
  }, [viewMode, dateRange])

  const value = {
    timeLabels,
    dateRange,
    setDateRange,
    viewMode: viewMode as 'day' | 'week' | 'month' | 'year',
    currentDateRange: dateRange,
  }

  return (
    <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
  )
}

/**
 * Hook for accessing the Planner context.
 * 
 * This hook provides access to the planner state from any component
 * within the PlannerProvider tree.
 * 
 * @returns The planner context containing view mode, date ranges, time labels, and setter functions
 * 
 * @example
 * // Inside a component
 * const { viewMode, dateRange, setDateRange } = useCalendar();
 * 
 * // Change the selected date range
 * const selectNextWeek = () => {
 *   setDateRange({
 *     from: addDays(dateRange.from, 7),
 *     to: addDays(dateRange.to, 7)
 *   });
 * };
 */
export const useCalendar = () => {
  return useContext(PlannerContext)
}
