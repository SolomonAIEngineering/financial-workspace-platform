import React from 'react';

import { LayoutGrid, List } from 'lucide-react';

/**
 * Props for the ViewModeToggle component
 *
 * @property {'grid' | 'list'} viewMode - Current view mode (grid or list)
 * @property {(mode: 'grid' | 'list') => void} setViewMode - Callback to change
 *   view mode
 * @interface ViewModeToggleProps
 */
export interface ViewModeToggleProps {
  /** Current view mode that determines which button is active */
  viewMode: 'grid' | 'list';
  /** Function to update the view mode */
  setViewMode: (mode: 'grid' | 'list') => void;
}

/**
 * ViewModeToggle component provides buttons to switch between grid and list
 * views
 *
 * This component renders a pair of toggle buttons that allow users to switch
 * between different visual representations of document lists. The active mode
 * is visually highlighted.
 *
 * @example
 *   ```tsx
 *   <ViewModeToggle
 *     viewMode={viewMode}
 *     setViewMode={setViewMode}
 *   />
 *   ```;
 *
 * @component
 */
export function ViewModeToggle({
  setViewMode,
  viewMode,
}: ViewModeToggleProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">View:</span>
      <button
        className={`rounded-md p-1.5 transition-all ${
          viewMode === 'grid'
            ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300'
        }`}
        onClick={() => setViewMode('grid')}
        aria-label="Grid view"
        aria-pressed={viewMode === 'grid'}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        className={`rounded-md p-1.5 transition-all ${
          viewMode === 'list'
            ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300'
        }`}
        onClick={() => setViewMode('list')}
        aria-label="List view"
        aria-pressed={viewMode === 'list'}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
