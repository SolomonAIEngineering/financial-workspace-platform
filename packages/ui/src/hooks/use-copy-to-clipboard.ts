import { useCallback, useState } from "react";

import { toast } from "sonner";

/**
 * A custom hook for copying text to the clipboard with optional toast notification.
 * 
 * This hook provides a convenient way to copy text to the clipboard with additional
 * features like automatic clearing of the copied state after a timeout and optional
 * toast notifications. It also handles browser compatibility and error cases.
 * 
 * @returns An object containing:
 *   - text: The currently copied text (null if nothing has been copied)
 *   - copy: Function to copy text to clipboard
 *   - isCopied: Boolean indicating if text is currently copied
 * 
 * @example
 * // Basic usage
 * const { copy, isCopied } = useCopyToClipboard();
 * 
 * // Copy text with default settings
 * const handleCopy = () => copy("Text to copy");
 * 
 * @example
 * // With toast notification
 * const { copy } = useCopyToClipboard();
 * 
 * // Copy text and show a toast notification
 * const handleCopy = () => copy("Text to copy", { withToast: true });
 * 
 * @example
 * // With custom timeout
 * const { copy, isCopied } = useCopyToClipboard();
 * 
 * // Copy text and clear the copied state after 5 seconds
 * const handleCopy = () => copy("Text to copy", { timeout: 5000 });
 */
export function useCopyToClipboard() {
  const [text, setText] = useState<string | null>(null);

  /**
   * Copies the provided text to the clipboard.
   * 
   * @param text - The text to copy to the clipboard
   * @param options - Optional configuration
   * @param options.timeout - Time in milliseconds before clearing the copied state (default: 3000ms)
   * @param options.withToast - Whether to show a toast notification when copying succeeds (default: false)
   * @returns A promise that resolves to true if copying succeeded, false otherwise
   */
  const copy = useCallback(
    async (
      text: string,
      { timeout, withToast }: { timeout?: number; withToast?: boolean } = {
        timeout: 3000,
        withToast: false,
      },
    ) => {
      if (!navigator?.clipboard) {
        console.warn("Clipboard not supported");
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setText(text);

        if (timeout) {
          setTimeout(() => {
            setText(null);
          }, timeout);
        }

        if (withToast) {
          toast.success("Copied to clipboard");
        }

        return true;
      } catch (error) {
        console.warn("Copy failed", error);
        setText(null);
        return false;
      }
    },
    [],
  );

  return { text, copy, isCopied: text !== null };
}
