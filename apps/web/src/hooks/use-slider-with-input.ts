import { useCallback, useState } from 'react';

/** Props for the useSliderWithInput hook. */
type UseSliderWithInputProps = {
  /**
   * The minimum allowed value for the slider and input.
   *
   * @default 0
   */
  minValue?: number;
  /**
   * The maximum allowed value for the slider and input.
   *
   * @default 100
   */
  maxValue?: number;
  /**
   * The initial value(s) for the slider and input.
   *
   * @default [minValue]
   */
  initialValue?: number[];
  /**
   * The default value(s) that will be used when resetting.
   *
   * @default [minValue]
   */
  defaultValue?: number[];
};

/**
 * UseSliderWithInput Hook
 *
 * This hook manages the state and synchronization between a slider component
 * and corresponding input field(s), ensuring they remain in sync while handling
 * validation and constraints.
 *
 * @remarks
 *   The hook handles various edge cases:
 *
 *   - Input validation for numeric values
 *   - Range constraints (min/max boundaries)
 *   - Multi-handle sliders where values must maintain their order
 *   - Empty or invalid input handling
 *
 * @example
 *   ```tsx
 *   const {
 *     sliderValue,
 *     inputValues,
 *     handleInputChange,
 *     handleSliderChange,
 *     validateAndUpdateValue,
 *     resetToDefault
 *   } = useSliderWithInput({
 *     minValue: 0,
 *     maxValue: 1000,
 *     initialValue: [250],
 *     defaultValue: [250]
 *   });
 *
 *   return (
 *     <div>
 *       <Slider
 *         value={sliderValue}
 *         onChange={handleSliderChange}
 *         min={0}
 *         max={1000}
 *       />
 *       <input
 *         value={inputValues[0]}
 *         onChange={(e) => handleInputChange(e, 0)}
 *         onBlur={() => validateAndUpdateValue(inputValues[0], 0)}
 *       />
 *       <button onClick={resetToDefault}>Reset</button>
 *     </div>
 *   );
 *   ```;
 *
 * @param props - Configuration options for the slider and input
 * @param props.minValue - Minimum allowed value (defaults to 0)
 * @param props.maxValue - Maximum allowed value (defaults to 100)
 * @param props.initialValue - Initial value(s) for the slider/input
 * @param props.defaultValue - Default value(s) used when resetting
 * @returns An object containing:
 *
 *   - SliderValue: Current numeric values for the slider
 *   - InputValues: Current string values for the input fields
 *   - ValidateAndUpdateValue: Function to validate and update a specific input
 *       value
 *   - HandleInputChange: Event handler for input field changes
 *   - HandleSliderChange: Event handler for slider changes
 *   - ResetToDefault: Function to reset values to defaults
 *   - SetValues: Function to programmatically set values
 */
export function useSliderWithInput({
  minValue = 0,
  maxValue = 100,
  initialValue = [minValue],
  defaultValue = [minValue],
}: UseSliderWithInputProps) {
  const [sliderValue, setSliderValue] = useState(initialValue);
  const [inputValues, setInputValues] = useState(
    initialValue.map((v) => v.toString())
  );

  /**
   * Sets both slider and input values simultaneously.
   *
   * @param values - The new numeric values to set
   */
  const setValues = useCallback((values: number[]) => {
    setSliderValue(values);
    setInputValues(values.map((v) => v.toString()));
  }, []);

  /**
   * Validates and updates a specific input value. Handles empty inputs, invalid
   * numbers, and enforces min/max constraints. For range sliders, ensures the
   * lower handle doesn't exceed the upper handle and vice versa.
   *
   * @param rawValue - The string value from the input field
   * @param index - The index of the value to update (0 for single slider, 0 or
   *   1 for range slider)
   */
  const validateAndUpdateValue = useCallback(
    (rawValue: string, index: number) => {
      if (rawValue === '' || rawValue === '-') {
        const newInputValues = [...inputValues];
        newInputValues[index] = '0';
        setInputValues(newInputValues);

        const newSliderValues = [...sliderValue];
        newSliderValues[index] = 0;
        setSliderValue(newSliderValues);
        return;
      }

      const numValue = Number.parseFloat(rawValue);

      if (Number.isNaN(numValue)) {
        const newInputValues = [...inputValues];
        newInputValues[index] = sliderValue[index].toString();
        setInputValues(newInputValues);
        return;
      }

      let clampedValue = Math.min(maxValue, Math.max(minValue, numValue));

      if (sliderValue.length > 1) {
        if (index === 0) {
          clampedValue = Math.min(clampedValue, sliderValue[1]);
        } else {
          clampedValue = Math.max(clampedValue, sliderValue[0]);
        }
      }

      const newSliderValues = [...sliderValue];
      newSliderValues[index] = clampedValue;
      setSliderValue(newSliderValues);

      const newInputValues = [...inputValues];
      newInputValues[index] = clampedValue.toString();
      setInputValues(newInputValues);
    },
    [sliderValue, inputValues, minValue, maxValue]
  );

  /**
   * Handles changes to the input field. Allows only valid numeric input
   * patterns while typing.
   *
   * @param e - The input change event
   * @param index - The index of the input being changed
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const newValue = e.target.value;
      if (newValue === '' || /^-?\d*\.?\d*$/.test(newValue)) {
        const newInputValues = [...inputValues];
        newInputValues[index] = newValue;
        setInputValues(newInputValues);
      }
    },
    [inputValues]
  );

  /**
   * Handles changes to the slider. Updates both the slider value and input
   * field values.
   *
   * @param newValue - The new values from the slider component
   */
  const handleSliderChange = useCallback((newValue: number[]) => {
    setSliderValue(newValue);
    setInputValues(newValue.map((v) => v.toString()));
  }, []);

  /** Resets both slider and input values to their defaults. */
  const resetToDefault = useCallback(() => {
    setSliderValue(defaultValue);
    setInputValues(defaultValue.map((v) => v.toString()));
  }, [defaultValue]);

  return {
    sliderValue,
    inputValues,
    validateAndUpdateValue,
    handleInputChange,
    handleSliderChange,
    resetToDefault,
    setValues,
  };
}
