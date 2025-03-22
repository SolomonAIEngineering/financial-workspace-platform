/**
 * @file index.ts
 * @description Prisma and Kysely database client initialization and exports
 *
 * This file initializes and exports the database clients used throughout the application:
 * 1. A standard Prisma client for type-safe database access
 * 2. A Kysely-extended Prisma client for advanced query capabilities
 *
 * The file uses the 'remember' utility to ensure singleton instances of these clients,
 * preventing connection pool exhaustion in serverless environments.
 */

import {
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from 'kysely'

import type { DB } from './kysely/types'
/// <reference types="@solomonai/prisma/server/prisma.d.ts" />
import { PrismaClient } from '@prisma/client'
import kyselyExtension from 'prisma-extension-kysely'
import { getDatabaseUrl } from './helper'
import { remember } from './utils/remember'

export const jsonSchema = require('../prisma/json-schema/json-schema.json')

/**
 * Singleton instance of the Prisma client
 *
 * This exports a single, reused instance of PrismaClient to prevent connection
 * pool exhaustion in serverless environments. The client is configured with
 * the database URL from the environment variables, normalized by getDatabaseUrl().
 *
 * @example
 * // Import and use the Prisma client
 * import { prisma } from './index';
 *
 * const users = await prisma.user.findMany();
 */
export const prisma = remember(
  'prisma',
  () =>
    new PrismaClient({
      datasourceUrl: getDatabaseUrl(),
    }),
)

/**
 * Kysely-extended Prisma client for advanced query capabilities
 *
 * This extends the standard Prisma client with Kysely's query builder capabilities,
 * allowing for more complex queries while maintaining type safety. It uses the
 * same connection as the standard Prisma client.
 *
 * The Kysely extension provides:
 * - More flexible query composition
 * - Advanced filtering and sorting
 * - Raw SQL capabilities with type safety
 * - Better support for complex joins and subqueries
 *
 * @example
 * // Import and use the Kysely-extended Prisma client
 * import { kyselyPrisma, sql } from './index';
 *
 * const users = await kyselyPrisma.kysely
 *   .selectFrom('User')
 *   .where('email', 'like', '%@example.com')
 *   .select(['id', 'name', 'email'])
 *   .execute();
 */
export const kyselyPrisma = remember('kyselyPrisma', () =>
  prisma.$extends(
    kyselyExtension({
      kysely: (driver) =>
        new Kysely<DB>({
          dialect: {
            createAdapter: () => new PostgresAdapter(),
            createDriver: () => driver,
            createIntrospector: (db) => new PostgresIntrospector(db),
            createQueryCompiler: () => new PostgresQueryCompiler(),
          },
        }),
    }),
  ),
)

/**
 * Re-export of Kysely's sql template tag for raw SQL queries
 *
 * @example
 * // Use the sql template tag for raw SQL with type safety
 * import { kyselyPrisma, sql } from './index';
 *
 * const result = await kyselyPrisma.kysely
 *   .selectFrom('User')
 *   .where(sql`LOWER(email) LIKE ${'%@example.com'}`)
 *   .select(['id', 'name'])
 *   .execute();
 */
export { sql } from 'kysely'
