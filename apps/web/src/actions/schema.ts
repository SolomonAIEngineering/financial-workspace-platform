import { z } from 'zod';

/**
 * Defines the available feedback type categories
 *
 * @enum {string} FeedbackType
 * @value 'FEATURE' - Feature request or enhancement suggestion
 * @value 'BUG' - Bug report or issue notification
 * @value 'SUPPORT' - Support inquiry or help request
 * @value 'GENERAL' - General feedback without specific categorization
 */
export const FeedbackType = z.enum(['FEATURE', 'BUG', 'SUPPORT', 'GENERAL']);

export type FeedbackType = z.infer<typeof FeedbackType>;

/**
 * Zod schema for validating feedback submissions This schema is used by the
 * sendFeedbackAction to validate client input
 *
 * @property {string} feedback - The feedback content provided by the user
 *
 *   - Required field (minimum length of 1 character)
 *   - Error message: "Feedback cannot be empty"
 *
 * @property {FeedbackType} feedbackType - The category of feedback
 *
 *   - Defaults to 'GENERAL' if not specified
 *   - Must be one of: 'FEATURE', 'BUG', 'SUPPORT', 'GENERAL'
 *
 * @schema sendFeedbackSchema
 */
export const sendFeedbackSchema = z.object({
  feedback: z.string().min(1, 'Feedback cannot be empty'),
  feedbackType: FeedbackType.default('GENERAL'),
});
