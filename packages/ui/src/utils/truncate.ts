/**
 * Truncates a string to a specified length and adds an ellipsis if necessary.
 * 
 * This utility function is useful for displaying long text in limited space,
 * such as in UI components where space is constrained. If the string is shorter
 * than the specified length, it will be returned unchanged.
 * 
 * @param str - The string to truncate. Can be null or undefined.
 * @param length - The maximum length of the returned string (including the ellipsis)
 * @returns The truncated string with ellipsis, or null if the input was null/undefined
 * 
 * @example
 * // Truncate a long string
 * truncate("This is a very long string", 10)
 * // => "This is..."
 * 
 * @example
 * // String shorter than length is returned unchanged
 * truncate("Short", 10)
 * // => "Short"
 * 
 * @example
 * // Handling null values
 * truncate(null, 10)
 * // => null
 */
export const truncate = (
  str: string | null | undefined,
  length: number,
): string | null => {
  if (!str || str.length <= length) return str ?? null
  return `${str.slice(0, length - 3)}...`
}
