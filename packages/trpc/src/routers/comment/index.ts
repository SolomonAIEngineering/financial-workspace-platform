/**
 * TRPC Router for comment and discussion management
 *
 * This router provides endpoints for creating and managing comments and discussions
 * within the platform.
 */

import {
  createComment,
  createDiscussion,
  createDiscussionWithComment,
  deleteComment,
  discussions,
  get,
  getByDiscussion,
  removeDiscussion,
  resolveDiscussion,
  updateComment
} from './handlers'

import { createRouter } from '../../trpc'

// Create and export the comment router
export const commentRouter = createRouter({
  create: createComment,
  update: updateComment,
  delete: deleteComment,
  get,
  getByDiscussion,
  resolveDiscussion,
  removeDiscussion,
  createDiscussion,
  createDiscussionWithComment,
  discussions
})
