/**
 * Processes an array of items in batches to manage memory usage and avoid
 * overwhelming resources.
 *
 * This utility function breaks a large array into smaller batches and processes
 * them sequentially, which is helpful when dealing with large datasets, API
 * rate limits, or resource-intensive operations.
 *
 * @example
 *   ```ts
 *   // Process 100 transactions in batches of 20
 *   const results = await processBatch(
 *     transactions,
 *     20,
 *     async (batch) => {
 *       // Process each batch of transactions
 *       return Promise.all(batch.map(tx => processTransaction(tx)));
 *     }
 *   );
 *   ```;
 *
 * @param items - The array of items to process
 * @param limit - The maximum number of items to process in each batch
 * @param fn - The function to apply to each batch, which returns a promise
 *   resolving to an array of results
 * @returns A promise that resolves to an array containing all results from
 *   processing each batch
 */
export async function processBatch<T, R>(
  items: T[],
  limit: number,
  fn: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const batches: T[][] = [];
  let result: R[] = [];

  // Split the items into batches
  for (let i = 0; i < items?.length; i += limit) {
    batches.push(items.slice(i, i + limit));
  }

  // Process batches serially
  for (const batch of batches) {
    const processedBatch = await fn(batch);
    result = result.concat(processedBatch);
  }

  return result;
}
