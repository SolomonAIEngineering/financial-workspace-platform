import { createContext, useContext } from 'react'

import { useLocalStorage } from '@/hooks/use-local-storage'

/**
 * Context type definition for the Controls feature.
 * 
 * This interface defines the shape of the context that manages the visibility state
 * of UI controls, typically used for data tables or other complex UI components
 * that have toggleable control panels.
 * 
 * @property open - Boolean indicating whether the controls are currently visible
 * @property setOpen - Function to update the visibility state of the controls
 */
interface ControlsContextType {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * Context for managing UI controls visibility state.
 * 
 * This context provides a way to manage the visibility of UI controls across components
 * without prop drilling. The state is persisted in local storage.
 */
export const ControlsContext = createContext<ControlsContextType | null>(null)

/**
 * Provider component for the Controls context.
 * 
 * This component sets up the context for managing UI controls visibility state.
 * It uses local storage to persist the state between sessions, and provides
 * a wrapper div with data attributes that can be targeted with CSS.
 * 
 * @param props - Component props
 * @param props.children - Child components that will have access to the controls context
 * @returns A provider component with the controls context and wrapper div
 * 
 * @example
 * // Wrap components that need access to controls state
 * <ControlsProvider>
 *   <DataTable />
 *   <ControlPanel />
 * </ControlsProvider>
 */
export function ControlsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useLocalStorage('data-table-controls', true)

  return (
    <ControlsContext.Provider value={{ open, setOpen }}>
      <div
        // REMINDER: access the data-expanded state with tailwind via `group-data-[expanded=true]/controls:block`
        // In tailwindcss v4, we could even use `group-data-expanded/controls:block`
        className="group/controls"
        data-expanded={open}
      >
        {children}
      </div>
    </ControlsContext.Provider>
  )
}

/**
 * Hook for accessing the Controls context.
 * 
 * This hook provides access to the controls state and setter function from any component
 * within the ControlsProvider tree. It throws an error if used outside of a ControlsProvider.
 * 
 * @returns The controls context containing open state and setter function
 * 
 * @example
 * // Inside a component
 * const { open, setOpen } = useControls();
 * 
 * // Toggle controls visibility
 * const toggleControls = () => setOpen(prev => !prev);
 * 
 * @throws Error if used outside of a ControlsProvider
 */
export function useControls() {
  const context = useContext(ControlsContext)

  if (!context) {
    throw new Error('useControls must be used within a ControlsProvider')
  }

  return context as ControlsContextType
}
