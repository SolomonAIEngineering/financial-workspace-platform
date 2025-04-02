/**
 * @file server.ts
 * @description Server-only Prisma and database client initializations
 *
 * IMPORTANT: This file should ONLY be imported in server contexts:
 * - Server components (React Server Components)
 * - API routes
 * - Server actions
 * - Server utilities
 *
 * DO NOT import this file in client components or it will cause build errors.
 */

import {
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  sql,
} from 'kysely'

import type { DB } from './kysely/types'
/// <reference types="@solomonai/prisma/server/prisma.d.ts" />
import { PrismaClient } from '@prisma/client'
import { getDatabaseUrl } from './helper'
import kyselyExtension from 'prisma-extension-kysely'
import pg from 'pg';
import { remember } from './utils/remember'

/**
 * Singleton instance of the Prisma client
 *
 * This exports a single, reused instance of PrismaClient to prevent connection
 * pool exhaustion in serverless environments. The client is configured with
 * the database URL from the environment variables, normalized by getDatabaseUrl().
 *
 * @example
 * // Import and use the Prisma client
 * import { prisma } from '@solomonai/prisma/server';
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
 * @example
 * // Import and use the Kysely-extended Prisma client
 * import { kyselyPrisma, sql } from '@solomonai/prisma/server';
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
 */
export { sql }

// Pool for raw postgres queries
export const pgPool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Re-export everything from the client for convenience
export * from './client'
