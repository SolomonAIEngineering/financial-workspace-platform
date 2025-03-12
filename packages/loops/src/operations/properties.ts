import { LoopsClient } from 'loops';

/**
 * Get all mailing lists from Loops
 * 
 * @param client - The Loops client instance
 * @returns Array of mailing list objects from the Loops API
 */
export async function getMailingLists(
    client: LoopsClient
): Promise<any[]> {
    return client.getMailingLists();
}

/**
 * Create a contact property in Loops
 * 
 * @param client - The Loops client instance
 * @param name - Name of the property
 * @param type - Type of the property (string, number, boolean, date)
 * @param description - Optional description of the property
 * @returns The response from the Loops API
 */
export async function createContactProperty(
    client: LoopsClient,
    name: string,
    type: 'string' | 'number' | 'boolean' | 'date',
    description?: string
): Promise<any> {
    return client.createContactProperty(name, type);
} 