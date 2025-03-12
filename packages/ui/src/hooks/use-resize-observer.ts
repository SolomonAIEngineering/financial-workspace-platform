/**
 * @file use-resize-observer.ts
 * @description A custom React hook that uses ResizeObserver to track element size changes.
 */
import { type RefObject, useEffect, useState } from 'react'

/**
 * @hook useResizeObserver
 * @description Custom hook that observes and reports size changes of a DOM element.
 * Uses the browser's ResizeObserver API to detect when the target element's dimensions change.
 * 
 * @param {RefObject<Element>} elementRef - React ref object pointing to the DOM element to observe
 * @returns {ResizeObserverEntry | undefined} - The ResizeObserver entry containing size information,
 *                                             or undefined if the element is not yet available
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const entry = useResizeObserver(ref);
 *   
 *   // Access the element's current dimensions
 *   const width = entry?.contentRect.width;
 *   const height = entry?.contentRect.height;
 *   
 *   return (
 *     <div ref={ref} style={{ width: '100%', height: '100%' }}>
 *       {width && height && `Current size: ${width}px × ${height}px`}
 *     </div>
 *   );
 * };
 * ```
 */
export function useResizeObserver(
  elementRef: RefObject<Element>,
): ResizeObserverEntry | undefined {
  const [entry, setEntry] = useState<ResizeObserverEntry>()

  /**
   * Callback function for the ResizeObserver that updates the entry state
   * @param {ResizeObserverEntry[]} entries - Array of ResizeObserverEntry objects
   */
  const updateEntry = ([entry]: ResizeObserverEntry[]): void => {
    setEntry(entry)
  }

  useEffect(() => {
    const node = elementRef?.current
    if (!node) return

    // Create and setup the ResizeObserver
    const observer = new ResizeObserver(updateEntry)

    observer.observe(node)

    // Clean up the observer when the component unmounts or ref changes
    return () => observer.disconnect()
  }, [elementRef])

  return entry
}
