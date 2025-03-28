import { z } from 'zod'

/**
 * Maximum allowed length for comment content
 */
export const MAX_COMMENT_LENGTH = 50_000 // 50KB for rich content

/**
 * Maximum allowed length for document content in discussions
 */
export const MAX_DOCUMENT_CONTENT_LENGTH = 1000 // Reasonable length for highlighted text

/**
 * Schema for creating a comment
 */
export const createCommentSchema = z.object({
  contentRich: z.array(z.any()).optional(),
  discussionId: z.string(),
})

/**
 * Type for creating a comment
 */
export type CreateCommentInput = z.infer<typeof createCommentSchema>

/**
 * Schema for creating a discussion
 */
export const createDiscussionSchema = z.object({
  documentContent: z
    .string()
    .min(1, 'Document content cannot be empty')
    .max(MAX_DOCUMENT_CONTENT_LENGTH, 'Selected text is too long'),
  documentId: z.string(),
})

/**
 * Type for creating a discussion
 */
export type CreateDiscussionInput = z.infer<typeof createDiscussionSchema>

/**
 * Schema for creating a discussion with a comment
 */
export const createDiscussionWithCommentSchema = z.object({
  contentRich: z.array(z.any()).optional(),
  discussionId: z.string().optional(),
  documentContent: z
    .string()
    .min(1, 'Document content cannot be empty')
    .max(MAX_DOCUMENT_CONTENT_LENGTH, 'Selected text is too long'),
  documentId: z.string(),
})

/**
 * Type for creating a discussion with a comment
 */
export type CreateDiscussionWithCommentInput = z.infer<
  typeof createDiscussionWithCommentSchema
>

/**
 * Schema for deleting a comment
 */
export const deleteCommentSchema = z.object({
  id: z.string(),
  discussionId: z.string(),
})

/**
 * Type for deleting a comment
 */
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>

/**
 * Schema for removing a discussion
 */
export const removeDiscussionSchema = z.object({
  id: z.string(),
})

/**
 * Type for removing a discussion
 */
export type RemoveDiscussionInput = z.infer<typeof removeDiscussionSchema>

/**
 * Schema for resolving a discussion
 */
export const resolveDiscussionSchema = z.object({
  id: z.string(),
})

/**
 * Type for resolving a discussion
 */
export type ResolveDiscussionInput = z.infer<typeof resolveDiscussionSchema>

/**
 * Schema for updating a comment
 */
export const updateCommentSchema = z.object({
  id: z.string(),
  contentRich: z.array(z.any()).optional(),
  discussionId: z.string(),
  isEdited: z.boolean().optional(),
})

/**
 * Type for updating a comment
 */
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>

/**
 * Schema for fetching discussions
 */
export const discussionsSchema = z.object({
  documentId: z.string(),
})

/**
 * Type for fetching discussions
 */
export type DiscussionsInput = z.infer<typeof discussionsSchema>

export const getCommentSchema = z.object({
  id: z.string(),
})

export type GetCommentInput = z.infer<typeof getCommentSchema>

export const getCommentsByDiscussionSchema = z.object({
  discussionId: z.string(),
})

export type GetCommentsByDiscussionInput = z.infer<
  typeof getCommentsByDiscussionSchema
>
