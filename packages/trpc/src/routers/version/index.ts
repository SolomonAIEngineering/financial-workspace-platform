/**
 * TRPC Router for document version management
 *
 * This router provides endpoints for creating, deleting, and restoring document versions,
 * as well as retrieving version information.
 */

// Import router creator and handlers
import { createRouter } from '../../trpc'
import { createVersion } from './handlers/create-version'
import { deleteVersion } from './handlers/delete-version'
import { documentVersion } from './handlers/document-version'
import { documentVersions } from './handlers/document-versions'
import { restoreVersion } from './handlers/restore-version'

// Create and export the version router
export const versionRouter = createRouter({
  createVersion,
  deleteVersion,
  documentVersion,
  documentVersions,
  restoreVersion,
})
