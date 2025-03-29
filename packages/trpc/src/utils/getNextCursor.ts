/**
 * Gets the next cursor for pagination based on the last item in the array
 * @template T - Array type that contains items with an 'id' property
 * @param {T} items - Array of items to process
 * @param {number} limit - Maximum number of items to include in the current page
 * @returns {string | undefined} The ID of the last item if there are more items, undefined otherwise
 * @example
 * ```ts
 * const items = [
 *   { id: "1", name: "Item 1" },
 *   { id: "2", name: "Item 2" },
 *   { id: "3", name: "Item 3" }
 * ];
 * const nextCursor = getNextCursor(items, 2); // "3"
 * ```
 */
export const getNextCursor = <T extends any[]>(items: T, limit: number) => {
  let nextCursor: string | undefined

  if (items.length > limit) {
    const nextItem = items.pop() // return the last item from the array
    nextCursor = nextItem?.id
  }

  return nextCursor
}
