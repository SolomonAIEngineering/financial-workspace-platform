import { z } from "zod";
export const sendSupportSchema = z.object({
    subject: z.string(),
    message: z.string(),
    priority: z.enum(["low", "normal", "high", "urgent"]),
    type: z.string(),
    url: z.string().optional(),
});
