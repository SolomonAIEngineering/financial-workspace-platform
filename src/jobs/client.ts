import { TriggerClient } from '@trigger.dev/sdk';

// Initialize the TriggerClient with your API key and application ID
export const client = new TriggerClient({
  id: process.env.TRIGGER_API_ID || 'smb-financial-management-platform',
  apiKey: process.env.TRIGGER_API_KEY || '',
  apiUrl: process.env.TRIGGER_API_URL,
  verbose: process.env.TRIGGER_VERBOSE === 'true',
});
