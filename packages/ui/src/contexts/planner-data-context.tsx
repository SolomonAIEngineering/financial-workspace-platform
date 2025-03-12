/**
 * @file planner-data-context.tsx
 * @description Provides a React context for managing planner data including appointments and resources.
 * This context handles the state management and CRUD operations for appointments and resources
 * in the planner application.
 */
import { FC, ReactNode, createContext, useContext, useState } from 'react'

import { Appointment } from '../types/appointment'
import { AppointmentService } from '../lib/appointment-utils'
import { Resource } from '../types/resource'
import { ResourceService } from '../lib/resource-utils'

/**
 * @interface DataContextType
 * @description Defines the shape of the planner data context.
 * Includes arrays of appointments and resources, along with methods for
 * creating, updating, and deleting both appointment and resource entities.
 */
interface DataContextType {
  /** Array of all appointments in the planner */
  appointments: Appointment[]
  /** Array of all resources in the planner */
  resources: Resource[]
  /** Adds a new appointment to the planner */
  addAppointment: (appointment: Appointment) => void
  /** Updates an existing appointment in the planner */
  updateAppointment: (appointment: Appointment) => void
  /** Removes an appointment from the planner by its ID */
  removeAppointment: (id: string) => void
  /** Adds a new resource to the planner */
  addResource: (resource: Resource) => void
  /** Updates an existing resource in the planner */
  updateResource: (resource: Resource) => void
  /** Removes a resource from the planner by its ID */
  removeResource: (id: string) => void
}

/**
 * React context for planner data management.
 * The default value is undefined and will be provided by the PlannerDataContextProvider.
 */
const DataContext = createContext<DataContextType | undefined>(undefined)

/**
 * @component PlannerDataContextProvider
 * @description Provider component that makes planner data available to all child components.
 * Manages the state of appointments and resources and provides methods to manipulate them.
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components that will have access to the context
 * @param {Appointment[]} props.initialAppointments - Initial array of appointments to populate the context
 * @param {Resource[]} props.initialResources - Initial array of resources to populate the context
 * 
 * @example
 * ```tsx
 * <PlannerDataContextProvider 
 *   initialAppointments={[...]} 
 *   initialResources={[...]}
 * >
 *   <YourPlannerComponent />
 * </PlannerDataContextProvider>
 * ```
 */
export const PlannerDataContextProvider: FC<{
  children: ReactNode
  initialAppointments: Appointment[]
  initialResources: Resource[]
}> = ({ children, initialAppointments, initialResources }) => {
  const appointmentService = useState(
    new AppointmentService(initialAppointments),
  )[0]
  const resourceService = useState(new ResourceService(initialResources))[0]

  // Create a state that will re-render the context when updated
  const [trigger, setTrigger] = useState(false)

  /**
   * Toggles the trigger state to force a re-render of components using this context
   */
  const handleUpdate = () => setTrigger(!trigger) // simple state toggle to trigger re-render

  const contextValue: DataContextType = {
    appointments: appointmentService.getAppointments(),
    resources: resourceService.getResources(),
    addAppointment: (appointment) => {
      appointmentService.createAppointment(appointment)
      handleUpdate()
    },
    updateAppointment: (appointment) => {
      appointmentService.updateAppointment(appointment)
      handleUpdate()
    },
    removeAppointment: (id) => {
      appointmentService.deleteAppointment(id)
      handleUpdate()
    },
    addResource: (resource) => {
      resourceService.addResource(resource)
      handleUpdate()
    },
    updateResource: (resource) => {
      resourceService.updateResource(resource)
      handleUpdate()
    },
    removeResource: (id) => {
      resourceService.removeResource(id)
      handleUpdate()
    },
  }

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  )
}

/**
 * @hook useData
 * @description Custom hook to access the planner data context.
 * Provides access to appointments, resources, and methods to manipulate them.
 * 
 * @throws {Error} If used outside of a PlannerDataContextProvider
 * @returns {DataContextType} The planner data context value
 * 
 * @example
 * ```tsx
 * const { 
 *   appointments, 
 *   resources, 
 *   addAppointment, 
 *   updateResource 
 * } = useData();
 * 
 * // Add a new appointment
 * addAppointment(newAppointment);
 * 
 * // Update a resource
 * updateResource(updatedResource);
 * ```
 */
export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a PlannerDataContextProvider')
  }
  return context
}
