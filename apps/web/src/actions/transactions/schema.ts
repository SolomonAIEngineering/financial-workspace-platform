import { z } from 'zod';

/**
 * Schema for validating sync transactions request
 */
export const syncTransactionsSchema = z.object({
    accessToken: z.string().min(1, "Access token is required"),
    itemId: z.string().min(1, "Item ID is required"),
    institutionId: z.string().min(1, "Institution ID is required"),
    userId: z.string().min(1, "User ID is required"),
}); 