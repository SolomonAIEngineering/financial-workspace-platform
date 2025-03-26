/**
 * TRPC Router for bank connections
 *
 * This router provides endpoints for managing bank connections.
 */

import { createFile } from './handlers/file';
// Import all handlers
import { createRouter } from '../../trpc';

export const fileRouter = createRouter({
    createFile,
});
