/**
 * @file use-media-query.ts
 * @description A custom React hook for detecting and responding to media query changes.
 */
import { useEffect, useState } from 'react'

/**
 * @hook useMediaQuery
 * @description Custom hook that tracks the state of a CSS media query.
 * This hook allows components to respond to changes in the viewport size or other media features.
 * 
 * @param {string} query - The CSS media query string to evaluate (e.g., '(min-width: 768px)')
 * @returns {boolean} - Returns true if the media query matches, false otherwise
 * 
 * @example
 * ```tsx
 * // Check if the viewport is at least 768px wide
 * const isTabletOrLarger = useMediaQuery('(min-width: 768px)');
 * 
 * // Conditionally render based on screen size
 * return (
 *   <div>
 *     {isTabletOrLarger ? (
 *       <DesktopLayout />
 *     ) : (
 *       <MobileLayout />
 *     )}
 *   </div>
 * );
 * ```
 */
export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false)

  useEffect(() => {
    /**
     * Event handler for media query changes
     * @param {MediaQueryListEvent} event - The media query change event
     */
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }

    const result = matchMedia(query)
    result.addEventListener('change', onChange)
    setValue(result.matches)

    return () => result.removeEventListener('change', onChange)
  }, [query])

  return value
}
