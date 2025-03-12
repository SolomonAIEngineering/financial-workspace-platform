/**
 * @file use-enter-submit.ts
 * @description A custom React hook for handling form submission via the Enter key in textareas.
 */
import { type RefObject, useRef } from 'react'

/**
 * @hook useEnterSubmit
 * @description Custom hook that enables form submission when pressing Enter in a textarea.
 * This hook provides a form reference and a keydown handler that submits the form when
 * the Enter key is pressed without the Shift key (which allows for newlines).
 * 
 * @returns {Object} An object containing:
 *   - formRef: A React ref to attach to the form element
 *   - onKeyDown: An event handler to attach to the textarea for Enter key detection
 * 
 * @example
 * ```tsx
 * const ChatInput = () => {
 *   const { formRef, onKeyDown } = useEnterSubmit();
 *   const [message, setMessage] = useState('');
 *   
 *   const handleSubmit = (e) => {
 *     e.preventDefault();
 *     if (!message.trim()) return;
 *     
 *     sendMessage(message);
 *     setMessage('');
 *   };
 *   
 *   return (
 *     <form ref={formRef} onSubmit={handleSubmit}>
 *       <textarea
 *         value={message}
 *         onChange={(e) => setMessage(e.target.value)}
 *         onKeyDown={onKeyDown}
 *         placeholder="Type a message... (Press Enter to send)"
 *       />
 *       <button type="submit">Send</button>
 *     </form>
 *   );
 * };
 * ```
 */
export function useEnterSubmit(): {
  formRef: RefObject<HTMLFormElement>
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
} {
  const formRef = useRef<HTMLFormElement>(null)

  /**
   * Handles keydown events in the textarea
   * Submits the form when Enter is pressed without Shift key
   * 
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} event - The keydown event
   */
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      formRef.current?.requestSubmit()
      event.preventDefault()
    }
  }

  return {
    formRef: formRef as RefObject<HTMLFormElement>,
    onKeyDown: handleKeyDown,
  }
}
