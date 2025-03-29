import { z } from 'zod'

/**
 * Maximum allowed length for document title
 */
export const MAX_TITLE_LENGTH = 256

/**
 * Maximum allowed length for document content
 */
export const MAX_CONTENT_LENGTH = 1_000_000 // 1MB of text

/**
 * Maximum allowed length for document icon
 */
export const MAX_ICON_LENGTH = 100

/**
 * Maximum allowed length for document tags
 */
export const MAX_TAG_LENGTH = 50

/**
 * Maximum number of tags allowed per document
 */
export const MAX_TAGS = 10

/**
 * Document status constants
 */
export const DOCUMENT_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'archived',
] as const

/**
 * Document status type
 */
export type DocumentStatus = (typeof DOCUMENT_STATUS)[number]

/**
 * Schema for archiving a document
 */
export const archiveDocumentSchema = z.object({
  id: z.string(),
})

/**
 * Type for archive document input
 */
export type ArchiveDocumentInput = z.infer<typeof archiveDocumentSchema>

/**
 * Schema for creating a document
 */
export const createDocumentSchema = z.object({
  contentRich: z.any().optional(),
  parentDocumentId: z.string().optional(),
  title: z.string().max(MAX_TITLE_LENGTH, 'Title is too long').optional(),
})

/**
 * Type for create document input
 */
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>

/**
 * Schema for deleting a document
 */
export const deleteDocumentSchema = z.object({
  id: z.string(),
})

/**
 * Type for delete document input
 */
export type DeleteDocumentInput = z.infer<typeof deleteDocumentSchema>

/**
 * Schema for restoring a document
 */
export const restoreDocumentSchema = z.object({
  id: z.string(),
})

/**
 * Type for restore document input
 */
export type RestoreDocumentInput = z.infer<typeof restoreDocumentSchema>

/**
 * Schema for toggling document pin status
 */
export const togglePinSchema = z.object({
  id: z.string(),
})

/**
 * Type for toggle pin input
 */
export type TogglePinInput = z.infer<typeof togglePinSchema>

/**
 * Schema for toggling document template status
 */
export const toggleTemplateSchema = z.object({
  id: z.string(),
})

/**
 * Type for toggle template input
 */
export type ToggleTemplateInput = z.infer<typeof toggleTemplateSchema>

/**
 * Schema for updating a document
 */
export const updateDocumentSchema = z.object({
  id: z.string(),
  content: z.string().max(MAX_CONTENT_LENGTH, 'Content is too long').optional(),
  contentRich: z.any().optional(),
  coverImage: z.string().max(500).optional(),
  fullWidth: z.boolean().optional(),
  icon: z.string().max(MAX_ICON_LENGTH).nullish(),
  isPublished: z.boolean().optional(),
  lockPage: z.boolean().optional(),
  smallText: z.boolean().optional(),
  textStyle: z.enum(['DEFAULT', 'SERIF', 'MONO']).optional(),
  title: z.string().max(MAX_TITLE_LENGTH, 'Title is too long').optional(),
  toc: z.boolean().optional(),
})

/**
 * Type for update document input
 */
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>

/**
 * Schema for updating document status
 */
export const updateStatusSchema = z.object({
  id: z.string(),
  status: z.enum(DOCUMENT_STATUS),
})

/**
 * Type for update status input
 */
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>

/**
 * Schema for updating document tags
 */
export const updateTagsSchema = z.object({
  id: z.string(),
  tags: z
    .array(z.string().max(MAX_TAG_LENGTH))
    .max(MAX_TAGS, 'Maximum 10 tags allowed'),
})

/**
 * Type for update tags input
 */
export type UpdateTagsInput = z.infer<typeof updateTagsSchema>

/**
 * Schema for retrieving a document
 */
export const documentSchema = z.object({
  id: z.string(),
})

/**
 * Type for document input
 */
export type DocumentInput = z.infer<typeof documentSchema>

/**
 * Schema for retrieving documents
 */
export const documentsSchema = z.object({
  parentDocumentId: z.string().optional(),
})

/**
 * Type for documents input
 */
export type DocumentsInput = z.infer<typeof documentsSchema>

/**
 * Schema for searching documents
 */
export const searchSchema = z.object({
  q: z.string(),
})

/**
 * Type for search input
 */
export type SearchInput = z.infer<typeof searchSchema>

/**
 * Schema for retrieving trashed documents
 */
export const trashSchema = z.object({
  q: z.string().optional(),
})

/**
 * Type for trash input
 */
export type TrashInput = z.infer<typeof trashSchema>
