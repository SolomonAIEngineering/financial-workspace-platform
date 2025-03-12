/**
 * @file useControllableState.tsx
 * @description A custom React hook for creating state that can be either controlled or uncontrolled.
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/use-controllable-state/src/useControllableState.tsx
 */
import * as React from 'react'

import { useCallbackRef } from './useCallbackRef'

/**
 * @interface UseControllableStateParams
 * @description Parameters for the useControllableState hook
 * @template T - The type of the state value
 */
type UseControllableStateParams<T> = {
  /** External controlled value */
  prop?: T | undefined
  /** Initial value for uncontrolled state */
  defaultProp?: T | undefined
  /** Callback function triggered when the state changes */
  onChange?: (state: T) => void
}

/**
 * Type for state setter function
 */
type SetStateFn<T> = (prevState?: T) => T

/**
 * @hook useControllableState
 * @description A hook that manages state which can be either controlled (passed in via props)
 * or uncontrolled (managed internally). This pattern is useful for building reusable components
 * that can be used in both controlled and uncontrolled modes.
 * 
 * @template T - The type of the state value
 * @param {UseControllableStateParams<T>} params - The hook parameters
 * @param {T | undefined} params.prop - The controlled value from props
 * @param {T | undefined} params.defaultProp - The default value for uncontrolled state
 * @param {Function} params.onChange - Callback function called when the value changes
 * 
 * @returns {[T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>]} - A tuple containing:
 *   - The current state value (either controlled or uncontrolled)
 *   - A function to update the state
 * 
 * @example
 * ```tsx
 * // Component that works in both controlled and uncontrolled modes
 * const Checkbox = ({ checked, defaultChecked, onChange }) => {
 *   const [isChecked, setIsChecked] = useControllableState({
 *     prop: checked,
 *     defaultProp: defaultChecked || false,
 *     onChange,
 *   });
 *   
 *   return (
 *     <input
 *       type="checkbox"
 *       checked={isChecked}
 *       onChange={e => setIsChecked(e.target.checked)}
 *     />
 *   );
 * };
 * 
 * // Usage as controlled component
 * <Checkbox checked={someState} onChange={setSomeState} />
 * 
 * // Usage as uncontrolled component
 * <Checkbox defaultChecked={true} onChange={handleChange} />
 * ```
 */
function useControllableState<T>({
  prop,
  defaultProp,
  onChange = () => { },
}: UseControllableStateParams<T>) {
  const [uncontrolledProp, setUncontrolledProp] = useUncontrolledState({
    defaultProp,
    onChange,
  })
  const isControlled = prop !== undefined
  const value = isControlled ? prop : uncontrolledProp
  const handleChange = useCallbackRef(onChange)

  const setValue: React.Dispatch<React.SetStateAction<T | undefined>> =
    React.useCallback(
      (nextValue) => {
        if (isControlled) {
          const setter = nextValue as SetStateFn<T>
          const value =
            typeof nextValue === 'function' ? setter(prop) : nextValue
          if (value !== prop) handleChange(value as T)
        } else {
          setUncontrolledProp(nextValue)
        }
      },
      [isControlled, prop, setUncontrolledProp, handleChange],
    )

  return [value, setValue] as const
}

/**
 * @hook useUncontrolledState
 * @description Internal hook used by useControllableState to manage uncontrolled state.
 * Handles calling the onChange callback when the uncontrolled state changes.
 * 
 * @template T - The type of the state value
 * @param {Object} params - The hook parameters
 * @param {T | undefined} params.defaultProp - The default value for the state
 * @param {Function} params.onChange - Callback function called when the value changes
 * 
 * @returns {[T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>]} - A tuple containing:
 *   - The current state value
 *   - A function to update the state
 */
function useUncontrolledState<T>({
  defaultProp,
  onChange,
}: Omit<UseControllableStateParams<T>, 'prop'>) {
  const uncontrolledState = React.useState<T | undefined>(defaultProp)
  const [value] = uncontrolledState
  const prevValueRef = React.useRef(value)
  const handleChange = useCallbackRef(onChange)

  React.useEffect(() => {
    if (prevValueRef.current !== value) {
      handleChange(value as T)
      prevValueRef.current = value
    }
  }, [value, prevValueRef, handleChange])

  return uncontrolledState
}

export { useControllableState }
