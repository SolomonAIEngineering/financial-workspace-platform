import { z } from 'zod'

/**
 * Schema definitions for version router inputs and outputs
 */

export const createVersionSchema = z.object({
  documentId: z.string(),
})

/**
 * Type for create version input
 */
export type CreateVersionInput = z.infer<typeof createVersionSchema>

export const deleteVersionSchema = z.object({
  id: z.string(),
})

/**
 * Type for delete version input
 */
export type DeleteVersionInput = z.infer<typeof deleteVersionSchema>

export const restoreVersionSchema = z.object({
  id: z.string(),
})

/**
 * Type for restore version input
 */
export type RestoreVersionInput = z.infer<typeof restoreVersionSchema>

export const documentVersionSchema = z.object({
  documentVersionId: z.string(),
})

/**
 * Type for document version input
 */
export type DocumentVersionInput = z.infer<typeof documentVersionSchema>

export const documentVersionsSchema = z.object({
  documentId: z.string(),
})

/**
 * Type for document versions input
 */
export type DocumentVersionsInput = z.infer<typeof documentVersionsSchema>

/**
 * Schema defining the structure of a document version response
 */
export const documentVersionResponseSchema = z.object({
  id: z.string(),
  contentRich: z.any(),
  createdAt: z.date(),
  documentId: z.string(),
  title: z.string(),
  userId: z.string(),
  username: z.string(),
})

/**
 * Type for document version response
 */
export type DocumentVersionResponse = z.infer<
  typeof documentVersionResponseSchema
>

/**
 * Schema defining the structure of a document version list item
 */
export const documentVersionItemSchema = z.object({
  id: z.string(),
  contentRich: z.any(),
  createdAt: z.date(),
  title: z.string(),
  profileImageUrl: z.string().nullable(),
  userId: z.string(),
  username: z.string(),
})

/**
 * Type for document version list item
 */
export type DocumentVersionItem = z.infer<typeof documentVersionItemSchema>

/**
 * Schema defining the structure of document versions response
 */
export const documentVersionsResponseSchema = z.object({
  versions: z.array(documentVersionItemSchema),
})

/**
 * Type for document versions response
 */
export type DocumentVersionsResponse = z.infer<
  typeof documentVersionsResponseSchema
>
