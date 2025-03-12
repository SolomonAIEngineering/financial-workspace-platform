import { LoopsClient } from 'loops';

// Initialize the Loops client with API key from environment variables
export const loops = new LoopsClient(process.env.LOOPS_API_KEY || '');

// Define mailing list IDs from environment variables
export const USER_BASE_MAILING_LIST = process.env.USER_BASE_MAILING_LIST;
export const FEATURE_LAUNCH_MAIN_LIST = process.env.FEATURE_LAUNCH_MAIN_LIST;
