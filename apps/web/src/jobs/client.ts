import { TriggerClient } from '@trigger.dev/sdk';

/**
 * This client is used to interact with the Trigger.dev API You can use it in
 * your application to trigger jobs
 */
export const client = new TriggerClient({
  id: 'smb-financial-management-platform',
  apiKey: process.env.TRIGGER_API_KEY || '',
  apiUrl: process.env.TRIGGER_API_URL,
});
