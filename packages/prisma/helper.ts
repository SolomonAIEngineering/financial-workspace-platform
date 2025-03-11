/**
 * @file helper.ts
 * @description Database connection helper utilities
 *
 * This file provides utility functions for managing database connections,
 * particularly for handling different database URL formats and connection types
 * across various environments (development, production, etc.).
 */

/**
 * Determines and normalizes the database connection URL
 *
 * This function handles multiple possible database URL environment variables
 * and normalizes them for use with Prisma. It implements the following logic:
 *
 * 1. Checks for existing normalized URL (NEXT_PRIVATE_DATABASE_URL)
 * 2. Looks for various possible database URL environment variables in priority order
 * 3. Sets up pooled vs. direct (non-pooled) connection URLs
 * 4. Adds necessary query parameters for connection pooling (pgbouncer)
 *
 * The function supports various hosting environments including Vercel, Railway,
 * and standard PostgreSQL connections.
 *
 * @returns {string | undefined} The normalized database URL to use with Prisma,
 *                              or undefined if no database URL is available
 *
 * @example
 * // In your Prisma client initialization
 * const prisma = new PrismaClient({
 *   datasourceUrl: getDatabaseUrl(),
 * });
 */
export const getDatabaseUrl = () => {
  if (process.env.NEXT_PRIVATE_DATABASE_URL) {
    return process.env.NEXT_PRIVATE_DATABASE_URL
  }

  if (process.env.POSTGRES_URL) {
    process.env.NEXT_PRIVATE_DATABASE_URL = process.env.POSTGRES_URL
    process.env.NEXT_PRIVATE_DIRECT_DATABASE_URL = process.env.POSTGRES_URL
  }

  if (process.env.DATABASE_URL) {
    process.env.NEXT_PRIVATE_DATABASE_URL = process.env.DATABASE_URL
    process.env.NEXT_PRIVATE_DIRECT_DATABASE_URL = process.env.DATABASE_URL
  }

  if (process.env.DATABASE_URL_UNPOOLED) {
    process.env.NEXT_PRIVATE_DIRECT_DATABASE_URL =
      process.env.DATABASE_URL_UNPOOLED
  }

  if (process.env.POSTGRES_PRISMA_URL) {
    process.env.NEXT_PRIVATE_DATABASE_URL = process.env.POSTGRES_PRISMA_URL
  }

  if (process.env.POSTGRES_URL_NON_POOLING) {
    process.env.NEXT_PRIVATE_DIRECT_DATABASE_URL =
      process.env.POSTGRES_URL_NON_POOLING
  }

  // If we don't have a database URL, we can't normalize it.
  if (!process.env.NEXT_PRIVATE_DATABASE_URL) {
    return undefined
  }

  // We change the protocol from `postgres:` to `https:` so we can construct a easily
  // mofifiable URL.
  const url = new URL(
    process.env.NEXT_PRIVATE_DATABASE_URL.replace('postgres://', 'https://'),
  )

  // If we're using a connection pool, we need to let Prisma know that
  // we're using PgBouncer.
  if (
    process.env.NEXT_PRIVATE_DATABASE_URL !==
    process.env.NEXT_PRIVATE_DIRECT_DATABASE_URL
  ) {
    url.searchParams.set('pgbouncer', 'true')

    process.env.NEXT_PRIVATE_DATABASE_URL = url
      .toString()
      .replace('https://', 'postgres://')
  }

  return process.env.NEXT_PRIVATE_DATABASE_URL
}
