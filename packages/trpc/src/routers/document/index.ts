import { createRouter } from '../../trpc'
import { archive } from './handlers/archive'
import { create } from './handlers/create'
import { deleteDocument } from './handlers/delete'
import { document } from './handlers/document'
import { documents } from './handlers/documents'
import { restore } from './handlers/restore'
import { search } from './handlers/search'
import { togglePin } from './handlers/toggle-pin'
import { toggleTemplate } from './handlers/toggle-template'
import { trash } from './handlers/trash'
import { update } from './handlers/update'
import { updateStatus } from './handlers/update-status'
import { updateTags } from './handlers/update-tags'

/**
 * Document router with all document-related procedures.
 *
 * Includes:
 * - CRUD operations for documents
 * - Document status and metadata management
 * - Document search and filtering
 */
export const documentRouter = createRouter({
  // Document mutations
  archive,
  create,
  delete: deleteDocument,
  restore,
  togglePin,
  toggleTemplate,
  update,
  updateStatus,
  updateTags,

  // Document queries
  document,
  documents,
  search,
  trash,
})
