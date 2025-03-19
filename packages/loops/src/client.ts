import { LoopsClient } from 'loops'

/**
 * Function to create a Loops client instance with the provided API key
 *
 * @param apiKey - The Loops API key
 * @returns A new instance of the Loops client
 */
export function createLoopsClient(apiKey: string): LoopsClient {
  if (!apiKey) {
    throw new Error('Loops API key is required')
  }

  return new LoopsClient(apiKey)
}

/**
 * Default Loops client using the API key from environment variables
 * This is for convenience when using the package with a server-side environment
 * where process.env is available
 */
export const loops = createLoopsClient(process.env.LOOPS_API_KEY || '')
