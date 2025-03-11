import { z } from 'zod'

// Common parameters for business metrics queries
export const businessParams = z.object({
  teamId: z.string(),
  start: z.number().default(() => {
    // Default to 12 months ago
    const date = new Date()
    date.setMonth(date.getMonth() - 12)
    return date.getTime()
  }),
  end: z.number().default(() => Date.now()),
  limit: z.number().optional().default(12),
})
