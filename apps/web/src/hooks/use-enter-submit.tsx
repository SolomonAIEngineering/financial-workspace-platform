import { type RefObject, useRef } from 'react';

/**
 * UseEnterSubmit Hook
 *
 * This hook provides functionality to submit a form when the Enter key is
 * pressed in a textarea element, without creating a new line.
 *
 * @remarks
 *   The hook handles common edge cases:
 *
 *   - Prevents form submission when Shift+Enter is pressed (allows for new lines)
 *   - Prevents form submission during IME composition (for languages like Chinese,
 *       Japanese)
 *   - Automatically prevents the default Enter behavior when submitting
 *
 * @example
 *   ```tsx
 *   const { formRef, onKeyDown } = useEnterSubmit();
 *
 *   return (
 *     <form ref={formRef} onSubmit={handleSubmit}>
 *       <textarea
 *         onKeyDown={onKeyDown}
 *         placeholder="Press Enter to submit"
 *       />
 *       <button type="submit">Submit</button>
 *     </form>
 *   );
 *   ```;
 *
 * @returns An object containing:
 *
 *   - FormRef: A React ref that should be attached to the form element
 *   - OnKeyDown: An event handler that should be attached to the textarea element
 */
export function useEnterSubmit(): {
  formRef: RefObject<HTMLFormElement>;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
} {
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * Handles keydown events in the textarea Submits the form when Enter is
   * pressed without Shift and not during composition
   *
   * @param event - The keyboard event from the textarea
   */
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      formRef.current?.requestSubmit();
      event.preventDefault();
    }
  };

  return {
    formRef: formRef as RefObject<HTMLFormElement>,
    onKeyDown: handleKeyDown,
  };
}
