import { z } from 'zod';

/**
 * Schema for contact properties when creating contacts in Loops
 * This includes both default properties and custom properties
 */
export const contactPropertiesSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    // Add any other default properties here
}).and(
    // Allow any additional custom properties
    z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
);

/**
 * Schema for mailing lists when creating or updating contacts in Loops
 */
export const mailingListsSchema = z.record(z.string(), z.boolean());

/**
 * Schema for creating a contact in Loops
 */
export const createContactSchema = z.object({
    email: z.string().email('Invalid email address'),
    contactProperties: contactPropertiesSchema.optional(),
    mailingLists: mailingListsSchema.optional().default({
        [process.env.USER_BASE_MAILING_LIST || '']: true,
        [process.env.FEATURE_LAUNCH_MAIN_LIST || '']: true,
    }),
});

/**
 * Input type for createContact
 */
export type CreateContactInput = z.infer<typeof createContactSchema>;

/**
 * Type for contact properties
 */
export type ContactProperties = z.infer<typeof contactPropertiesSchema>;

/**
 * Type for mailing lists
 */
export type MailingLists = z.infer<typeof mailingListsSchema>;

/**
 * Schema for finding a contact in Loops
 */
export const findContactSchema = z.object({
    email: z.string().email('Invalid email address').optional(),
    userId: z.string().optional(),
}).refine(
    (data) => data.email || data.userId,
    {
        message: 'Either email or userId must be provided',
        path: ['email']
    }
);

/**
 * Input type for findContact
 */
export type FindContactInput = z.infer<typeof findContactSchema>;

/**
 * Schema for updating a contact in Loops
 */
export const updateContactSchema = z.object({
    email: z.string().email('Invalid email address').optional(),
    userId: z.string().optional(),
    contactProperties: contactPropertiesSchema.optional(),
    mailingLists: mailingListsSchema.optional(),
}).refine(
    (data) => data.email || data.userId,
    {
        message: 'Either email or userId must be provided',
        path: ['email']
    }
);

/**
 * Input type for updateContact
 */
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

/**
 * Schema for deleting a contact in Loops
 */
export const deleteContactSchema = z.object({
    email: z.string().email('Invalid email address').optional(),
    userId: z.string().optional(),
}).refine(
    (data) => data.email || data.userId,
    {
        message: 'Either email or userId must be provided',
        path: ['email']
    }
);

/**
 * Input type for deleteContact
 */
export type DeleteContactInput = z.infer<typeof deleteContactSchema>;

/**
 * Schema for creating a contact property in Loops
 */
export const createContactPropertySchema = z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'date']),
    description: z.string().optional(),
});

/**
 * Schema for sending an event in Loops
 */
export const sendEventSchema = z.object({
    email: z.string().email('Invalid email address').optional(),
    userId: z.string().optional(),
    eventName: z.string(),
    contactProperties: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
    eventProperties: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
}).refine(
    (data) => data.email || data.userId,
    {
        message: 'Either email or userId must be provided',
        path: ['email']
    }
);

/**
 * Input type for sendEvent
 */
export type SendEventInput = z.infer<typeof sendEventSchema>;

/**
 * Schema for sending a transactional email via Loops
 */
export const sendTransactionalEmailSchema = z.object({
    email: z.string().email('Invalid email address'),
    transactionalId: z.string(),
    dataVariables: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

/**
 * Input type for sendTransactionalEmail
 */
export type SendTransactionalEmailInput = z.infer<typeof sendTransactionalEmailSchema>; 