/**
 * @file use-sidebar-toggle.ts
 * @description A Zustand store hook for managing sidebar open/closed state with persistence.
 */
import { createJSONStorage, persist } from 'zustand/middleware'

import { create } from 'zustand'

/**
 * @interface useSidebarToggleStore
 * @description Interface defining the shape of the sidebar toggle state store.
 * Contains the current open state and a method to toggle it.
 */
interface useSidebarToggleStore {
  /** Whether the sidebar is currently open */
  isOpen: boolean
  /** Function to toggle the sidebar open/closed state */
  setIsOpen: () => void
}

/**
 * @hook useSidebarToggle
 * @description A persistent Zustand store hook for managing sidebar visibility state.
 * The state persists across page reloads using localStorage.
 * 
 * @returns {useSidebarToggleStore} An object containing:
 *   - isOpen: Boolean indicating if the sidebar is open
 *   - setIsOpen: Function to toggle the sidebar state
 * 
 * @example
 * ```tsx
 * const SidebarComponent = () => {
 *   const { isOpen, setIsOpen } = useSidebarToggle();
 *   
 *   return (
 *     <>
 *       <button onClick={setIsOpen}>
 *         {isOpen ? 'Close Sidebar' : 'Open Sidebar'}
 *       </button>
 * ```
 */
const useSidebarToggle = create(
  persist<useSidebarToggleStore>(
    (set, get) => ({
      isOpen: true,
      setIsOpen: () => {
        set({ isOpen: !get().isOpen })
      },
    }),
    {
      name: 'sidebarOpen',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export { useSidebarToggle }

export type { useSidebarToggleStore }
