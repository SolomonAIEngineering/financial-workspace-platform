import { z } from 'zod'

/**
 * Interface for ClickHouse client that can insert data
 */
export interface Inserter {
  insert<T extends z.ZodType>(options: {
    table: string
    values: z.infer<T>[]
    schema: T
  }): Promise<void>
}

/**
 * Response type for mutation operations
 */
export interface MutationResponse {
  success: boolean
  error?: string
  queryId?: string
}
