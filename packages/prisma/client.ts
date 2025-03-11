/**
 * @file client.ts
 * @description Prisma client export module
 *
 * This file serves as the main export point for the Prisma client, making all generated
 * Prisma client types and functions available throughout the application. It re-exports
 * everything from the '@prisma/client' package, including:
 *
 * - All model types (User, BankAccount, Transaction, etc.)
 * - All enum types (UserRole, AccountStatus, etc.)
 * - The PrismaClient class
 * - Helper types and utility functions
 *
 * By centralizing the export in this file, we ensure consistent usage of Prisma
 * throughout the application and make it easier to extend or modify the client
 * if needed in the future.
 *
 * @example
 * // Import specific types or the client
 * import { User, PrismaClient } from './client';
 *
 * // Or import everything
 * import * as PrismaTypes from './client';
 */
export * from '@prisma/client'
