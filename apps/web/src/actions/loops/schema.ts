import { z } from 'zod';

/**
 * Schema for contact properties when creating contacts in Loops This includes
 * both default properties and custom properties
 */
export const contactPropertiesSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    // Add any other default properties here
  })
  .and(
    // Allow any additional custom properties
    z.record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean(), z.null()])
    )
  );

/**
 * Schema for mailing list subscriptions when creating contacts in Loops Keys
 * are mailing list IDs, values are boolean subscription status
 */
export const mailingListsSchema = z.record(z.string(), z.boolean());

/** Schema for creating a contact in Loops */
export const createContactSchema = z.object({
  email: z.string().email('Invalid email address'),
  contactProperties: contactPropertiesSchema.optional(),
  mailingLists: mailingListsSchema.optional().default({
    [process.env.USER_BASE_MAILING_LIST || '']: true,
    [process.env.FEATURE_LAUNCH_MAIN_LIST || '']: true,
  }),
});

/** Schema for finding a contact in Loops */
export const findContactSchema = z
  .object({
    email: z.string().email('Invalid email address').optional(),
    userId: z.string().optional(),
  })
  .refine((data) => data.email || data.userId, {
    message: 'Either email or userId must be provided',
  });

/** Schema for updating a contact in Loops */
export const updateContactSchema = z.object({
  email: z.string().email('Invalid email address'),
  contactProperties: contactPropertiesSchema.optional(),
  mailingLists: mailingListsSchema.optional(),
});

/** Schema for deleting a contact in Loops */
export const deleteContactSchema = z
  .object({
    email: z.string().email('Invalid email address').optional(),
    userId: z.string().optional(),
  })
  .refine((data) => data.email || data.userId, {
    message: 'Either email or userId must be provided',
  });

/** Schema for creating a contact property in Loops */
export const createContactPropertySchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'date']),
  description: z.string().optional(),
});

/** Schema for sending an event to Loops */
export const sendEventSchema = z
  .object({
    email: z.string().email('Invalid email address').optional(),
    userId: z.string().optional(),
    eventName: z.string(),
    contactProperties: contactPropertiesSchema.optional(),
    eventProperties: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
      .optional(),
  })
  .refine((data) => data.email || data.userId, {
    message: 'Either email or userId must be provided',
  });

/** Schema for sending a transactional email via Loops */
export const sendTransactionalEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  transactionalId: z.string(),
  dataVariables: z
    .record(z.string(), z.union([z.string(), z.number()]))
    .optional(),
});

/** Schema for testing the Loops API key */
export const testApiKeySchema = z.object({});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type FindContactInput = z.infer<typeof findContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type DeleteContactInput = z.infer<typeof deleteContactSchema>;
export type CreateContactPropertyInput = z.infer<
  typeof createContactPropertySchema
>;
export type SendEventInput = z.infer<typeof sendEventSchema>;
export type SendTransactionalEmailInput = z.infer<
  typeof sendTransactionalEmailSchema
>;
export type ContactProperties = z.infer<typeof contactPropertiesSchema>;
export type MailingLists = z.infer<typeof mailingListsSchema>;
