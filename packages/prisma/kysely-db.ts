/**
 * @file kysely-db.ts
 * @description Kysely database client configuration
 *
 * This file initializes and exports a Kysely database client for TypeScript-first
 * database access. Kysely provides a strongly-typed SQL query builder with type inference
 * that complements the Prisma ORM used elsewhere in the application.
 *
 * The Kysely instance uses the PostgreSQL dialect and the same connection pool
 * that's shared with other database clients in the application.
 */

import { Kysely, ParseJSONResultsPlugin, PostgresDialect } from 'kysely'

import { pgPool } from './database'
import type { DB } from './kysely/types'

/**
 * Configured Kysely database client
 *
 * This Kysely instance provides a type-safe query builder for PostgreSQL.
 * It's configured with:
 * - The shared PostgreSQL connection pool
 * - Error logging in development mode
 * - JSON parsing plugin for automatic parsing of JSON fields
 *
 * @remarks
 * The DB type parameter ensures all queries are type-checked against
 * the actual database schema.
 *
 * @example
 * // Import and use the Kysely client
 * import { db } from './kysely-db';
 *
 * const users = await db
 *   .selectFrom('User')
 *   .select(['id', 'name', 'email'])
 *   .execute();
 */
export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: pgPool,
  }),
  log: process.env.NODE_ENV === 'development' ? ['error'] : undefined,
  plugins: [new ParseJSONResultsPlugin()],
})
