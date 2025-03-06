/**
 * @fileoverview Server-side authentication utilities and middleware from Clerk.
 *
 * This module re-exports all server-side authentication utilities from Clerk, including:
 * - Server-side authentication helpers (auth, currentUser, clerkClient)
 * - Route handlers and middleware
 * - Server-side types and utilities
 *
 * This file is marked with 'server-only' to ensure these utilities are never included
 * in client-side bundles, maintaining proper security boundaries.
 *
 * @example
 * // Using in a Next.js API route
 * import { auth } from '@your-org/auth/server';
 *
 * export async function GET(request: Request) {
 *   const { userId } = auth();
 *   if (!userId) return new Response('Unauthorized', { status: 401 });
 *
 *   return new Response('Protected Data');
 * }
 *
 * @example
 * // Using in Server Components
 * import { currentUser } from '@your-org/auth/server';
 *
 * export default async function ProtectedPage() {
 *   const user = await currentUser();
 *   if (!user) return 'Not authenticated';
 *
 *   return `Welcome ${user.firstName}`;
 * }
 */

import 'server-only'

export * from '@clerk/nextjs/server'
