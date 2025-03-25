'use server';

import { PlainClient, ThreadFieldSchemaType } from '@team-plain/typescript-sdk';

import { authActionClient } from '../safe-action';
import { sendSupportSchema } from './schema';

/**
 * Initialize the Plain client with the API key for customer support platform
 * integration
 *
 * @constant {PlainClient} client
 */
const client = new PlainClient({
  apiKey: process.env.PLAIN_API_KEY || '',
});

const mapToPriorityNumber = (priority: string) => {
  switch (priority) {
    case 'low':
      return 0;
    case 'normal':
      return 1;
    case 'high':
      return 2;
    case 'urgent':
      return 3;
    default:
      return 1;
  }
};

export const sendSupportAction = authActionClient
  .schema(sendSupportSchema)
  .action(async ({ parsedInput: data, ctx: { user } }) => {
    const customer = await client.upsertCustomer({
      identifier: {
        emailAddress: user.email,
      },
      onCreate: {
        fullName: user.full_name,
        externalId: user.id,
        email: {
          email: user.email,
          isVerified: true,
        },
      },
      onUpdate: {},
    });

    const response = await client.createThread({
      title: data.subject,
      description: data.message,
      priority: mapToPriorityNumber(data.priority),
      customerIdentifier: {
        customerId: customer.data?.customer.id,
      },
      // Support
      labelTypeIds: ['lt_01JN2Y1BFY6FXD90REETNPWFJA'],
      components: [
        {
          componentText: {
            text: data.message,
          },
        },
      ],
      threadFields: data.url
        ? [
            {
              type: ThreadFieldSchemaType.String,
              key: 'url',
              stringValue: data.url,
            },
          ]
        : undefined,
    });

    return response;
  });
