/**
 * @file index.ts
 * @description Entry point for the Prisma package, which exports client-safe types and enums
 * 
 * IMPORTANT: This file should only contain exports that are safe to use in client components.
 * No server-only modules (like pg, Prisma clients, etc.) should be included here.
 * Server-only code should be imported from './server'
 */

// Re-export all other types and enums from the client module
export * from './client';

// Re-export Prisma types that are safe to use on the client-side
// We're already exporting the necessary types from ./client

// Instead of direct export, point users to the proper place
export const IMPORTANT_NOTICE = `
ATTENTION: You're importing from '@solomonai/prisma' in a client component.
This is only safe for types and enums.

For server-side database access, use:
import { prisma, kyselyPrisma, pgPool } from '@solomonai/prisma/server';

For client components, consider using React Server Components or Server Actions instead.
`;

// JSON schema can be safely used on the client
export const jsonSchema = require('../prisma/json-schema/json-schema.json');