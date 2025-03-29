import { z } from 'zod'

export const CreateFileSchemaRequest = z.object({
  id: z.string(),
  appUrl: z.string(),
  documentId: z.string(),
  size: z.number(),
  type: z.string(),
  url: z.string(),
})

export type CreateFileSchemaRequest = z.infer<typeof CreateFileSchemaRequest>
