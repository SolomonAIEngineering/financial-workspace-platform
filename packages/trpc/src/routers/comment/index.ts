/**
 * TRPC Router for comment and discussion management
 *
 * This router provides endpoints for creating and managing comments and discussions
 * within the platform.
 */

import { create } from './handlers/create'
import { deleteComment } from './handlers/delete'
import { get } from './handlers/get'
import { getByDiscussion } from './handlers/get-by-discussion'
// Import all handlers
import { router } from '../../trpc'
import { update } from './handlers/update'

// Create and export the comment router
export const commentRouter = router({
  create,
  update,
  delete: deleteComment,
  get,
  getByDiscussion,
})
