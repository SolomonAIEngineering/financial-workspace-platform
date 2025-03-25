/**
 * @file database.ts
 * @description PostgreSQL connection pool configuration
 *
 * This file sets up and exports a PostgreSQL connection pool using the 'pg' package.
 * The connection string is taken from the DATABASE_URL environment variable.
 * This pool is used by various database clients throughout the application.
 */

import { Pool } from 'pg'

/**
 * PostgreSQL connection pool instance
 *
 * A singleton connection pool for PostgreSQL database connections.
 * Using a pool allows for efficient connection management and reuse
 * instead of establishing new connections for each database operation.
 *
 * @remarks
 * The pool is configured using the DATABASE_URL environment variable.
 * Ensure this variable is properly set in your environment with a valid PostgreSQL connection string.
 *
 * @example
 * // Import and use the pool
 * import { pgPool } from './database';
 *
 * const result = await pgPool.query('SELECT NOW()');
 * console.log(result.rows[0]);
 */
export const pgPool = new Pool({ connectionString: process.env.DATABASE_URL })
