import { z } from 'zod'

// Not proud of the below but it's a way to deal with Infinity when returning JSON.
export const ZLimitsSchema = z.object({
  documents: z
    .preprocess((v) => (v === null ? Infinity : Number(v)), z.number())
    .optional()
    .default(0),
  recipients: z
    .preprocess((v) => (v === null ? Infinity : Number(v)), z.number())
    .optional()
    .default(0),
  directTemplates: z
    .preprocess((v) => (v === null ? Infinity : Number(v)), z.number())
    .optional()
    .default(0),
  teams: z
    .preprocess((v) => (v === null ? Infinity : Number(v)), z.number())
    .optional()
    .default(0),
  teamMembers: z
    .preprocess((v) => (v === null ? Infinity : Number(v)), z.number())
    .optional()
    .default(0),
  storageGb: z
    .preprocess((v) => (v === null ? Infinity : Number(v)), z.number())
    .optional()
    .default(0),
  reports: z
    .preprocess((v) => (v === null ? Infinity : Number(v)), z.number())
    .optional()
    .default(0),
  invoices: z
    .preprocess((v) => (v === null ? Infinity : Number(v)), z.number())
    .optional()
    .default(0),
  bankAccounts: z
    .preprocess((v) => (v === null ? Infinity : Number(v)), z.number())
    .optional()
    .default(0),
  integrations: z
    .preprocess((v) => (v === null ? Infinity : Number(v)), z.number())
    .optional()
    .default(0),
  apiRequestsPerDay: z
    .preprocess((v) => (v === null ? Infinity : Number(v)), z.number())
    .optional()
    .default(0),
  maxFileSizeMb: z
    .preprocess((v) => (v === null ? Infinity : Number(v)), z.number())
    .optional()
    .default(0),
  apps: z
    .preprocess((v) => (v === null ? Infinity : Number(v)), z.number())
    .optional()
    .default(0),
  transactionHistoryDays: z
    .preprocess((v) => (v === null ? Infinity : Number(v)), z.number())
    .optional()
    .default(0),
  customCategories: z
    .preprocess((v) => (v === null ? Infinity : Number(v)), z.number())
    .optional()
    .default(0),
  trackerProjects: z
    .preprocess((v) => (v === null ? Infinity : Number(v)), z.number())
    .optional()
    .default(0),
})

export type TLimitsSchema = z.infer<typeof ZLimitsSchema>

export const ZLimitsResponseSchema = z.object({
  quota: ZLimitsSchema,
  remaining: ZLimitsSchema,
})

export type TLimitsResponseSchema = z.infer<typeof ZLimitsResponseSchema>

export const ZLimitsErrorResponseSchema = z.object({
  error: z.string(),
})

export type TLimitsErrorResponseSchema = z.infer<
  typeof ZLimitsErrorResponseSchema
>
