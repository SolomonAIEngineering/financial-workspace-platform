/**
 * TRPC Router for comment and discussion management
 *
 * This router provides endpoints for creating and managing comments and discussions
 * within the platform.
 */

// Import all handlers
import { createRouter } from '../../trpc';
import { createComment } from './handlers/create-comment';
import { createDiscussion } from './handlers/create-discussion';
import { createDiscussionWithComment } from './handlers/create-discussion-with-comment';
import { deleteComment } from './handlers/delete-comment';
import { discussions } from './handlers/discussions';
import { removeDiscussion } from './handlers/remove-discussion';
import { resolveDiscussion } from './handlers/resolve-discussion';
import { updateComment } from './handlers/update-comment';

// Create and export the comment router
export const commentRouter = createRouter({
  createComment,
  createDiscussion,
  createDiscussionWithComment,
  deleteComment,
  discussions,
  removeDiscussion,
  resolveDiscussion,
  updateComment,
});
