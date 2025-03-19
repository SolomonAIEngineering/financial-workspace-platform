import {
  ContactProperties,
  DeleteContactInput,
  FindContactInput,
  MailingLists,
  UpdateContactInput,
} from '../schema'

import { LoopsClient } from 'loops'

/**
 * Create or update a contact in Loops
 *
 * @param client - The Loops client instance
 * @param email - Email address of the contact
 * @param contactProperties - Optional properties for the contact
 * @param mailingLists - Optional mailing list subscriptions
 * @returns The response from the Loops API
 */
export async function createContact(
  client: LoopsClient,
  email: string,
  contactProperties?: ContactProperties,
  mailingLists?: MailingLists,
): Promise<any> {
  return client.createContact(email, contactProperties, mailingLists)
}

/**
 * Find a contact in Loops
 *
 * @param client - The Loops client instance
 * @param input - Input containing email or userId to find the contact
 * @returns The response from the Loops API
 */
export async function findContact(
  client: LoopsClient,
  input: FindContactInput,
): Promise<any> {
  return client.findContact({
    email: input.email,
    userId: input.userId,
  })
}

/**
 * Update a contact in Loops
 *
 * @param client - The Loops client instance
 * @param input - Input containing email or userId and properties to update
 * @returns The response from the Loops API
 */
export async function updateContact(
  client: LoopsClient,
  input: UpdateContactInput,
): Promise<any> {
  return client.updateContact(
    input.email || '',
    input.contactProperties || {},
    input.mailingLists,
  )
}

/**
 * Delete a contact in Loops
 *
 * @param client - The Loops client instance
 * @param input - Input containing email or userId to delete the contact
 * @returns The response from the Loops API
 */
export async function deleteContact(
  client: LoopsClient,
  input: DeleteContactInput,
): Promise<any> {
  const response = await client.deleteContact({
    email: input.email,
    userId: input.userId,
  })

  return response
}
