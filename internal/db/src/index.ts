export * from 'drizzle-orm'
export { drizzle as mysqlDrizzle } from 'drizzle-orm/mysql2'
export { drizzle } from 'drizzle-orm/planetscale-serverless'
export * from './types'
export { schema }
import type { ExtractTablesWithRelations } from 'drizzle-orm'
import type {
  PlanetScaleDatabase,
  PlanetScaleTransaction,
} from 'drizzle-orm/planetscale-serverless'
import * as schema from './schema'

export type Database = PlanetScaleDatabase<typeof schema>

export type Transaction = PlanetScaleTransaction<
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>
