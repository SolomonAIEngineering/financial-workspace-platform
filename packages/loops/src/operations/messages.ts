import { SendEventInput, SendTransactionalEmailInput } from '../schema'

import { LoopsClient } from 'loops'

/**
 * Send an event to Loops
 *
 * @param client - The Loops client instance
 * @param input - Input containing event details
 * @returns The response from the Loops API
 */
export async function sendEvent(
  client: LoopsClient,
  input: SendEventInput,
): Promise<any> {
  return client.sendEvent({
    email: input.email,
    userId: input.userId,
    eventName: input.eventName,
    contactProperties: input.contactProperties,
    eventProperties: input.eventProperties as
      | Record<string, string | number | boolean>
      | undefined,
  })
}

/**
 * Send a transactional email via Loops
 *
 * @param client - The Loops client instance
 * @param input - Input containing email, template ID, and data variables
 * @returns The response from the Loops API
 */
export async function sendTransactionalEmail(
  client: LoopsClient,
  input: SendTransactionalEmailInput,
): Promise<any> {
  return client.sendTransactionalEmail({
    email: input.email,
    transactionalId: input.transactionalId,
    dataVariables: input.dataVariables as
      | Record<string, string | number>
      | undefined,
  })
}
