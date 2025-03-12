/**
 * @file use-store.ts
 * @description A custom React hook for safely using external store state in components.
 * This hook helps prevent hydration mismatches when using external state management libraries.
 */
import { useEffect, useState } from 'react'

/**
 * @hook useStore
 * @description A hook that safely accesses external store state in a way that's compatible with SSR.
 * This hook helps prevent hydration mismatches by ensuring store values are only used after
 * the component has mounted on the client side.
 * 
 * @template T - The type of the store's state
 * @template F - The type of the derived value from the store
 * 
 * @param {function} store - The store's selector function that accepts a callback
 * @param {function} callback - A function that extracts the desired value from the store state
 * @returns {F | undefined} - The extracted value from the store, or undefined during SSR
 * 
 * @example
 * ```tsx
 * // With Zustand
 * const Counter = () => {
 *   // Safe way to use Zustand store with SSR
 *   const count = useStore(useCounterStore, (state) => state.count);
 *   
 *   if (count === undefined) return null; // Still hydrating
 *   
 *   return <div>Count: {count}</div>;
 * };
 * ```
 */
export const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F,
) => {
  const result = store(callback) as F
  const [data, setData] = useState<F>()

  useEffect(() => {
    setData(result)
  }, [result])

  return data
}
