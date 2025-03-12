/**
 * @file useCallbackRef.tsx
 * @description A custom React hook for stabilizing callback references.
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/use-callback-ref/src/useCallbackRef.tsx
 */
import * as React from 'react'

/**
 * @hook useCallbackRef
 * @description A custom hook that converts a callback to a ref to avoid triggering
 * re-renders when passed as a prop or avoid re-executing effects when passed as
 * a dependency. This is particularly useful for callbacks that are passed to
 * child components or used in effect dependencies.
 * 
 * The hook ensures that the returned function has a stable identity (it doesn't change
 * between renders) while still having access to the latest callback implementation.
 * 
 * @template T - The function type of the callback
 * @param {T | undefined} callback - The callback function to stabilize
 * @returns {T} - A stable callback function that will always call the latest version of the provided callback
 * 
 * @example
 * ```tsx
 * // Without useCallbackRef, this would cause infinite re-renders
 * // because handleChange would be a new function on each render
 * const Form = ({ onSubmit }) => {
 *   const [value, setValue] = useState('');
 *   
 *   // Stabilize the onSubmit callback
 *   const handleSubmit = useCallbackRef((event) => {
 *     event.preventDefault();
 *     onSubmit(value);
 *   });
 *   
 *   // handleSubmit has a stable identity but calls the latest implementation
 *   return <form onSubmit={handleSubmit}>...</form>;
 * };
 * ```
 * 
 * @example
 * ```tsx
 * // Using in effect dependencies
 * const Component = ({ onChange }) => {
 *   // Stabilize the onChange callback
 *   const stableOnChange = useCallbackRef(onChange);
 *   
 *   // Now we can use it in effect dependencies without causing
 *   // the effect to re-run when onChange changes identity
 *   useEffect(() => {
 *     const handleChange = () => stableOnChange(value);
 *     element.addEventListener('change', handleChange);
 *     return () => element.removeEventListener('change', handleChange);
 *   }, [stableOnChange]); // Stable dependency
 *   
 *   return <div>...</div>;
 * };
 * ```
 */
function useCallbackRef<T extends (...args: never[]) => unknown>(
  callback: T | undefined,
): T {
  const callbackRef = React.useRef(callback)

  React.useEffect(() => {
    callbackRef.current = callback
  })

  // https://github.com/facebook/react/issues/19240
  return React.useMemo(
    () => ((...args) => callbackRef.current?.(...args)) as T,
    [],
  )
}

export { useCallbackRef }
