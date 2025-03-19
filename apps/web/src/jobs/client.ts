import { TriggerClient } from '@trigger.dev/sdk';

/**
 * This client is used to interact with the Trigger.dev API You can use it in
 * your application to trigger jobs
 */

// Determine environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

// Validate required environment variables
if (!process.env.TRIGGER_API_KEY && !isTest) {
  console.error('TRIGGER_API_KEY environment variable is required');
  // Don't throw in production to prevent crashes, but log the error
  if (!isProduction) {
    throw new Error('TRIGGER_API_KEY environment variable is required');
  }
}

export const client = new TriggerClient({
  id: process.env.TRIGGER_CLIENT_ID || 'smb-financial-management-platform',
  apiKey: process.env.TRIGGER_SECRET_KEY || '',
  // More verbose logging in development, minimal in production
  logLevel: isDevelopment ? 'debug' : isTest ? 'error' : 'info',
  // Optional: custom endpoint URL if needed
  // apiUrl: process.env.TRIGGER_API_URL,
});
