import { app } from './handlers/app';
import { createRouter } from '../../trpc';

/**
 * Router for layout-related procedures.
 * Handles fetching layout information including user and team data.
 */
export const layoutRouter = createRouter({
    app,
}); 