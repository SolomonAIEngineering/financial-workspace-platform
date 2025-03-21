'use client';

import { useCallback } from 'react';

/**
 * Hook to programmatically close a Sheet component
 *
 * This hook provides a function that will close the nearest Sheet ancestor by
 * setting its open state to false. It should be used within Sheet components
 * that need to be closed programmatically (e.g., after a successful action).
 *
 * @example
 *   ```tsx
 *   const closeSheet = useSheetClose();
 *
 *   const handleSubmit = () => {
 *     // Handle form submission
 *     saveData();
 *     closeSheet(); // Close the sheet after successful submission
 *   };
 *   ```;
 *
 * @returns {() => void} A function that when called will close the sheet
 */
export function useSheetClose() {
  // Create a callback that will use a SheetClose ref to trigger the sheet closing
  return useCallback(() => {
    // Find and click the SheetClose button to close the sheet
    const closeButton = document.querySelector('[data-radix-dialog-close]');
    if (closeButton instanceof HTMLElement) {
      closeButton.click();
    }
  }, []);
}
